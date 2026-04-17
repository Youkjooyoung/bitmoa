package com.bitmoa.scheduler;

import com.bitmoa.service.CoinService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class CoinSyncScheduler {

    private final CoinService coinService;

    @EventListener(ApplicationReadyEvent.class)
    public void onApplicationReady() {
        log.info("코인 목록 동기화 시작...");
        coinService.syncCoins();
        log.info("코인 목록 동기화 완료");
    }

    @Scheduled(cron = "0 0 * * * *")
    public void syncCoins() {
        log.info("코인 목록 정기 동기화 시작...");
        coinService.syncCoins();
        log.info("코인 목록 정기 동기화 완료");
    }
}
