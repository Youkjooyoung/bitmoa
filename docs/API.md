# 비트모아 API 명세

## Base URL

- 개발: `http://localhost:8080/api`
- 운영: `https://api.bitmoa.com/api`

## 인증

JWT Bearer Token 사용

```
Authorization: Bearer {accessToken}
```

---

## 인증 API

### POST /api/auth/signup

회원가입

**Request**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "nickname": "홍길동"
}
```

**Response 201**
```json
{
  "data": {
    "id": 1,
    "email": "user@example.com",
    "nickname": "홍길동"
  }
}
```

**Errors**
- 400: 유효성 검증 실패
- 409: 이미 사용 중인 이메일입니다

### POST /api/auth/login

로그인

**Request**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response 200**
```json
{
  "data": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc...",
    "expiresIn": 1800
  }
}
```

**Errors**
- 401: 이메일 또는 비밀번호가 올바르지 않습니다

### POST /api/auth/refresh

토큰 재발급

**Request**
```json
{
  "refreshToken": "eyJhbGc..."
}
```

**Response 200**
```json
{
  "data": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc...",
    "expiresIn": 1800
  }
}
```

### POST /api/auth/logout

로그아웃 (인증 필요)

**Response 200**
```json
{
  "data": null,
  "message": "로그아웃되었습니다"
}
```

---

## 사용자 API

### GET /api/users/me

내 정보 조회 (인증 필요)

**Response 200**
```json
{
  "data": {
    "id": 1,
    "email": "user@example.com",
    "nickname": "홍길동",
    "balance": 10000000.0000,
    "createdAt": "2024-01-01T00:00:00"
  }
}
```

### PATCH /api/users/me

내 정보 수정 (인증 필요)

**Request**
```json
{
  "nickname": "새닉네임"
}
```

### POST /api/users/reset-balance

잔액 초기화 (인증 필요)

**Response 200**
```json
{
  "data": {
    "balance": 10000000.0000
  }
}
```

---

## 코인 API

### GET /api/coins

코인 목록 조회

**Response 200**
```json
{
  "data": [
    {
      "market": "KRW-BTC",
      "koreanName": "비트코인",
      "englishName": "Bitcoin"
    }
  ]
}
```

### GET /api/coins/{market}/ticker

현재가 조회

**Response 200**
```json
{
  "data": {
    "market": "KRW-BTC",
    "tradePrice": 50000000.0,
    "prevClosingPrice": 49000000.0,
    "change": "RISE",
    "changePrice": 1000000.0,
    "changeRate": 0.0204,
    "tradeVolume": 1234.5678,
    "accTradePrice24h": 123456789000.0
  }
}
```

### GET /api/coins/{market}/orderbook

호가 조회

**Response 200**
```json
{
  "data": {
    "market": "KRW-BTC",
    "asks": [
      { "price": 50100000.0, "size": 1.234 },
      { "price": 50200000.0, "size": 0.567 }
    ],
    "bids": [
      { "price": 50000000.0, "size": 2.345 },
      { "price": 49900000.0, "size": 1.111 }
    ]
  }
}
```

### GET /api/coins/{market}/candles

캔들 차트 데이터

**Query Parameters**
- type: minutes/days/weeks (default: minutes)
- unit: 1/3/5/15/30/60/240 (minutes일 때)
- count: 1-200 (default: 100)

**Response 200**
```json
{
  "data": [
    {
      "timestamp": "2024-01-01T00:00:00",
      "openingPrice": 50000000.0,
      "highPrice": 50500000.0,
      "lowPrice": 49500000.0,
      "tradePrice": 50200000.0,
      "candleAccTradeVolume": 123.456
    }
  ]
}
```

---

## 주문 API

### POST /api/orders

주문 생성 (인증 필요)

**Request**
```json
{
  "market": "KRW-BTC",
  "orderType": "BUY",
  "orderMethod": "LIMIT",
  "price": 50000000.0,
  "quantity": 0.001
}
```

**Response 201**
```json
{
  "data": {
    "id": 1,
    "market": "KRW-BTC",
    "orderType": "BUY",
    "orderMethod": "LIMIT",
    "price": 50000000.0,
    "quantity": 0.001,
    "filledQuantity": 0.0,
    "status": "PENDING",
    "createdAt": "2024-01-01T00:00:00"
  }
}
```

**Errors**
- 400: 유효하지 않은 주문입니다
- 400: 잔액이 부족합니다
- 400: 보유 수량이 부족합니다

### GET /api/orders

내 주문 목록 (인증 필요)

**Query Parameters**
- status: PENDING/FILLED/CANCELLED (optional)
- market: KRW-BTC (optional)
- page: 0 (default)
- size: 20 (default)

### GET /api/orders/{id}

주문 상세 (인증 필요)

### DELETE /api/orders/{id}

주문 취소 (인증 필요)

**Response 200**
```json
{
  "data": {
    "id": 1,
    "status": "CANCELLED"
  }
}
```

---

## 포트폴리오 API

### GET /api/portfolio

보유 자산 조회 (인증 필요)

**Response 200**
```json
{
  "data": {
    "balance": 9500000.0000,
    "holdings": [
      {
        "market": "KRW-BTC",
        "koreanName": "비트코인",
        "quantity": 0.01,
        "avgBuyPrice": 50000000.0,
        "currentPrice": 51000000.0,
        "evaluationAmount": 510000.0,
        "profitLoss": 10000.0,
        "profitLossRate": 0.02
      }
    ]
  }
}
```

### GET /api/portfolio/summary

포트폴리오 요약 (인증 필요)

**Response 200**
```json
{
  "data": {
    "totalAsset": 10010000.0,
    "totalBuyAmount": 500000.0,
    "totalEvaluationAmount": 510000.0,
    "totalProfitLoss": 10000.0,
    "totalProfitLossRate": 0.02
  }
}
```

---

## 거래내역 API

### GET /api/trades

체결 내역 조회 (인증 필요)

**Query Parameters**
- market: KRW-BTC (optional)
- page: 0 (default)
- size: 20 (default)

**Response 200**
```json
{
  "data": {
    "content": [
      {
        "id": 1,
        "orderId": 1,
        "market": "KRW-BTC",
        "tradeType": "BUY",
        "price": 50000000.0,
        "quantity": 0.001,
        "totalAmount": 50000.0,
        "fee": 25.0,
        "createdAt": "2024-01-01T00:00:00"
      }
    ],
    "totalElements": 100,
    "totalPages": 5
  }
}
```
