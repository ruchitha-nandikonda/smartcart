import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

interface AuthState {
  token: string | null
  refreshToken: string | null
  userId: string | null
  username: string | null
}

const initialState: AuthState = {
  token: localStorage.getItem('accessToken') || localStorage.getItem('token'),
  refreshToken: localStorage.getItem('refreshToken'),
  userId: localStorage.getItem('userId'),
  username: localStorage.getItem('username') || localStorage.getItem('email'),
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuth: (
      state,
      action: PayloadAction<{
        token?: string
        accessToken?: string
        refreshToken?: string
        userId: string
        username?: string
        /** @deprecated migrated to username */
        email?: string
      }>
    ) => {
      const accessToken = action.payload.accessToken || action.payload.token
      const uname = action.payload.username ?? action.payload.email ?? null
      state.token = accessToken || null
      state.refreshToken = action.payload.refreshToken || null
      state.userId = action.payload.userId
      state.username = uname

      if (accessToken) {
        localStorage.setItem('accessToken', accessToken)
        localStorage.setItem('token', accessToken)
      }
      if (action.payload.refreshToken) {
        localStorage.setItem('refreshToken', action.payload.refreshToken)
      }
      localStorage.setItem('userId', action.payload.userId)
      if (uname) {
        localStorage.setItem('username', uname)
        localStorage.removeItem('email')
      }
    },
    clearAuth: (state) => {
      state.token = null
      state.refreshToken = null
      state.userId = null
      state.username = null
      localStorage.removeItem('token')
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('userId')
      localStorage.removeItem('username')
      localStorage.removeItem('email')
    },
  },
})

export const { setAuth, clearAuth } = authSlice.actions
export default authSlice.reducer
