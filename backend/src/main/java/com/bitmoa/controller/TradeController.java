package com.bitmoa.controller;

import com.bitmoa.dto.response.ApiResponse;
import com.bitmoa.dto.response.TradeResponse;
import com.bitmoa.security.UserPrincipal;
import com.bitmoa.service.TradeService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/trades")
@RequiredArgsConstructor
public class TradeController {

    private final TradeService tradeService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<TradeResponse>>> getTrades(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) String market,
            @PageableDefault(size = 20) Pageable pageable) {
        Page<TradeResponse> response;
        if (market != null && !market.isBlank()) {
            response = tradeService.findByUserIdAndMarket(principal.getId(), market, pageable);
        } else {
            response = tradeService.findByUserId(principal.getId(), pageable);
        }
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
