package com.bitmoa.service;

import com.bitmoa.dto.response.TradeResponse;
import com.bitmoa.entity.Coin;
import com.bitmoa.entity.Order;
import com.bitmoa.entity.Trade;
import com.bitmoa.entity.User;
import com.bitmoa.entity.enums.OrderType;
import com.bitmoa.repository.TradeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
@RequiredArgsConstructor
public class TradeService {

    private final TradeRepository tradeRepository;

    @Value("${app.fee-rate}")
    private BigDecimal feeRate;

    @Transactional
    public Trade create(Order order, User user, Coin coin, OrderType tradeType,
                        BigDecimal price, BigDecimal quantity) {
        BigDecimal totalAmount = price.multiply(quantity).setScale(4, RoundingMode.HALF_UP);
        BigDecimal fee = totalAmount.multiply(feeRate).setScale(4, RoundingMode.HALF_UP);

        Trade trade = Trade.builder()
                .order(order)
                .user(user)
                .coin(coin)
                .tradeType(tradeType)
                .price(price)
                .quantity(quantity)
                .totalAmount(totalAmount)
                .fee(fee)
                .build();

        return tradeRepository.save(trade);
    }

    @Transactional(readOnly = true)
    public Page<TradeResponse> findByUserId(Long userId, Pageable pageable) {
        return tradeRepository.findByUserIdWithCoin(userId, pageable)
                .map(TradeResponse::from);
    }

    @Transactional(readOnly = true)
    public Page<TradeResponse> findByUserIdAndMarket(Long userId, String market, Pageable pageable) {
        return tradeRepository.findByUserIdAndMarketWithCoin(userId, market, pageable)
                .map(TradeResponse::from);
    }
}
