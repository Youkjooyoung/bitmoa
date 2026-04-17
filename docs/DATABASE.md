# 비트모아 데이터베이스 설계

## ERD

```
USERS ──1:N──→ HOLDINGS ←──N:1── COINS
  │                                  │
  ├──1:N──→ ORDERS ←────N:1─────────┤
  │             │
  │             └──1:N──→ TRADES
  │
  └──1:N──→ REFRESH_TOKENS
```

## 테이블 정의

### USERS (사용자)

| 컬럼 | 타입 | 제약조건 | 설명 |
|------|------|----------|------|
| id | BIGSERIAL | PK | 사용자 ID |
| email | VARCHAR(255) | UQ, NOT NULL | 이메일 |
| password | VARCHAR(255) | NOT NULL | BCrypt 해시 |
| nickname | VARCHAR(50) | NOT NULL | 닉네임 |
| balance | DECIMAL(20,4) | DEFAULT 10000000 | 보유 KRW |
| created_at | TIMESTAMP | DEFAULT NOW() | 가입일시 |
| updated_at | TIMESTAMP | | 수정일시 |

### COINS (코인 마스터)

| 컬럼 | 타입 | 제약조건 | 설명 |
|------|------|----------|------|
| id | BIGSERIAL | PK | 코인 ID |
| market | VARCHAR(20) | UQ, NOT NULL | 마켓코드 |
| korean_name | VARCHAR(50) | NOT NULL | 한글명 |
| english_name | VARCHAR(50) | NOT NULL | 영문명 |
| is_active | BOOLEAN | DEFAULT TRUE | 거래 가능 여부 |

### HOLDINGS (보유 자산)

| 컬럼 | 타입 | 제약조건 | 설명 |
|------|------|----------|------|
| id | BIGSERIAL | PK | 보유 ID |
| user_id | BIGINT | FK → USERS | 사용자 |
| coin_id | BIGINT | FK → COINS | 코인 |
| quantity | DECIMAL(20,8) | NOT NULL | 보유 수량 |
| avg_buy_price | DECIMAL(20,4) | NOT NULL | 평균 매수가 |
| created_at | TIMESTAMP | DEFAULT NOW() | |
| updated_at | TIMESTAMP | | |

**인덱스**: IX_HOLDINGS_USER_COIN (user_id, coin_id) UNIQUE

### ORDERS (주문)

| 컬럼 | 타입 | 제약조건 | 설명 |
|------|------|----------|------|
| id | BIGSERIAL | PK | 주문 ID |
| user_id | BIGINT | FK → USERS | 사용자 |
| coin_id | BIGINT | FK → COINS | 코인 |
| order_type | VARCHAR(10) | NOT NULL | BUY / SELL |
| order_method | VARCHAR(10) | NOT NULL | LIMIT / MARKET |
| price | DECIMAL(20,4) | | 주문 가격 |
| quantity | DECIMAL(20,8) | NOT NULL | 주문 수량 |
| filled_quantity | DECIMAL(20,8) | DEFAULT 0 | 체결 수량 |
| status | VARCHAR(20) | NOT NULL | PENDING / FILLED / PARTIAL / CANCELLED |
| created_at | TIMESTAMP | DEFAULT NOW() | |
| updated_at | TIMESTAMP | | |

**인덱스**: 
- IX_ORDERS_USER_STATUS (user_id, status)
- IX_ORDERS_COIN_STATUS (coin_id, status, order_type, price)

### TRADES (체결 내역)

| 컬럼 | 타입 | 제약조건 | 설명 |
|------|------|----------|------|
| id | BIGSERIAL | PK | 체결 ID |
| order_id | BIGINT | FK → ORDERS | 주문 |
| user_id | BIGINT | FK → USERS | 사용자 |
| coin_id | BIGINT | FK → COINS | 코인 |
| trade_type | VARCHAR(10) | NOT NULL | BUY / SELL |
| price | DECIMAL(20,4) | NOT NULL | 체결 가격 |
| quantity | DECIMAL(20,8) | NOT NULL | 체결 수량 |
| total_amount | DECIMAL(20,4) | NOT NULL | 총 금액 |
| fee | DECIMAL(20,4) | NOT NULL | 수수료 |
| created_at | TIMESTAMP | DEFAULT NOW() | |

**인덱스**: IX_TRADES_USER_DATE (user_id, created_at DESC)

### REFRESH_TOKENS

| 컬럼 | 타입 | 제약조건 | 설명 |
|------|------|----------|------|
| id | BIGSERIAL | PK | |
| user_id | BIGINT | FK → USERS | |
| token | VARCHAR(500) | UQ, NOT NULL | Refresh Token |
| expires_at | TIMESTAMP | NOT NULL | 만료일시 |
| created_at | TIMESTAMP | DEFAULT NOW() | |

## Redis 키 설계

| 키 패턴 | TTL | 용도 |
|---------|-----|------|
| `ticker:{market}` | 5s | 실시간 시세 캐시 |
| `orderbook:{market}` | 3s | 호가 캐시 |
| `user:balance:{userId}` | 60s | 잔액 캐시 |
