export interface User {
  id: number
  email: string
  nickname: string
  balance: number
  createdAt: string
}

export interface TokenResponse {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

export interface Coin {
  market: string
  koreanName: string
  englishName: string
}

export interface Ticker {
  market: string
  tradePrice: number
  prevClosingPrice: number
  change: 'RISE' | 'FALL' | 'EVEN'
  changePrice: number
  changeRate: number
  tradeVolume: number
  accTradePrice24h: number
  highPrice: number
  lowPrice: number
}

export interface OrderbookUnit {
  price: number
  size: number
}

export interface Orderbook {
  market: string
  asks: OrderbookUnit[]
  bids: OrderbookUnit[]
}

export interface Candle {
  timestamp: string
  openingPrice: number
  highPrice: number
  lowPrice: number
  tradePrice: number
  candleAccTradeVolume: number
}

export interface Order {
  id: number
  market: string
  orderType: 'BUY' | 'SELL'
  orderMethod: 'LIMIT' | 'MARKET'
  price: number
  quantity: number
  filledQuantity: number
  status: 'PENDING' | 'FILLED' | 'PARTIAL' | 'CANCELLED'
  createdAt: string
}

export interface Holding {
  market: string
  koreanName: string
  quantity: number
  avgBuyPrice: number
  currentPrice: number
  evaluationAmount: number
  profitLoss: number
  profitLossRate: number
}

export interface Portfolio {
  balance: number
  holdings: Holding[]
}

export interface PortfolioSummary {
  totalAsset: number
  totalBuyAmount: number
  totalEvaluationAmount: number
  totalProfitLoss: number
  totalProfitLossRate: number
}

export interface Trade {
  id: number
  orderId: number
  market: string
  tradeType: 'BUY' | 'SELL'
  price: number
  quantity: number
  totalAmount: number
  fee: number
  createdAt: string
}

export interface TradeTick {
  market: string
  tradeDateUtc: string
  tradeTimeUtc: string
  timestamp: number
  tradePrice: number
  tradeVolume: number
  prevClosingPrice: number
  changePrice: number
  askBid: 'ASK' | 'BID'
  sequentialId: number
}

export interface ApiResponse<T> {
  data: T
  message?: string
}

export interface Page<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}

export interface SignupRequest {
  email: string
  password: string
  nickname: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface OrderRequest {
  market: string
  orderType: 'BUY' | 'SELL'
  orderMethod: 'LIMIT' | 'MARKET'
  price?: number
  quantity: number
}
