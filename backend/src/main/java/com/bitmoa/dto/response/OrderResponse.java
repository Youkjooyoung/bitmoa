package com.bitmoa.dto.response;

import com.bitmoa.entity.Order;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record OrderResponse(
        Long id,
        String market,
        String orderType,
        String orderMethod,
        BigDecimal price,
        BigDecimal quantity,
        BigDecimal filledQuantity,
        String status,
        LocalDateTime createdAt
) {
    public static OrderResponse from(Order order) {
        return new OrderResponse(
                order.getId(),
                order.getCoin().getMarket(),
                order.getOrderType().name(),
                order.getOrderMethod().name(),
                order.getPrice(),
                order.getQuantity(),
                order.getFilledQuantity(),
                order.getStatus().name(),
                order.getCreatedAt()
        );
    }
}
