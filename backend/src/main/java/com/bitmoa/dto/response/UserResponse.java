package com.bitmoa.dto.response;

import com.bitmoa.entity.User;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record UserResponse(
        Long id,
        String email,
        String nickname,
        BigDecimal balance,
        LocalDateTime createdAt
) {
    public static UserResponse from(User user) {
        return new UserResponse(
                user.getId(),
                user.getEmail(),
                user.getNickname(),
                user.getBalance(),
                user.getCreatedAt()
        );
    }
}
