package com.bitmoa.dto.response;

import com.bitmoa.entity.Holding;

import java.math.BigDecimal;
import java.math.RoundingMode;

public record HoldingResponse(
        String market,
        String koreanName,
        BigDecimal quantity,
        BigDecimal avgBuyPrice,
        BigDecimal currentPrice,
        BigDecimal evaluationAmount,
        BigDecimal profitLoss,
        BigDecimal profitLossRate
) {
    public static HoldingResponse from(Holding holding, BigDecimal currentPrice) {
        BigDecimal evaluationAmount = holding.getQuantity().multiply(currentPrice);
        BigDecimal buyAmount = holding.getQuantity().multiply(holding.getAvgBuyPrice());
        BigDecimal profitLoss = evaluationAmount.subtract(buyAmount);
        BigDecimal profitLossRate = buyAmount.compareTo(BigDecimal.ZERO) > 0
                ? profitLoss.divide(buyAmount, 4, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        return new HoldingResponse(
                holding.getCoin().getMarket(),
                holding.getCoin().getKoreanName(),
                holding.getQuantity(),
                holding.getAvgBuyPrice(),
                currentPrice,
                evaluationAmount.setScale(4, RoundingMode.HALF_UP),
                profitLoss.setScale(4, RoundingMode.HALF_UP),
                profitLossRate
        );
    }
}
