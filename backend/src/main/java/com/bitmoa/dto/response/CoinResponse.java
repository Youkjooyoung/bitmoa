package com.bitmoa.dto.response;

import com.bitmoa.entity.Coin;

public record CoinResponse(
        String market,
        String koreanName,
        String englishName
) {
    public static CoinResponse from(Coin coin) {
        return new CoinResponse(
                coin.getMarket(),
                coin.getKoreanName(),
                coin.getEnglishName()
        );
    }
}
