package com.bitmoa.repository;

import com.bitmoa.entity.Holding;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface HoldingRepository extends JpaRepository<Holding, Long> {

    @Query("SELECT h FROM Holding h JOIN FETCH h.coin WHERE h.user.id = :userId")
    List<Holding> findAllByUserIdWithCoin(@Param("userId") Long userId);

    Optional<Holding> findByUserIdAndCoinId(Long userId, Long coinId);
}
