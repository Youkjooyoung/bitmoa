package com.bitmoa.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.stereotype.Controller;

import java.util.List;
import java.util.Map;

@Slf4j
@Controller
@RequiredArgsConstructor
public class TickerWebSocketController {

    @MessageMapping("/subscribe")
    public void subscribe(@Payload Map<String, List<String>> payload, SimpMessageHeaderAccessor headerAccessor) {
        List<String> markets = payload.get("markets");
        log.debug("시세 구독 요청: {}", markets);
    }

    @MessageMapping("/unsubscribe")
    public void unsubscribe(@Payload Map<String, List<String>> payload, SimpMessageHeaderAccessor headerAccessor) {
        List<String> markets = payload.get("markets");
        log.debug("시세 구독 해제: {}", markets);
    }
}
