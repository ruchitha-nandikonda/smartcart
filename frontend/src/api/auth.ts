import { apiClient } from './client'

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  userId: string
  username: string
}

export const authApi = {
  register: async (data: { username: string; password: string }): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/register', data)
    return response.data
  },

  login: async (data: { username: string; password: string }): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/login', data)
    return response.data
  },

  refreshToken: async (refreshToken: string): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/refresh', { refreshToken })
    return response.data
  },

  resetPassword: async (username: string, newPassword: string): Promise<void> => {
    await apiClient.post('/auth/reset-password', { username, newPassword })
  },

  logout: () => {
    // Clear local storage is handled by Redux
  },

  deleteAccount: async (): Promise<void> => {
    await apiClient.delete('/auth/account')
  },
}
