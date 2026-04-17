# 비트모아 (Bitmoa)

업비트 Open API를 활용한 모의 암호화폐 거래소

## 기술 스택

### Frontend
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS + shadcn/ui
- Zustand (상태관리)
- TanStack Query (서버 상태)
- STOMP.js (WebSocket)

### Backend
- Spring Boot 3.2
- Java 21
- Spring WebSocket + STOMP
- Spring Data JPA
- Spring Security + JWT
- Flyway (마이그레이션)

### Infrastructure
- PostgreSQL 15
- Redis 7
- Docker Compose
- Nginx (리버스 프록시)

### External API
- 업비트 Open API (https://docs.upbit.com)

## 실행 방법

```bash
# 전체 실행
docker-compose up -d

# 개발 모드
cd frontend && npm run dev
cd backend && ./gradlew bootRun
```

## 프로젝트 구조

```
bitmoa/
├── frontend/          # Next.js 프론트엔드
├── backend/           # Spring Boot 백엔드
├── nginx/             # Nginx 설정
└── docker-compose.yml
```

## 주요 기능

1. 회원가입/로그인 (JWT)
2. 실시간 시세 조회 (WebSocket)
3. 모의 매수/매도 주문
4. 포트폴리오 관리
5. 거래 내역 조회

## 코드 컨벤션

- 주석 금지 (코드로 의도 표현)
- 에러 메시지는 한국어
- CSS는 module.css만 사용 (인라인 스타일 금지)
