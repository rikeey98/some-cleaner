import { http, HttpResponse } from 'msw'
import type { User, DeleteProcess, DeleteProcessInput } from '@/types'

const BASE_URL = import.meta.env.VITE_API_URL

const mockUser: User = { id: 1, name: '홍길동', email: 'hong@company.com' }

const mockDisks = [
  { id: 1, name: 's5e9985v0', alert: 'n', threshold: 70, usage: 63, project: 'project1', created_date: '2026-04-01T09:00:00Z' },
  { id: 2, name: 's5e9985v1', alert: 'y', threshold: 70, usage: 91, project: 'archive', created_date: '2026-04-03T09:00:00Z' },
  { id: 3, name: 's5e9985v2', alert: 'n', threshold: 80, usage: 42, project: 'tmp-workspace', created_date: '2026-04-05T09:00:00Z' },
  { id: 4, name: 's5e9985v3', alert: 'y', threshold: 85, usage: 96, project: 'backup', created_date: '2026-04-07T09:00:00Z' },
]

const mockProcesses: DeleteProcess[] = [
  {
    id: 1,
    diskId: 1,
    diskName: 'project1-data',
    internalPaths: ['/data/project1/logs/2024', '/data/project1/cache'],
    externalPaths: ['/archive/project1/logs/2024'],
    toEmails: ['hong@company.com'],
    ccEmails: ['team@company.com'],
    createdBy: '홍길동',
    createdAt: '2026-04-10T09:00:00Z',
    status: 'completed',
    executedAt: '2026-04-10T09:05:00Z',
  },
  {
    id: 2,
    diskId: 2,
    diskName: 'logs-archive',
    internalPaths: ['/data/logs/2023'],
    externalPaths: ['/archive/logs/2023'],
    toEmails: ['hong@company.com'],
    ccEmails: [],
    createdBy: '홍길동',
    createdAt: '2026-04-15T14:00:00Z',
    status: 'running',
    executedAt: '2026-04-15T14:01:00Z',
  },
  {
    id: 3,
    diskId: 4,
    diskName: 'backup-store',
    internalPaths: ['/backup/main/2022'],
    externalPaths: ['/cold-storage/2022'],
    toEmails: ['hong@company.com'],
    ccEmails: [],
    createdBy: '홍길동',
    createdAt: '2026-04-16T08:00:00Z',
    status: 'pending',
  },
]

function toProcessInput(process: DeleteProcess): DeleteProcessInput {
  return {
    diskId: process.diskId,
    diskName: process.diskName,
    internalPaths: process.internalPaths,
    externalPaths: process.externalPaths,
    toEmails: process.toEmails,
    ccEmails: process.ccEmails,
  }
}

function getLatestProcessForDisk(diskId: number) {
  return mockProcesses
    .filter((process) => process.diskId === diskId)
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))[0]
}

export const handlers = [
  http.post(`${BASE_URL}/api/auth/login`, () =>
    HttpResponse.json({ token: 'mock-token-abc123', user: mockUser })
  ),

  http.get(`${BASE_URL}/openid/me`, () =>
    HttpResponse.json(mockUser)
  ),

  http.get(`${BASE_URL}/some/disk/`, () =>
    HttpResponse.json(mockDisks)
  ),

  http.get(`${BASE_URL}/api/process/latest-config/:diskId/`, ({ params }) => {
    const latest = getLatestProcessForDisk(Number(params.diskId))
    return latest ? HttpResponse.json(toProcessInput(latest)) : new HttpResponse(null, { status: 404 })
  }),

  http.get(`${BASE_URL}/api/process/`, () =>
    HttpResponse.json(mockProcesses)
  ),

  http.post(`${BASE_URL}/api/process/`, async ({ request }) => {
    const body = await request.json() as DeleteProcessInput
    const newProcess: DeleteProcess = {
      id: mockProcesses.length + 1,
      ...body,
      createdBy: mockUser.name,
      createdAt: new Date().toISOString(),
      status: 'pending',
    }
    mockProcesses.unshift(newProcess)
    return HttpResponse.json(newProcess, { status: 201 })
  }),
]
