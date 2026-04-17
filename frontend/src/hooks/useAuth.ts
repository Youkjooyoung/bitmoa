import { useMutation } from '@tanstack/react-query'
import api from '@/lib/axios'
import { useAuthStore } from '@/stores/authStore'
import type { ApiResponse, TokenResponse, User, SignupRequest, LoginRequest } from '@/types'

export function useSignup() {
  return useMutation({
    mutationFn: async (data: SignupRequest) => {
      const response = await api.post<ApiResponse<User>>('/api/auth/signup', data)
      return response.data.data
    },
  })
}

export function useLogin() {
  const { setAuth } = useAuthStore()

  return useMutation({
    mutationFn: async (data: LoginRequest) => {
      const response = await api.post<ApiResponse<TokenResponse>>('/api/auth/login', data)
      return response.data.data
    },
    onSuccess: async (data) => {
      localStorage.setItem('accessToken', data.accessToken)
      localStorage.setItem('refreshToken', data.refreshToken)
      const userResponse = await api.get<ApiResponse<User>>('/api/users/me')
      setAuth(userResponse.data.data, data.accessToken, data.refreshToken)
    },
  })
}

export function useLogout() {
  const { logout } = useAuthStore()

  return useMutation({
    mutationFn: async () => {
      await api.post('/api/auth/logout')
    },
    onSettled: () => {
      logout()
    },
  })
}
