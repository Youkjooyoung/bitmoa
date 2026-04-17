package com.bitmoa.dto.response;

import com.bitmoa.entity.Trade;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record TradeResponse(
        Long id,
        Long orderId,
        String market,
        String tradeType,
        BigDecimal price,
        BigDecimal quantity,
        BigDecimal totalAmount,
        BigDecimal fee,
        LocalDateTime createdAt
) {
    public static TradeResponse from(Trade trade) {
        return new TradeResponse(
                trade.getId(),
                trade.getOrder().getId(),
                trade.getCoin().getMarket(),
                trade.getTradeType().name(),
                trade.getPrice(),
                trade.getQuantity(),
                trade.getTotalAmount(),
                trade.getFee(),
                trade.getCreatedAt()
        );
    }
}
