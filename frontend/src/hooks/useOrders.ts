import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/axios'
import { useAuthStore } from '@/stores/authStore'
import type { ApiResponse, Order, OrderRequest, Page } from '@/types'

export function useOrders(status?: string) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  return useQuery({
    queryKey: ['orders', status],
    queryFn: async () => {
      const params = status ? `?status=${status}` : ''
      const response = await api.get<ApiResponse<Page<Order>>>(`/api/orders${params}`)
      return response.data.data
    },
    enabled: isAuthenticated,
    refetchInterval: status === 'PENDING' ? 3000 : false,
    refetchOnWindowFocus: true,
  })
}

export function useCreateOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: OrderRequest) => {
      const response = await api.post<ApiResponse<Order>>('/api/orders', data)
      return response.data.data
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ['user'] }),
        queryClient.refetchQueries({ queryKey: ['orders'] }),
        queryClient.refetchQueries({ queryKey: ['portfolio'] }),
      ])
    },
  })
}

export function useCancelOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (orderId: number) => {
      await api.delete(`/api/orders/${orderId}`)
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ['user'] }),
        queryClient.refetchQueries({ queryKey: ['orders'] }),
        queryClient.refetchQueries({ queryKey: ['portfolio'] }),
      ])
    },
  })
}
