package com.bitmoa.service;

import com.bitmoa.client.UpbitClient;
import com.bitmoa.dto.request.OrderRequest;
import com.bitmoa.dto.response.OrderResponse;
import com.bitmoa.dto.response.TickerResponse;
import com.bitmoa.entity.Coin;
import com.bitmoa.entity.Holding;
import com.bitmoa.entity.Order;
import com.bitmoa.entity.User;
import com.bitmoa.entity.enums.OrderMethod;
import com.bitmoa.entity.enums.OrderStatus;
import com.bitmoa.entity.enums.OrderType;
import com.bitmoa.exception.BusinessException;
import com.bitmoa.exception.ErrorCode;
import com.bitmoa.repository.CoinRepository;
import com.bitmoa.repository.OrderRepository;
import com.bitmoa.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Slf4j
@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final CoinRepository coinRepository;
    private final HoldingService holdingService;
    private final TradeService tradeService;
    private final UpbitClient upbitClient;

    @Value("${app.fee-rate}")
    private BigDecimal feeRate;

    @Transactional
    public OrderResponse create(OrderRequest request, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
        Coin coin = coinRepository.findByMarket(request.getMarket())
                .orElseThrow(() -> new BusinessException(ErrorCode.COIN_NOT_FOUND));

        OrderType orderType = OrderType.valueOf(request.getOrderType());
        OrderMethod orderMethod = OrderMethod.valueOf(request.getOrderMethod());
        BigDecimal price = request.getPrice();
        BigDecimal quantity = request.getQuantity();

        if (orderMethod == OrderMethod.MARKET) {
            TickerResponse ticker = upbitClient.fetchTicker(request.getMarket());
            price = ticker.tradePrice();
        }

        validateOrder(user, coin, orderType, price, quantity);

        Order order = Order.builder()
                .user(user)
                .coin(coin)
                .orderType(orderType)
                .orderMethod(orderMethod)
                .price(price)
                .quantity(quantity)
                .build();

        Order savedOrder = orderRepository.save(order);

        if (orderMethod == OrderMethod.MARKET) {
            executeMarketOrder(savedOrder, user, coin, price, quantity);
        } else {
            reserveForLimitOrder(savedOrder, user, coin, price, quantity);
        }

        return OrderResponse.from(savedOrder);
    }

    @Transactional(readOnly = true)
    public Page<OrderResponse> findByUserId(Long userId, OrderStatus status, Pageable pageable) {
        if (status != null) {
            return orderRepository.findByUserIdAndStatusWithCoin(userId, status, pageable)
                    .map(OrderResponse::from);
        }
        return orderRepository.findByUserIdWithCoin(userId, pageable)
                .map(OrderResponse::from);
    }

    @Transactional(readOnly = true)
    public OrderResponse findById(Long id, Long userId) {
        Order order = orderRepository.findByIdWithCoin(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.ORDER_NOT_FOUND));

        if (!order.getUser().getId().equals(userId)) {
            throw new BusinessException(ErrorCode.FORBIDDEN);
        }

        return OrderResponse.from(order);
    }

    @Transactional(readOnly = true)
    public java.util.List<Long> findMatchableOrderIds() {
        var orders = orderRepository.findOpenLimitOrders();
        if (orders.isEmpty()) return java.util.List.of();

        var priceByMarket = new java.util.HashMap<String, BigDecimal>();
        var matchable = new java.util.ArrayList<Long>();
        for (Order order : orders) {
            String market = order.getCoin().getMarket();
            BigDecimal currentPrice = priceByMarket.computeIfAbsent(market, m -> {
                try {
                    return upbitClient.fetchTicker(m).tradePrice();
                } catch (Exception e) {
                    log.warn("시세 조회 실패 market={} err={}", m, e.getMessage());
                    return null;
                }
            });
            if (currentPrice == null) continue;

            boolean shouldFill =
                    (order.getOrderType() == OrderType.BUY && currentPrice.compareTo(order.getPrice()) <= 0)
                    || (order.getOrderType() == OrderType.SELL && currentPrice.compareTo(order.getPrice()) >= 0);
            if (shouldFill) matchable.add(order.getId());
        }
        return matchable;
    }

    @Transactional
    public void fillLimitOrderById(Long orderId) {
        Order order = orderRepository.findByIdWithCoin(orderId)
                .orElseThrow(() -> new BusinessException(ErrorCode.ORDER_NOT_FOUND));
        if (order.getStatus() != OrderStatus.PENDING && order.getStatus() != OrderStatus.PARTIAL) return;
        fillLimitOrder(order);
        log.info("지정가 체결 완료 orderId={} market={} type={} price={}",
                order.getId(), order.getCoin().getMarket(), order.getOrderType(), order.getPrice());
    }

    @Transactional
    public void cancel(Long id, Long userId) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.ORDER_NOT_FOUND));

        if (!order.getUser().getId().equals(userId)) {
            throw new BusinessException(ErrorCode.FORBIDDEN);
        }

        if (order.getStatus() != OrderStatus.PENDING && order.getStatus() != OrderStatus.PARTIAL) {
            throw new BusinessException(ErrorCode.CANNOT_CANCEL_ORDER);
        }

        User user = order.getUser();
        BigDecimal remainingQuantity = order.getRemainingQuantity();

        if (order.getOrderType() == OrderType.BUY) {
            BigDecimal refundAmount = order.getPrice().multiply(remainingQuantity);
            BigDecimal refundFee = refundAmount.multiply(feeRate);
            user.addBalance(refundAmount.add(refundFee));
        } else {
            holdingService.addHolding(user, order.getCoin(), remainingQuantity, order.getPrice());
        }

        order.cancel();
    }

    private void validateOrder(User user, Coin coin, OrderType orderType, BigDecimal price, BigDecimal quantity) {
        BigDecimal totalAmount = price.multiply(quantity);
        BigDecimal fee = totalAmount.multiply(feeRate).setScale(4, RoundingMode.HALF_UP);

        if (orderType == OrderType.BUY) {
            BigDecimal requiredAmount = totalAmount.add(fee);
            if (user.getBalance().compareTo(requiredAmount) < 0) {
                throw new BusinessException(ErrorCode.INSUFFICIENT_BALANCE);
            }
        } else {
            Holding holding = holdingService.findByUserIdAndCoinId(user.getId(), coin.getId())
                    .orElseThrow(() -> new BusinessException(ErrorCode.INSUFFICIENT_QUANTITY));

            if (holding.getQuantity().compareTo(quantity) < 0) {
                throw new BusinessException(ErrorCode.INSUFFICIENT_QUANTITY);
            }
        }
    }

    private void fillLimitOrder(Order order) {
        BigDecimal remaining = order.getRemainingQuantity();
        if (remaining.signum() <= 0) return;

        BigDecimal price = order.getPrice();
        BigDecimal totalAmount = price.multiply(remaining);
        BigDecimal fee = totalAmount.multiply(feeRate).setScale(4, RoundingMode.HALF_UP);

        User user = order.getUser();
        Coin coin = order.getCoin();

        if (order.getOrderType() == OrderType.BUY) {
            holdingService.addHolding(user, coin, remaining, price);
        } else {
            user.addBalance(totalAmount.subtract(fee));
        }

        order.fill(remaining);
        tradeService.create(order, user, coin, order.getOrderType(), price, remaining);
    }

    private void reserveForLimitOrder(Order order, User user, Coin coin, BigDecimal price, BigDecimal quantity) {
        BigDecimal totalAmount = price.multiply(quantity);
        BigDecimal fee = totalAmount.multiply(feeRate).setScale(4, RoundingMode.HALF_UP);

        if (order.getOrderType() == OrderType.BUY) {
            user.subtractBalance(totalAmount.add(fee));
        } else {
            holdingService.subtractHolding(user.getId(), coin.getId(), quantity);
        }
    }

    private void executeMarketOrder(Order order, User user, Coin coin, BigDecimal price, BigDecimal quantity) {
        BigDecimal totalAmount = price.multiply(quantity);
        BigDecimal fee = totalAmount.multiply(feeRate).setScale(4, RoundingMode.HALF_UP);

        if (order.getOrderType() == OrderType.BUY) {
            user.subtractBalance(totalAmount.add(fee));
            holdingService.addHolding(user, coin, quantity, price);
        } else {
            holdingService.subtractHolding(user.getId(), coin.getId(), quantity);
            user.addBalance(totalAmount.subtract(fee));
        }

        order.fill(quantity);
        tradeService.create(order, user, coin, order.getOrderType(), price, quantity);
    }
}
