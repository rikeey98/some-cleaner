import client from './client'
import type { User } from '@/types'

export const login = (username: string, password: string) =>
  client.post<{ token: string; user: User }>('/api/auth/login', { username, password })

export const getMe = () =>
  client.get<User>('/api/auth/me')
