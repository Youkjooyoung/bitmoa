package com.bitmoa.entity;

import com.bitmoa.entity.enums.OrderMethod;
import com.bitmoa.entity.enums.OrderStatus;
import com.bitmoa.entity.enums.OrderType;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "orders", indexes = {
        @Index(name = "ix_orders_user_status", columnList = "user_id, status"),
        @Index(name = "ix_orders_coin_status", columnList = "coin_id, status, order_type, price")
})
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Order extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "coin_id", nullable = false)
    private Coin coin;

    @Enumerated(EnumType.STRING)
    @Column(name = "order_type", nullable = false, length = 10)
    private OrderType orderType;

    @Enumerated(EnumType.STRING)
    @Column(name = "order_method", nullable = false, length = 10)
    private OrderMethod orderMethod;

    @Column(precision = 20, scale = 4)
    private BigDecimal price;

    @Column(nullable = false, precision = 20, scale = 8)
    private BigDecimal quantity;

    @Column(name = "filled_quantity", nullable = false, precision = 20, scale = 8)
    private BigDecimal filledQuantity;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private OrderStatus status;

    @Builder
    public Order(User user, Coin coin, OrderType orderType, OrderMethod orderMethod,
                 BigDecimal price, BigDecimal quantity) {
        this.user = user;
        this.coin = coin;
        this.orderType = orderType;
        this.orderMethod = orderMethod;
        this.price = price;
        this.quantity = quantity;
        this.filledQuantity = BigDecimal.ZERO;
        this.status = OrderStatus.PENDING;
    }

    public void fill(BigDecimal quantity) {
        this.filledQuantity = this.filledQuantity.add(quantity);
        if (this.filledQuantity.compareTo(this.quantity) >= 0) {
            this.status = OrderStatus.FILLED;
        } else {
            this.status = OrderStatus.PARTIAL;
        }
    }

    public void cancel() {
        this.status = OrderStatus.CANCELLED;
    }

    public BigDecimal getRemainingQuantity() {
        return this.quantity.subtract(this.filledQuantity);
    }
}
