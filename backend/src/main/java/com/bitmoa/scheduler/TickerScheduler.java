package com.bitmoa.scheduler;

import com.bitmoa.service.TickerService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class TickerScheduler {

    private final TickerService tickerService;

    @Scheduled(fixedDelay = 2000)
    public void broadcastTickers() {
        tickerService.broadcastTickers();
    }
}
