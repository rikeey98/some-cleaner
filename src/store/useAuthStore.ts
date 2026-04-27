import { create } from 'zustand'
import type { User } from '@/types'
import { getMe } from '@/api/auth'
import { authDebugError, authDebugLog, getAuthDebugSnapshot, toAuthDebugError } from '@/lib/authDebug'

const isLocalMode = import.meta.env.VITE_USE_MOCK === 'true'

function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null
  return null
}

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
  token: localStorage.getItem('token') || getCookie('token'),
  user: null,
  isAuthenticated: !!(localStorage.getItem('token') || getCookie('token')),
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

    // 1. non-HttpOnly 쿠키에서 직접 읽기
    const userId = getCookie('userID')
    const token = getCookie('token')
    if (userId && token) {
      set({ token, user: { id: userId, name: String(userId), email: `${userId}@samsung.com` }, isAuthenticated: true })
      localStorage.setItem('token', token)
      authDebugLog('auth-store', 'fetchUser:using visible cookies', getAuthDebugSnapshot({ userId }))
      return
    }

    // 2. HttpOnly 쿠키 or 세션: API 호출로 인증 확인
    // axios interceptor가 token null이면 Authorization 헤더 생략하므로
    // 브라우저가 HttpOnly 쿠키를 자동으로 요청에 포함
    try {
      const { data: user } = await getMe()
      set({ user, isAuthenticated: true })
      authDebugLog('auth-store', 'fetchUser:getMe success', getAuthDebugSnapshot({ userId: user.id }))
    } catch (error) {
      // 인증되지 않음, 상태 변경 없음
      authDebugError('auth-store', 'fetchUser:getMe failed', {
        ...toAuthDebugError(error),
        snapshot: getAuthDebugSnapshot(),
      })
    }
  },
}))
