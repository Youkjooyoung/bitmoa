import { useQuery } from '@tanstack/react-query'
import api from '@/lib/axios'
import type { ApiResponse, Trade, Page } from '@/types'

export function useTrades(market?: string) {
  return useQuery({
    queryKey: ['trades', market],
    queryFn: async () => {
      const params = market ? `?market=${market}` : ''
      const response = await api.get<ApiResponse<Page<Trade>>>(`/api/trades${params}`)
      return response.data.data
    },
  })
}
