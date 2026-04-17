# 비트모아 WebSocket 명세

## 연결 정보

- Endpoint: `ws://localhost:8080/ws`
- Protocol: STOMP over WebSocket
- SockJS Fallback 지원

## 연결 예시 (JavaScript)

```javascript
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'

const client = new Client({
  webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
  connectHeaders: {
    Authorization: `Bearer ${accessToken}`
  },
  onConnect: () => {
    console.log('Connected')
  }
})

client.activate()
```

---

## 구독 토픽 (Server → Client)

### /topic/ticker/all

전체 코인 실시간 시세 (1초마다)

**Payload**
```json
[
  {
    "market": "KRW-BTC",
    "tradePrice": 50000000.0,
    "prevClosingPrice": 49000000.0,
    "change": "RISE",
    "changePrice": 1000000.0,
    "changeRate": 0.0204,
    "tradeVolume": 1234.5678
  },
  {
    "market": "KRW-ETH",
    "tradePrice": 3000000.0,
    ...
  }
]
```

### /topic/ticker/{market}

특정 코인 실시간 시세

**Payload**
```json
{
  "market": "KRW-BTC",
  "tradePrice": 50000000.0,
  "prevClosingPrice": 49000000.0,
  "change": "RISE",
  "changePrice": 1000000.0,
  "changeRate": 0.0204,
  "tradeVolume": 1234.5678,
  "highPrice": 51000000.0,
  "lowPrice": 49500000.0,
  "accTradePrice24h": 123456789000.0
}
```

### /topic/orderbook/{market}

호가 업데이트 (3초마다)

**Payload**
```json
{
  "market": "KRW-BTC",
  "timestamp": 1704067200000,
  "asks": [
    { "price": 50100000.0, "size": 1.234 },
    { "price": 50200000.0, "size": 0.567 },
    { "price": 50300000.0, "size": 2.345 }
  ],
  "bids": [
    { "price": 50000000.0, "size": 2.345 },
    { "price": 49900000.0, "size": 1.111 },
    { "price": 49800000.0, "size": 3.456 }
  ]
}
```

### /user/queue/orders

내 주문 상태 변경 알림 (인증 필요)

**Payload**
```json
{
  "orderId": 123,
  "market": "KRW-BTC",
  "orderType": "BUY",
  "status": "FILLED",
  "filledQuantity": 0.001,
  "totalQuantity": 0.001,
  "message": "주문이 체결되었습니다"
}
```

### /user/queue/trades

내 체결 알림 (인증 필요)

**Payload**
```json
{
  "tradeId": 456,
  "orderId": 123,
  "market": "KRW-BTC",
  "tradeType": "BUY",
  "price": 50000000.0,
  "quantity": 0.001,
  "totalAmount": 50000.0,
  "fee": 25.0,
  "createdAt": "2024-01-01T00:00:00"
}
```

---

## 메시지 발행 (Client → Server)

### /app/subscribe

시세 구독 요청

**Payload**
```json
{
  "markets": ["KRW-BTC", "KRW-ETH", "KRW-XRP"]
}
```

### /app/unsubscribe

시세 구독 해제

**Payload**
```json
{
  "markets": ["KRW-XRP"]
}
```

---

## 연결 상태 관리

### Heartbeat

- Client → Server: 10초마다
- Server → Client: 10초마다

### 재연결

```javascript
const client = new Client({
  reconnectDelay: 5000,
  heartbeatIncoming: 10000,
  heartbeatOutgoing: 10000,
  onDisconnect: () => {
    console.log('Disconnected, reconnecting...')
  }
})
```

### 인증 토큰 갱신

토큰 만료 시 재연결 필요

```javascript
client.deactivate()
client.connectHeaders.Authorization = `Bearer ${newAccessToken}`
client.activate()
```
