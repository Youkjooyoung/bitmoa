package com.bitmoa.controller;

import com.bitmoa.dto.response.ApiResponse;
import com.bitmoa.dto.response.PortfolioResponse;
import com.bitmoa.dto.response.PortfolioSummaryResponse;
import com.bitmoa.security.UserPrincipal;
import com.bitmoa.service.PortfolioService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/portfolio")
@RequiredArgsConstructor
public class PortfolioController {

    private final PortfolioService portfolioService;

    @GetMapping
    public ResponseEntity<ApiResponse<PortfolioResponse>> getPortfolio(
            @AuthenticationPrincipal UserPrincipal principal) {
        PortfolioResponse response = portfolioService.getPortfolio(principal.getId());
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<PortfolioSummaryResponse>> getSummary(
            @AuthenticationPrincipal UserPrincipal principal) {
        PortfolioSummaryResponse response = portfolioService.getSummary(principal.getId());
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
