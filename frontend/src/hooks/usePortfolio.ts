import { useQuery } from '@tanstack/react-query'
import api from '@/lib/axios'
import { useAuthStore } from '@/stores/authStore'
import type { ApiResponse, Portfolio, PortfolioSummary } from '@/types'

export function usePortfolio() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  return useQuery({
    queryKey: ['portfolio'],
    queryFn: async () => {
      const response = await api.get<ApiResponse<Portfolio>>('/api/portfolio')
      return response.data.data
    },
    enabled: isAuthenticated,
  })
}

export function usePortfolioSummary() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  return useQuery({
    queryKey: ['portfolio', 'summary'],
    queryFn: async () => {
      const response = await api.get<ApiResponse<PortfolioSummary>>('/api/portfolio/summary')
      return response.data.data
    },
    enabled: isAuthenticated,
  })
}
