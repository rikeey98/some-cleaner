import { create } from 'zustand'
import type { User } from '@/types'
import { getMe } from '@/api/auth'
import { authDebugError, authDebugLog, getAuthDebugSnapshot, toAuthDebugError } from '@/lib/authDebug'

const isLocalMode = import.meta.env.VITE_USE_MOCK === 'true'

interface AuthState {
  token: string | null
  user: User | null
  isAuthenticated: boolean
  login: (token: string, user: User) => void
  logout: () => void
  fetchUser: () => Promise<void>
  setLocalAuth: () => void
  setUserFromSession: (user: User) => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: isLocalMode ? localStorage.getItem('token') : null,
  user: null,
  isAuthenticated: isLocalMode ? !!localStorage.getItem('token') : false,
  login: (token, user) => {
    localStorage.setItem('token', token)
    set({ token, user, isAuthenticated: true })
    authDebugLog('auth-store', 'login', getAuthDebugSnapshot({ userId: user.id }))
  },
  logout: () => {
    localStorage.removeItem('token')
    set({ token: null, user: null, isAuthenticated: false })
    authDebugLog('auth-store', 'logout', getAuthDebugSnapshot())
  },
  setLocalAuth: () => {
    const mockUserID = 'local.user'
    const mockToken = 'local-token-1234'
    localStorage.setItem('token', mockToken)
    set({ token: mockToken, user: { id: String(mockUserID), name: String(mockUserID), email:'local@company.com' }, isAuthenticated: true })
    authDebugLog('auth-store', 'setLocalAuth', getAuthDebugSnapshot({ userId: mockUserID }))
  },
  // HttpOnly 세션 쿠키 기반 인증: token 없이 user만 설정
  setUserFromSession: (user: User) => {
    set({ user, isAuthenticated: true })
    authDebugLog('auth-store', 'setUserFromSession', getAuthDebugSnapshot({ userId: user.id }))
  },
  fetchUser: async () => {
    authDebugLog('auth-store', 'fetchUser:start', getAuthDebugSnapshot({ isLocalMode }))
    if (isLocalMode) {
      get().setLocalAuth()
      return
    }

    // 운영 환경은 HttpOnly access_token + /openid/me 결과만 신뢰한다.
    try {
      const { data: user } = await getMe()
      set({ token: null, user, isAuthenticated: true })
      authDebugLog('auth-store', 'fetchUser:getMe success', getAuthDebugSnapshot({ userId: user.id }))
    } catch (error) {
      set({ token: null, user: null, isAuthenticated: false })
      authDebugError('auth-store', 'fetchUser:getMe failed', {
        ...toAuthDebugError(error),
        snapshot: getAuthDebugSnapshot(),
      })
    }
  },
}))
