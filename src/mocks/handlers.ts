import { http, HttpResponse } from 'msw'
import type { Script, User } from '@/types'

const BASE_URL = import.meta.env.VITE_API_URL

const mockUser: User = { id: 1, name: '홍길동', email: 'hong@company.com' }

const mockScripts: Script[] = [
  {
    id: 1,
    internalPath: '/data/logs/2024',
    externalPath: '/archive/logs/2024',
    createdBy: '홍길동',
    createdAt: '2026-04-10T09:00:00Z',
    status: 'completed',
    executedAt: '2026-04-10T09:05:00Z',
  },
  {
    id: 2,
    internalPath: '/data/tmp',
    externalPath: '/archive/tmp',
    createdBy: '홍길동',
    createdAt: '2026-04-15T14:00:00Z',
    status: 'running',
    executedAt: '2026-04-15T14:01:00Z',
  },
  {
    id: 3,
    internalPath: '/data/cache',
    externalPath: '/archive/cache',
    createdBy: '홍길동',
    createdAt: '2026-04-16T08:00:00Z',
    status: 'pending',
  },
]

export const handlers = [
  http.post(`${BASE_URL}/api/auth/login`, () => {
    return HttpResponse.json({ token: 'mock-token-abc123', user: mockUser })
  }),

  http.get(`${BASE_URL}/api/auth/me`, () => {
    return HttpResponse.json(mockUser)
  }),

  http.get(`${BASE_URL}/api/scripts/`, () => {
    return HttpResponse.json(mockScripts)
  }),

  http.post(`${BASE_URL}/api/scripts/`, async ({ request }) => {
    const body = await request.json() as Pick<Script, 'internalPath' | 'externalPath'>
    const newScript: Script = {
      id: mockScripts.length + 1,
      ...body,
      createdBy: mockUser.name,
      createdAt: new Date().toISOString(),
      status: 'pending',
    }
    mockScripts.unshift(newScript)
    return HttpResponse.json(newScript, { status: 201 })
  }),
]
