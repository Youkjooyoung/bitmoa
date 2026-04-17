package com.bitmoa.service;

import com.bitmoa.client.UpbitClient;
import com.bitmoa.dto.response.CandleResponse;
import com.bitmoa.dto.response.CoinResponse;
import com.bitmoa.dto.response.OrderbookResponse;
import com.bitmoa.dto.response.TickerResponse;
import com.bitmoa.dto.response.TradeTickResponse;
import com.bitmoa.entity.Coin;
import com.bitmoa.exception.BusinessException;
import com.bitmoa.exception.ErrorCode;
import com.bitmoa.repository.CoinRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CoinService {

    private final CoinRepository coinRepository;
    private final UpbitClient upbitClient;
    private final RedisTemplate<String, Object> redisTemplate;

    private static final String TICKER_KEY_PREFIX = "ticker:";
    private static final String ORDERBOOK_KEY_PREFIX = "orderbook:";
    private static final Duration TICKER_TTL = Duration.ofSeconds(5);
    private static final Duration ORDERBOOK_TTL = Duration.ofSeconds(1);

    @Transactional(readOnly = true)
    public List<CoinResponse> findAll() {
        return coinRepository.findAllByIsActiveTrue().stream()
                .map(CoinResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public CoinResponse findByMarket(String market) {
        Coin coin = coinRepository.findByMarket(market)
                .orElseThrow(() -> new BusinessException(ErrorCode.COIN_NOT_FOUND));
        return CoinResponse.from(coin);
    }

    public TickerResponse getTicker(String market) {
        Object cached = redisTemplate.opsForValue().get(TICKER_KEY_PREFIX + market);
        if (cached instanceof TickerResponse ticker) {
            return ticker;
        }
        TickerResponse fresh = upbitClient.fetchTicker(market);
        redisTemplate.opsForValue().set(TICKER_KEY_PREFIX + market, fresh, TICKER_TTL);
        return fresh;
    }

    public List<TickerResponse> getTickers(List<String> markets) {
        return upbitClient.fetchTickers(markets);
    }

    public OrderbookResponse getOrderbook(String market) {
        Object cached = redisTemplate.opsForValue().get(ORDERBOOK_KEY_PREFIX + market);
        if (cached instanceof OrderbookResponse orderbook) {
            return orderbook;
        }
        OrderbookResponse fresh = upbitClient.fetchOrderbook(market);
        redisTemplate.opsForValue().set(ORDERBOOK_KEY_PREFIX + market, fresh, ORDERBOOK_TTL);
        return fresh;
    }

    public List<CandleResponse> getCandles(String market, String type, int unit, int count, String to) {
        return upbitClient.fetchCandles(market, type, unit, count, to);
    }

    public List<TradeTickResponse> getTrades(String market, int count) {
        return upbitClient.fetchTrades(market, count);
    }

    @Transactional
    public void syncCoins() {
        List<UpbitClient.UpbitMarket> markets = upbitClient.fetchMarkets();

        for (UpbitClient.UpbitMarket market : markets) {
            String code = market.market();
            if (!code.startsWith("KRW-") && !code.startsWith("BTC-") && !code.startsWith("USDT-")) {
                continue;
            }

            coinRepository.findByMarket(code)
                    .orElseGet(() -> coinRepository.save(
                            Coin.builder()
                                    .market(code)
                                    .koreanName(market.koreanName())
                                    .englishName(market.englishName())
                                    .isActive(true)
                                    .build()
                    ));
        }
    }
}
