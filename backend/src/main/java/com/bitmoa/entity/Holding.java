package com.bitmoa.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "holdings", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"user_id", "coin_id"})
})
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Holding extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "coin_id", nullable = false)
    private Coin coin;

    @Column(nullable = false, precision = 20, scale = 8)
    private BigDecimal quantity;

    @Column(name = "avg_buy_price", nullable = false, precision = 20, scale = 4)
    private BigDecimal avgBuyPrice;

    @Builder
    public Holding(User user, Coin coin, BigDecimal quantity, BigDecimal avgBuyPrice) {
        this.user = user;
        this.coin = coin;
        this.quantity = quantity;
        this.avgBuyPrice = avgBuyPrice;
    }

    public void addQuantity(BigDecimal quantity, BigDecimal price) {
        BigDecimal totalCost = this.quantity.multiply(this.avgBuyPrice)
                .add(quantity.multiply(price));
        this.quantity = this.quantity.add(quantity);
        this.avgBuyPrice = totalCost.divide(this.quantity, 4, java.math.RoundingMode.HALF_UP);
    }

    public void subtractQuantity(BigDecimal quantity) {
        this.quantity = this.quantity.subtract(quantity);
    }
}
