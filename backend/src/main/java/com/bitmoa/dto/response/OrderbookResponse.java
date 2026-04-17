package com.bitmoa.dto.response;

import java.math.BigDecimal;
import java.util.List;

public record OrderbookResponse(
        String market,
        List<OrderbookUnit> asks,
        List<OrderbookUnit> bids
) {
    public record OrderbookUnit(
            BigDecimal price,
            BigDecimal size
    ) {
    }
}
