package com.bitmoa.dto.response;

import java.math.BigDecimal;

public record CandleResponse(
        String timestamp,
        BigDecimal openingPrice,
        BigDecimal highPrice,
        BigDecimal lowPrice,
        BigDecimal tradePrice,
        BigDecimal candleAccTradeVolume
) {
}
