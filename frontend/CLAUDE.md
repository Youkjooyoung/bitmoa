# Frontend - 비트모아

Next.js 14 기반 암호화폐 거래소 프론트엔드

## 기술 스택

- Next.js 14 (App Router)
- TypeScript (strict mode)
- Tailwind CSS
- shadcn/ui (컴포넌트 라이브러리)
- Zustand (클라이언트 상태)
- TanStack Query v5 (서버 상태)
- STOMP.js + SockJS (WebSocket)
- Lightweight Charts (차트)

## 실행 방법

```bash
npm install
npm run dev
```

## 디렉토리 구조

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # 인증 페이지 (로그인, 회원가입)
│   └── (main)/            # 메인 페이지 (거래, 포트폴리오)
├── components/
│   ├── ui/                # shadcn/ui 컴포넌트
│   ├── layout/            # Header, Sidebar
│   ├── auth/              # 인증 관련
│   ├── trade/             # 거래 관련
│   └── portfolio/         # 포트폴리오 관련
├── hooks/                 # TanStack Query 훅
├── stores/                # Zustand 스토어
├── lib/                   # 유틸리티 (axios, queryClient)
└── types/                 # TypeScript 타입 정의
```

## 코드 컨벤션

### 파일 구조 (React 컴포넌트)
```typescript
export default function ComponentName() {
  // 1. 상태 (useState, useStore)
  const [state, setState] = useState()
  const { user } = useAuthStore()

  // 2. 쿼리/뮤테이션
  const { data } = useQuery()

  // 3. 이벤트 핸들러
  const handleClick = () => {}

  // 4. useEffect
  useEffect(() => {}, [])

  // 5. return
  return <div>...</div>
}
```

### CSS 규칙
- module.css만 사용
- 인라인 스타일 금지
- Tailwind는 shadcn/ui 컴포넌트 내부에서만

```typescript
// Good
import styles from './Component.module.css'
<div className={styles.container}>

// Bad
<div style={{ padding: 10 }}>
<div className="p-4 m-2">
```

### 네이밍
- 컴포넌트: PascalCase (OrderForm.tsx)
- 훅: camelCase, use 접두사 (useOrders.ts)
- 스토어: camelCase, Store 접미사 (authStore.ts)
- CSS 클래스: camelCase (styles.orderButton)

### 주의사항
- 주석 금지
- console.log 금지 (개발 중에만)
- any 타입 금지
- 에러 메시지는 한국어

## API 연동

```typescript
// lib/axios.ts
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
})

// hooks/useOrders.ts
export function useCreateOrder() {
  return useMutation({
    mutationFn: (data: OrderRequest) => api.post('/api/orders', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.invalidateQueries({ queryKey: ['portfolio'] })
    },
  })
}
```

## WebSocket 연동

```typescript
// hooks/useWebSocket.ts
const client = new Client({
  brokerURL: process.env.NEXT_PUBLIC_WS_URL,
  onConnect: () => {
    client.subscribe('/topic/ticker/all', (message) => {
      useTickerStore.getState().updateTickers(JSON.parse(message.body))
    })
  },
})
```
