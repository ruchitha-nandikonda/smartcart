import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

interface AuthState {
  token: string | null  // accessToken (kept as token for backward compatibility)
  refreshToken: string | null
  userId: string | null
  email: string | null
}

const initialState: AuthState = {
  token: localStorage.getItem('accessToken') || localStorage.getItem('token'), // backward compatibility
  refreshToken: localStorage.getItem('refreshToken'),
  userId: localStorage.getItem('userId'),
  email: localStorage.getItem('email'),
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuth: (state, action: PayloadAction<{ 
      token?: string  // legacy field name
      accessToken?: string
      refreshToken?: string
      userId: string
      email: string 
    }>) => {
      const accessToken = action.payload.accessToken || action.payload.token
      state.token = accessToken || null
      state.refreshToken = action.payload.refreshToken || null
      state.userId = action.payload.userId
      state.email = action.payload.email
      
      // Store in localStorage
      if (accessToken) {
        localStorage.setItem('accessToken', accessToken)
        localStorage.setItem('token', accessToken) // legacy compatibility
      }
      if (action.payload.refreshToken) {
        localStorage.setItem('refreshToken', action.payload.refreshToken)
      }
      localStorage.setItem('userId', action.payload.userId)
      localStorage.setItem('email', action.payload.email)
    },
    clearAuth: (state) => {
      state.token = null
      state.refreshToken = null
      state.userId = null
      state.email = null
      localStorage.removeItem('token')
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('userId')
      localStorage.removeItem('email')
    },
  },
})

export const { setAuth, clearAuth } = authSlice.actions
export default authSlice.reducer
