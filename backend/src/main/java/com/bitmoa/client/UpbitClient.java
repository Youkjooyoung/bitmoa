package com.bitmoa.client;

import com.bitmoa.dto.response.CandleResponse;
import com.bitmoa.dto.response.OrderbookResponse;
import com.bitmoa.dto.response.TickerResponse;
import com.bitmoa.dto.response.TradeTickResponse;
import com.bitmoa.exception.BusinessException;
import com.bitmoa.exception.ErrorCode;
import com.fasterxml.jackson.annotation.JsonAlias;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.math.BigDecimal;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class UpbitClient {

    private final WebClient webClient;

    public List<TickerResponse> fetchTickers(List<String> markets) {
        try {
            String marketsParam = String.join(",", markets);
            return webClient.get()
                    .uri("/ticker?markets={markets}", marketsParam)
                    .retrieve()
                    .bodyToFlux(TickerResponse.class)
                    .collectList()
                    .block();
        } catch (Exception e) {
            log.error("업비트 시세 조회 실패: {}", e.getMessage());
            throw new BusinessException(ErrorCode.UPBIT_API_ERROR);
        }
    }

    public TickerResponse fetchTicker(String market) {
        List<TickerResponse> tickers = fetchTickers(List.of(market));
        if (tickers == null || tickers.isEmpty()) {
            throw new BusinessException(ErrorCode.COIN_NOT_FOUND);
        }
        return tickers.get(0);
    }

    public OrderbookResponse fetchOrderbook(String market) {
        try {
            List<UpbitOrderbook> orderbooks = webClient.get()
                    .uri("/orderbook?markets={market}", market)
                    .retrieve()
                    .bodyToFlux(UpbitOrderbook.class)
                    .collectList()
                    .block();

            if (orderbooks == null || orderbooks.isEmpty()) {
                throw new BusinessException(ErrorCode.COIN_NOT_FOUND);
            }

            UpbitOrderbook orderbook = orderbooks.get(0);
            List<OrderbookResponse.OrderbookUnit> asks = orderbook.orderbookUnits().stream()
                    .map(u -> new OrderbookResponse.OrderbookUnit(u.askPrice(), u.askSize()))
                    .toList();
            List<OrderbookResponse.OrderbookUnit> bids = orderbook.orderbookUnits().stream()
                    .map(u -> new OrderbookResponse.OrderbookUnit(u.bidPrice(), u.bidSize()))
                    .toList();

            return new OrderbookResponse(market, asks, bids);
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            log.error("업비트 호가 조회 실패: {}", e.getMessage());
            throw new BusinessException(ErrorCode.UPBIT_API_ERROR);
        }
    }

    public List<CandleResponse> fetchCandles(String market, String type, int unit, int count, String to) {
        try {
            String path = switch (type) {
                case "minutes" -> "/candles/minutes/" + unit;
                case "days" -> "/candles/days";
                case "weeks" -> "/candles/weeks";
                default -> "/candles/minutes/1";
            };

            List<UpbitCandle> raw = webClient.get()
                    .uri(uriBuilder -> {
                        var builder = uriBuilder.path(path)
                                .queryParam("market", market)
                                .queryParam("count", count);
                        if (to != null && !to.isBlank()) {
                            builder.queryParam("to", to);
                        }
                        return builder.build();
                    })
                    .retrieve()
                    .bodyToFlux(UpbitCandle.class)
                    .collectList()
                    .block();

            if (raw == null) {
                return List.of();
            }
            return raw.stream()
                    .map(c -> new CandleResponse(
                            c.candleDateTimeKst(),
                            c.openingPrice(),
                            c.highPrice(),
                            c.lowPrice(),
                            c.tradePrice(),
                            c.candleAccTradeVolume()
                    ))
                    .toList();
        } catch (Exception e) {
            log.error("업비트 캔들 조회 실패: {}", e.getMessage(), e);
            throw new BusinessException(ErrorCode.UPBIT_API_ERROR);
        }
    }

    public List<TradeTickResponse> fetchTrades(String market, int count) {
        try {
            return webClient.get()
                    .uri(uriBuilder -> uriBuilder.path("/trades/ticks")
                            .queryParam("market", market)
                            .queryParam("count", count)
                            .build())
                    .retrieve()
                    .bodyToFlux(TradeTickResponse.class)
                    .collectList()
                    .block();
        } catch (Exception e) {
            log.error("업비트 체결내역 조회 실패: {}", e.getMessage());
            throw new BusinessException(ErrorCode.UPBIT_API_ERROR);
        }
    }

    public List<UpbitMarket> fetchMarkets() {
        try {
            return webClient.get()
                    .uri("/market/all?isDetails=false")
                    .retrieve()
                    .bodyToFlux(UpbitMarket.class)
                    .collectList()
                    .block();
        } catch (Exception e) {
            log.error("업비트 마켓 조회 실패: {}", e.getMessage());
            throw new BusinessException(ErrorCode.UPBIT_API_ERROR);
        }
    }

    public record UpbitMarket(
            String market,
            @JsonAlias("korean_name") String koreanName,
            @JsonAlias("english_name") String englishName
    ) {}

    public record UpbitOrderbook(
            String market,
            @JsonAlias("orderbook_units") List<UpbitOrderbookUnit> orderbookUnits
    ) {}

    public record UpbitOrderbookUnit(
            @JsonAlias("ask_price") BigDecimal askPrice,
            @JsonAlias("bid_price") BigDecimal bidPrice,
            @JsonAlias("ask_size") BigDecimal askSize,
            @JsonAlias("bid_size") BigDecimal bidSize
    ) {}

    @com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown = true)
    public record UpbitCandle(
            @JsonAlias("candle_date_time_kst") String candleDateTimeKst,
            @JsonAlias("opening_price") BigDecimal openingPrice,
            @JsonAlias("high_price") BigDecimal highPrice,
            @JsonAlias("low_price") BigDecimal lowPrice,
            @JsonAlias("trade_price") BigDecimal tradePrice,
            @JsonAlias("candle_acc_trade_volume") BigDecimal candleAccTradeVolume
    ) {}
}
