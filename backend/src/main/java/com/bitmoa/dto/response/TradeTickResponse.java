package com.bitmoa.dto.response;

import com.fasterxml.jackson.annotation.JsonAlias;

import java.math.BigDecimal;

public record TradeTickResponse(
        String market,
        @JsonAlias("trade_date_utc") String tradeDateUtc,
        @JsonAlias("trade_time_utc") String tradeTimeUtc,
        Long timestamp,
        @JsonAlias("trade_price") BigDecimal tradePrice,
        @JsonAlias("trade_volume") BigDecimal tradeVolume,
        @JsonAlias("prev_closing_price") BigDecimal prevClosingPrice,
        @JsonAlias("change_price") BigDecimal changePrice,
        @JsonAlias("ask_bid") String askBid,
        @JsonAlias("sequential_id") Long sequentialId
) {
}
