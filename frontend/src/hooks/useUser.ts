import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/axios'
import { useAuthStore } from '@/stores/authStore'
import type { ApiResponse, User } from '@/types'

export function useUser() {
  const { isAuthenticated } = useAuthStore()

  return useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const response = await api.get<ApiResponse<User>>('/api/users/me')
      return response.data.data
    },
    enabled: isAuthenticated,
  })
}

export function useResetBalance() {
  const queryClient = useQueryClient()
  const { setUser } = useAuthStore()

  return useMutation({
    mutationFn: async () => {
      const response = await api.post<ApiResponse<{ balance: number }>>('/api/users/reset-balance')
      return response.data.data
    },
    onSuccess: async () => {
      const userResponse = await api.get<ApiResponse<User>>('/api/users/me')
      setUser(userResponse.data.data)
      queryClient.invalidateQueries({ queryKey: ['user'] })
      queryClient.invalidateQueries({ queryKey: ['portfolio'] })
    },
  })
}
