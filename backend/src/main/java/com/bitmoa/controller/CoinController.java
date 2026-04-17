package com.bitmoa.controller;

import com.bitmoa.dto.response.*;
import com.bitmoa.service.CoinService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/coins")
@RequiredArgsConstructor
public class CoinController {

    private final CoinService coinService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<CoinResponse>>> getCoins() {
        List<CoinResponse> response = coinService.findAll();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{market}")
    public ResponseEntity<ApiResponse<CoinResponse>> getCoin(@PathVariable String market) {
        CoinResponse response = coinService.findByMarket(market);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{market}/ticker")
    public ResponseEntity<ApiResponse<TickerResponse>> getTicker(@PathVariable String market) {
        TickerResponse response = coinService.getTicker(market);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{market}/orderbook")
    public ResponseEntity<ApiResponse<OrderbookResponse>> getOrderbook(@PathVariable String market) {
        OrderbookResponse response = coinService.getOrderbook(market);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{market}/candles")
    public ResponseEntity<ApiResponse<List<CandleResponse>>> getCandles(
            @PathVariable String market,
            @RequestParam(defaultValue = "minutes") String type,
            @RequestParam(defaultValue = "1") int unit,
            @RequestParam(defaultValue = "100") int count,
            @RequestParam(required = false) String to) {
        List<CandleResponse> response = coinService.getCandles(market, type, unit, count, to);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{market}/trades")
    public ResponseEntity<ApiResponse<List<TradeTickResponse>>> getTrades(
            @PathVariable String market,
            @RequestParam(defaultValue = "50") int count) {
        List<TradeTickResponse> response = coinService.getTrades(market, count);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
