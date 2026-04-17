package com.bitmoa.controller;

import com.bitmoa.dto.request.UpdateUserRequest;
import com.bitmoa.dto.response.ApiResponse;
import com.bitmoa.dto.response.UserResponse;
import com.bitmoa.security.UserPrincipal;
import com.bitmoa.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> getMe(@AuthenticationPrincipal UserPrincipal principal) {
        UserResponse response = userService.findById(principal.getId());
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PatchMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> updateMe(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody UpdateUserRequest request) {
        UserResponse response = userService.update(principal.getId(), request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/reset-balance")
    public ResponseEntity<ApiResponse<Map<String, BigDecimal>>> resetBalance(
            @AuthenticationPrincipal UserPrincipal principal) {
        UserResponse user = userService.resetBalance(principal.getId());
        return ResponseEntity.ok(ApiResponse.success(Map.of("balance", user.balance())));
    }
}
