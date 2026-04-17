package com.bitmoa.repository;

import com.bitmoa.entity.Trade;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface TradeRepository extends JpaRepository<Trade, Long> {

    @Query("SELECT t FROM Trade t JOIN FETCH t.coin WHERE t.user.id = :userId ORDER BY t.createdAt DESC")
    Page<Trade> findByUserIdWithCoin(@Param("userId") Long userId, Pageable pageable);

    @Query("SELECT t FROM Trade t JOIN FETCH t.coin WHERE t.user.id = :userId AND t.coin.market = :market ORDER BY t.createdAt DESC")
    Page<Trade> findByUserIdAndMarketWithCoin(@Param("userId") Long userId, @Param("market") String market, Pageable pageable);
}
