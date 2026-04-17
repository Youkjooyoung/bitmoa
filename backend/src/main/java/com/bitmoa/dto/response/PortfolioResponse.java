package com.bitmoa.dto.response;

import java.math.BigDecimal;
import java.util.List;

public record PortfolioResponse(
        BigDecimal balance,
        List<HoldingResponse> holdings
) {
    public static PortfolioResponse of(BigDecimal balance, List<HoldingResponse> holdings) {
        return new PortfolioResponse(balance, holdings);
    }
}
