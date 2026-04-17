package com.bitmoa.service;

import com.bitmoa.client.UpbitClient;
import com.bitmoa.dto.response.TickerResponse;
import com.bitmoa.entity.Coin;
import com.bitmoa.repository.CoinRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
@RequiredArgsConstructor
public class TickerService {

    private final CoinRepository coinRepository;
    private final UpbitClient upbitClient;
    private final RedisTemplate<String, Object> redisTemplate;
    private final SimpMessagingTemplate messagingTemplate;

    private static final String TICKER_KEY_PREFIX = "ticker:";
    private static final Duration TICKER_TTL = Duration.ofSeconds(5);

    private static final int BATCH_SIZE = 100;
    private static final int FETCH_CONCURRENCY = 4;

    private final Map<String, BigDecimal> lastTradePrices = new ConcurrentHashMap<>();

    public void broadcastTickers() {
        List<Coin> coins = coinRepository.findAllByIsActiveTrue();
        if (coins.isEmpty()) {
            return;
        }

        List<String> markets = coins.stream()
                .map(Coin::getMarket)
                .toList();

        try {
            List<List<String>> chunks = partition(markets, BATCH_SIZE);
            List<TickerResponse> allTickers = upbitClient.fetchTickersBatched(chunks, FETCH_CONCURRENCY);
            if (allTickers == null || allTickers.isEmpty()) {
                return;
            }

            List<TickerResponse> delta = new ArrayList<>();
            for (TickerResponse ticker : allTickers) {
                BigDecimal prev = lastTradePrices.get(ticker.market());
                BigDecimal cur = ticker.tradePrice();
                if (prev == null || cur == null || prev.compareTo(cur) != 0) {
                    delta.add(ticker);
                    if (cur != null) {
                        lastTradePrices.put(ticker.market(), cur);
                    }
                }
            }

            if (delta.isEmpty()) {
                return;
            }

            for (TickerResponse ticker : delta) {
                redisTemplate.opsForValue().set(
                        TICKER_KEY_PREFIX + ticker.market(),
                        ticker,
                        TICKER_TTL
                );
            }

            messagingTemplate.convertAndSend(
                    "/topic/ticker/delta",
                    Map.of(
                            "timestamp", System.currentTimeMillis(),
                            "tickers", delta
                    )
            );
        } catch (Exception e) {
            log.error("시세 브로드캐스트 실패: {}", e.getMessage());
        }
    }

    public TickerResponse getCachedTicker(String market) {
        Object cached = redisTemplate.opsForValue().get(TICKER_KEY_PREFIX + market);
        if (cached instanceof TickerResponse ticker) {
            return ticker;
        }
        return upbitClient.fetchTicker(market);
    }

    private List<List<String>> partition(List<String> source, int size) {
        List<List<String>> chunks = new ArrayList<>();
        for (int i = 0; i < source.size(); i += size) {
            chunks.add(source.subList(i, Math.min(i + size, source.size())));
        }
        return chunks;
    }
}
