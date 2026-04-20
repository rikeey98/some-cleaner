import { create } from 'zustand'
import type { User } from '@/types'

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
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: localStorage.getItem('token') || getCookie('token'),
  user: null,
  isAuthenticated: !!(localStorage.getItem('token') || getCookie('token')),
  login: (token, user) => {
    localStorage.setItem('token', token)
    set({ token, user, isAuthenticated: true })
  },
  logout: () => {
    localStorage.removeItem('token')
    set({ token: null, user: null, isAuthenticated: false })
  },
  setLocalAuth: () => {
    const mockUserID = 'local.user'
    const mockToken = 'local-token-1234'
    localStorage.setItem('token', mockToken)
    set({ token: mockToken, user: { id: String(mockUserID), name: String(mockUserID), email:'local@company.com' }, isAuthenticated: true })
  },
  fetchUser: async () => {
    if (isLocalMode) {
      get().setLocalAuth()
      return
    }

    try {
      const userId = getCookie('userID')
      const token = getCookie('token')

      if (userId && token) {
        set({ token, user: { id: userId, name: String(userId), email: `${userId}@samsung.com` }, isAuthenticated: true })
        localStorage.setItem('token', token)
      }
    } catch (err) {
      console.error('fetchUser failed:', err)
      get().logout()
      throw err
    }
  },
}))
