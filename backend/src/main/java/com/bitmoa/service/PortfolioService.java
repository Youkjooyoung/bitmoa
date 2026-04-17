package com.bitmoa.service;

import com.bitmoa.client.UpbitClient;
import com.bitmoa.dto.response.*;
import com.bitmoa.entity.Holding;
import com.bitmoa.entity.User;
import com.bitmoa.exception.BusinessException;
import com.bitmoa.exception.ErrorCode;
import com.bitmoa.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PortfolioService {

    private final UserRepository userRepository;
    private final HoldingService holdingService;
    private final UpbitClient upbitClient;

    @Transactional(readOnly = true)
    public PortfolioResponse getPortfolio(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        List<Holding> holdings = holdingService.findByUserId(userId);

        if (holdings.isEmpty()) {
            return PortfolioResponse.of(user.getBalance(), List.of());
        }

        Map<String, BigDecimal> priceMap = getCurrentPrices(holdings);

        List<HoldingResponse> holdingResponses = holdings.stream()
                .map(h -> HoldingResponse.from(h, priceMap.getOrDefault(h.getCoin().getMarket(), BigDecimal.ZERO)))
                .toList();

        return PortfolioResponse.of(user.getBalance(), holdingResponses);
    }

    @Transactional(readOnly = true)
    public PortfolioSummaryResponse getSummary(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        List<Holding> holdings = holdingService.findByUserId(userId);

        if (holdings.isEmpty()) {
            return new PortfolioSummaryResponse(
                    user.getBalance(),
                    BigDecimal.ZERO,
                    BigDecimal.ZERO,
                    BigDecimal.ZERO,
                    BigDecimal.ZERO
            );
        }

        Map<String, BigDecimal> priceMap = getCurrentPrices(holdings);

        BigDecimal totalBuyAmount = BigDecimal.ZERO;
        BigDecimal totalEvaluationAmount = BigDecimal.ZERO;

        for (Holding holding : holdings) {
            BigDecimal currentPrice = priceMap.getOrDefault(holding.getCoin().getMarket(), BigDecimal.ZERO);
            BigDecimal buyAmount = holding.getQuantity().multiply(holding.getAvgBuyPrice());
            BigDecimal evalAmount = holding.getQuantity().multiply(currentPrice);

            totalBuyAmount = totalBuyAmount.add(buyAmount);
            totalEvaluationAmount = totalEvaluationAmount.add(evalAmount);
        }

        BigDecimal totalProfitLoss = totalEvaluationAmount.subtract(totalBuyAmount);
        BigDecimal totalProfitLossRate = totalBuyAmount.compareTo(BigDecimal.ZERO) > 0
                ? totalProfitLoss.divide(totalBuyAmount, 4, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        BigDecimal totalAsset = user.getBalance().add(totalEvaluationAmount);

        return new PortfolioSummaryResponse(
                totalAsset.setScale(4, RoundingMode.HALF_UP),
                totalBuyAmount.setScale(4, RoundingMode.HALF_UP),
                totalEvaluationAmount.setScale(4, RoundingMode.HALF_UP),
                totalProfitLoss.setScale(4, RoundingMode.HALF_UP),
                totalProfitLossRate
        );
    }

    private Map<String, BigDecimal> getCurrentPrices(List<Holding> holdings) {
        List<String> markets = holdings.stream()
                .map(h -> h.getCoin().getMarket())
                .toList();

        List<TickerResponse> tickers = upbitClient.fetchTickers(markets);

        return tickers.stream()
                .collect(Collectors.toMap(
                        TickerResponse::market,
                        TickerResponse::tradePrice
                ));
    }
}
