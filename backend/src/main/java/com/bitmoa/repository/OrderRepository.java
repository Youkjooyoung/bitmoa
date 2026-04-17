package com.bitmoa.repository;

import com.bitmoa.entity.Order;
import com.bitmoa.entity.enums.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {

    @Query("SELECT o FROM Order o JOIN FETCH o.coin WHERE o.user.id = :userId ORDER BY o.createdAt DESC")
    Page<Order> findByUserIdWithCoin(@Param("userId") Long userId, Pageable pageable);

    @Query("SELECT o FROM Order o JOIN FETCH o.coin WHERE o.user.id = :userId AND o.status = :status ORDER BY o.createdAt DESC")
    Page<Order> findByUserIdAndStatusWithCoin(@Param("userId") Long userId, @Param("status") OrderStatus status, Pageable pageable);

    @Query("SELECT o FROM Order o JOIN FETCH o.coin WHERE o.id = :id")
    Optional<Order> findByIdWithCoin(@Param("id") Long id);

    List<Order> findByCoinIdAndStatusOrderByPriceAscCreatedAtAsc(Long coinId, OrderStatus status);

    List<Order> findByCoinIdAndStatusOrderByPriceDescCreatedAtAsc(Long coinId, OrderStatus status);

    @Query("SELECT o FROM Order o JOIN FETCH o.coin JOIN FETCH o.user WHERE o.orderMethod = com.bitmoa.entity.enums.OrderMethod.LIMIT AND o.status IN (com.bitmoa.entity.enums.OrderStatus.PENDING, com.bitmoa.entity.enums.OrderStatus.PARTIAL)")
    List<Order> findOpenLimitOrders();
}
