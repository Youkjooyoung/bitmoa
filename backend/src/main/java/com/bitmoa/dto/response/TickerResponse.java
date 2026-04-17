package com.bitmoa.dto.response;

import com.fasterxml.jackson.annotation.JsonAlias;

import java.math.BigDecimal;

public record TickerResponse(
        String market,
        @JsonAlias("trade_price") BigDecimal tradePrice,
        @JsonAlias("prev_closing_price") BigDecimal prevClosingPrice,
        String change,
        @JsonAlias("change_price") BigDecimal changePrice,
        @JsonAlias("change_rate") BigDecimal changeRate,
        @JsonAlias("trade_volume") BigDecimal tradeVolume,
        @JsonAlias("acc_trade_price_24h") BigDecimal accTradePrice24h,
        @JsonAlias("high_price") BigDecimal highPrice,
        @JsonAlias("low_price") BigDecimal lowPrice
) {
}
