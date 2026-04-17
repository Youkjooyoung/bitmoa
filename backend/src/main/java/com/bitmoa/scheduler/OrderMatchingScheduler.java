package com.bitmoa.scheduler;

import com.bitmoa.service.OrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class OrderMatchingScheduler {

    private final OrderService orderService;

    @Scheduled(fixedDelay = 2000, initialDelay = 5000)
    public void matchPendingOrders() {
        try {
            List<Long> ids = orderService.findMatchableOrderIds();
            if (ids.isEmpty()) return;
            for (Long id : ids) {
                try {
                    orderService.fillLimitOrderById(id);
                } catch (Exception e) {
                    log.error("지정가 체결 실패 orderId={} err={}", id, e.getMessage());
                }
            }
        } catch (Exception e) {
            log.error("지정가 매칭 스캔 실패: {}", e.getMessage());
        }
    }
}
