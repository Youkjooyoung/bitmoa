import { useQuery } from '@tanstack/react-query'
import api from '@/lib/axios'
import type { ApiResponse, Coin, Ticker, Orderbook, Candle, TradeTick } from '@/types'

export function useCoins() {
  return useQuery({
    queryKey: ['coins'],
    queryFn: async () => {
      const response = await api.get<ApiResponse<Coin[]>>('/api/coins')
      return response.data.data
    },
  })
}

export function useTicker(market: string) {
  return useQuery({
    queryKey: ['ticker', market],
    queryFn: async () => {
      const response = await api.get<ApiResponse<Ticker>>(`/api/coins/${market}/ticker`)
      return response.data.data
    },
    enabled: !!market,
    refetchInterval: 5000,
  })
}

export function useOrderbook(market: string) {
  return useQuery({
    queryKey: ['orderbook', market],
    queryFn: async () => {
      const response = await api.get<ApiResponse<Orderbook>>(`/api/coins/${market}/orderbook`)
      return response.data.data
    },
    enabled: !!market,
    refetchInterval: 3000,
  })
}

export function useMarketTrades(market: string, count: number = 50) {
  return useQuery({
    queryKey: ['marketTrades', market, count],
    queryFn: async () => {
      const response = await api.get<ApiResponse<TradeTick[]>>(
        `/api/coins/${market}/trades?count=${count}`
      )
      return response.data.data
    },
    enabled: !!market,
    refetchInterval: 1500,
  })
}

export function useCandles(market: string, type: string = 'minutes', unit: number = 1, count: number = 100) {
  return useQuery({
    queryKey: ['candles', market, type, unit, count],
    queryFn: async () => {
      const response = await api.get<ApiResponse<Candle[]>>(
        `/api/coins/${market}/candles?type=${type}&unit=${unit}&count=${count}`
      )
      return response.data.data
    },
    enabled: !!market,
    retry: 2,
    staleTime: 30000,
  })
}
