import { apiClient } from './client'

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  userId: string
  email: string
}

export interface RegisterResponse {
  message: string
  otpCode?: string  // Only present in development mode
}

export const authApi = {
  register: async (data: { email: string; password: string }): Promise<RegisterResponse> => {
    const response = await apiClient.post<RegisterResponse>('/auth/register', data)
    return response.data
  },
  
  login: async (data: { email: string; password: string }): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/login', data)
    return response.data
  },
  
  refreshToken: async (refreshToken: string): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/refresh', { refreshToken })
    return response.data
  },
  
  forgotPassword: async (email: string): Promise<void> => {
    await apiClient.post('/auth/forgot-password', { email })
  },
  
  resetPassword: async (email: string, otp: string, newPassword: string): Promise<void> => {
    await apiClient.post('/auth/reset-password', { email, otp, newPassword })
  },
  
  verifyOTP: async (email: string, otp: string): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/verify-otp', { email, otp })
    return response.data
  },
  
  resendOTP: async (email: string): Promise<RegisterResponse> => {
    const response = await apiClient.post<RegisterResponse>('/auth/resend-otp', { email })
    return response.data
  },
  
  logout: () => {
    // Clear local storage is handled by Redux
  },
  
  deleteAccount: async (): Promise<void> => {
    await apiClient.delete('/auth/account')
  },
}
