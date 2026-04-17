package com.bitmoa.repository;

import com.bitmoa.entity.Coin;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CoinRepository extends JpaRepository<Coin, Long> {

    Optional<Coin> findByMarket(String market);

    List<Coin> findAllByIsActiveTrue();
}
