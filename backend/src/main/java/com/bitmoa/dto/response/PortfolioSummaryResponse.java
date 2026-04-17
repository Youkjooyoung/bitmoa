package com.bitmoa.dto.response;

import java.math.BigDecimal;

public record PortfolioSummaryResponse(
        BigDecimal totalAsset,
        BigDecimal totalBuyAmount,
        BigDecimal totalEvaluationAmount,
        BigDecimal totalProfitLoss,
        BigDecimal totalProfitLossRate
) {
}
