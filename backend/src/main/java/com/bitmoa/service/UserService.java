package com.bitmoa.service;

import com.bitmoa.dto.request.UpdateUserRequest;
import com.bitmoa.dto.response.UserResponse;
import com.bitmoa.entity.User;
import com.bitmoa.exception.BusinessException;
import com.bitmoa.exception.ErrorCode;
import com.bitmoa.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    @Value("${app.initial-balance}")
    private BigDecimal initialBalance;

    @Transactional(readOnly = true)
    public UserResponse findById(Long id) {
        User user = findUserById(id);
        return UserResponse.from(user);
    }

    @Transactional
    public UserResponse update(Long id, UpdateUserRequest request) {
        User user = findUserById(id);

        if (request.getNickname() != null) {
            user.updateNickname(request.getNickname());
        }

        return UserResponse.from(user);
    }

    @Transactional
    public UserResponse resetBalance(Long id) {
        User user = findUserById(id);
        user.updateBalance(initialBalance);
        return UserResponse.from(user);
    }

    private User findUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
    }
}
