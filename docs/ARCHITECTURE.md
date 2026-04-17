# 비트모아 아키텍처 설계서

## 1. 시스템 아키텍처

```
[사용자 브라우저]
       ↓
[Nginx (리버스 프록시)]
       ↓
   ┌───┴───┐
   ↓       ↓
[Frontend]  [Backend]
(Next.js)   (Spring Boot)
   :3000       :8080
               ↓
        ┌──────┼──────┐
        ↓      ↓      ↓
   [PostgreSQL] [Redis] [업비트 API]
      :5432     :6379   (외부)
```

## 2. 통신 방식

| 용도 | 방식 | 설명 |
|------|------|------|
| 일반 CRUD | REST API | 회원, 주문, 포트폴리오 |
| 실시간 시세 | WebSocket (STOMP) | 업비트 시세 브로드캐스트 |
| 실시간 체결 | WebSocket (STOMP) | 주문 체결 알림 |

## 3. 인증 흐름

```
1. 로그인 → Access Token (30분) + Refresh Token (7일) 발급
2. API 요청 → Authorization: Bearer {accessToken}
3. 만료 시 → /api/auth/refresh로 재발급
4. Refresh도 만료 → 재로그인
```

## 4. 데이터 흐름

### 실시간 시세

```
[업비트 API] → [TickerScheduler (1초)] → [Redis 캐시] 
                                              ↓
                                    [WebSocket 브로드캐스트]
                                              ↓
                                    [클라이언트 Zustand Store]
```

### 주문 처리

```
[주문 요청] → [잔액 검증] → [주문 저장]
                               ↓
                    [시장가: 즉시 체결]
                    [지정가: 대기 후 매칭]
                               ↓
                    [체결 시 WebSocket 알림]
```
