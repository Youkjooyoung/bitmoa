# Backend - 비트모아

Spring Boot 3 기반 암호화폐 거래소 백엔드

## 기술 스택

- Java 21
- Spring Boot 3.2
- Spring Web
- Spring WebSocket + STOMP
- Spring Data JPA
- Spring Security + JWT
- Flyway
- PostgreSQL 15
- Redis 7

## 실행 방법

```bash
./gradlew bootRun --args='--spring.profiles.active=local'
```

## 디렉토리 구조

```
src/main/java/com/bitmoa/
├── config/             # 설정 클래스
├── controller/         # REST 컨트롤러
├── service/            # 비즈니스 로직
├── repository/         # JPA 레포지토리
├── entity/             # JPA 엔티티
├── dto/
│   ├── request/       # 요청 DTO
│   └── response/      # 응답 DTO
├── security/           # JWT, 인증 필터
├── exception/          # 예외 처리
└── scheduler/          # 스케줄러 (시세 갱신)
```

## 코드 컨벤션

### 클래스 내 메소드 순서

1. 생성자 / 의존성 주입
2. CRUD 순서 (Create → Read → Update → Delete)
3. 비즈니스 로직 메소드
4. private 헬퍼 메소드 (맨 아래)

```java
@Service
@RequiredArgsConstructor
public class OrderService {
    private final OrderRepository orderRepository;

    // Create
    public OrderResponse create(OrderRequest request, Long userId) { }

    // Read
    public OrderResponse findById(Long id) { }
    public List<OrderResponse> findByUserId(Long userId) { }

    // Update
    public OrderResponse update(Long id, OrderRequest request) { }

    // Delete
    public void cancel(Long id, Long userId) { }

    // Business Logic
    public void matchOrders(Long coinId) { }

    // Private helpers (맨 아래)
    private void validateOrder(OrderRequest request) { }
    private BigDecimal calculateFee(BigDecimal amount) { }
}
```

### 네이밍

- 클래스: PascalCase
- 메소드/변수: camelCase
- 상수: UPPER_SNAKE_CASE
- 패키지: 소문자

### DTO 규칙

- Request DTO: @Valid 검증 어노테이션 사용
- Response DTO: record 사용 권장
- Entity → Response 변환은 정적 팩토리 메소드

```java
public record OrderResponse(
    Long id,
    String market,
    String orderType,
    BigDecimal price,
    BigDecimal quantity,
    String status,
    LocalDateTime createdAt
) {
    public static OrderResponse from(Order order) {
        return new OrderResponse(
            order.getId(),
            order.getCoin().getMarket(),
            order.getOrderType().name(),
            order.getPrice(),
            order.getQuantity(),
            order.getStatus().name(),
            order.getCreatedAt()
        );
    }
}
```

### 예외 처리

- 비즈니스 예외: BusinessException 상속
- 에러 코드: ErrorCode enum 정의
- 에러 메시지: 한국어

```java
public enum ErrorCode {
    USER_NOT_FOUND("사용자를 찾을 수 없습니다."),
    INSUFFICIENT_BALANCE("잔액이 부족합니다."),
    ORDER_NOT_FOUND("주문을 찾을 수 없습니다."),
    INVALID_ORDER_STATUS("유효하지 않은 주문 상태입니다.");

    private final String message;
}
```

### 주의사항

- 주석 금지 (코드로 의도 표현)
- System.out.println 금지 (Logger 사용)
- 하드코딩 금지 (설정 파일 사용)
- N+1 쿼리 주의 (@EntityGraph, fetch join)

## API 응답 형식

```json
// 성공
{
  "data": { ... },
  "message": null
}

// 실패
{
  "data": null,
  "message": "잔액이 부족합니다."
}
```

## 업비트 API 연동

```java
@Component
@RequiredArgsConstructor
public class UpbitClient {
    private final WebClient webClient;
    private static final String BASE_URL = "https://api.upbit.com/v1";

    public List<TickerResponse> fetchTickers(List<String> markets) {
        return webClient.get()
            .uri(BASE_URL + "/ticker?markets={markets}", String.join(",", markets))
            .retrieve()
            .bodyToFlux(TickerResponse.class)
            .collectList()
            .block();
    }
}
```
