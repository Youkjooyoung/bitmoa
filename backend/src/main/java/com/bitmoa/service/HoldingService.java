package com.bitmoa.service;

import com.bitmoa.entity.Coin;
import com.bitmoa.entity.Holding;
import com.bitmoa.entity.User;
import com.bitmoa.repository.HoldingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class HoldingService {

    private final HoldingRepository holdingRepository;

    @Transactional(readOnly = true)
    public List<Holding> findByUserId(Long userId) {
        return holdingRepository.findAllByUserIdWithCoin(userId);
    }

    @Transactional(readOnly = true)
    public Optional<Holding> findByUserIdAndCoinId(Long userId, Long coinId) {
        return holdingRepository.findByUserIdAndCoinId(userId, coinId);
    }

    @Transactional
    public void addHolding(User user, Coin coin, BigDecimal quantity, BigDecimal price) {
        Optional<Holding> existingHolding = holdingRepository.findByUserIdAndCoinId(user.getId(), coin.getId());

        if (existingHolding.isPresent()) {
            existingHolding.get().addQuantity(quantity, price);
        } else {
            Holding holding = Holding.builder()
                    .user(user)
                    .coin(coin)
                    .quantity(quantity)
                    .avgBuyPrice(price)
                    .build();
            holdingRepository.save(holding);
        }
    }

    @Transactional
    public void subtractHolding(Long userId, Long coinId, BigDecimal quantity) {
        Holding holding = holdingRepository.findByUserIdAndCoinId(userId, coinId)
                .orElseThrow(() -> new IllegalStateException("보유 자산을 찾을 수 없습니다."));

        holding.subtractQuantity(quantity);

        if (holding.getQuantity().compareTo(BigDecimal.ZERO) <= 0) {
            holdingRepository.delete(holding);
        }
    }
}
