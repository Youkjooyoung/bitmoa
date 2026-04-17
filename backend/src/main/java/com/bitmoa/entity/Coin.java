package com.bitmoa.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "coins")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Coin {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 20)
    private String market;

    @Column(name = "korean_name", nullable = false, length = 50)
    private String koreanName;

    @Column(name = "english_name", nullable = false, length = 50)
    private String englishName;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive;

    @Builder
    public Coin(String market, String koreanName, String englishName, Boolean isActive) {
        this.market = market;
        this.koreanName = koreanName;
        this.englishName = englishName;
        this.isActive = isActive != null ? isActive : true;
    }
}
