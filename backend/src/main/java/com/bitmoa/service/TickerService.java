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

import java.time.Duration;
import java.util.List;

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

    public void broadcastTickers() {
        List<Coin> coins = coinRepository.findAllByIsActiveTrue();
        if (coins.isEmpty()) {
            return;
        }

        List<String> markets = coins.stream()
                .map(Coin::getMarket)
                .toList();

        try {
            List<TickerResponse> allTickers = new java.util.ArrayList<>();
            for (int i = 0; i < markets.size(); i += BATCH_SIZE) {
                List<String> chunk = markets.subList(i, Math.min(i + BATCH_SIZE, markets.size()));
                List<TickerResponse> tickers = upbitClient.fetchTickers(chunk);
                if (tickers != null) {
                    allTickers.addAll(tickers);
                }
            }

            for (TickerResponse ticker : allTickers) {
                redisTemplate.opsForValue().set(
                        TICKER_KEY_PREFIX + ticker.market(),
                        ticker,
                        TICKER_TTL
                );
            }

            messagingTemplate.convertAndSend("/topic/ticker/all", allTickers);

            for (TickerResponse ticker : allTickers) {
                messagingTemplate.convertAndSend("/topic/ticker/" + ticker.market(), ticker);
            }
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
}
