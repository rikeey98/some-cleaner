import { http, HttpResponse } from 'msw'
import type { User, Disk, DiskConfig, DeleteProcess } from '@/types'

const BASE_URL = import.meta.env.VITE_API_URL

const mockUser: User = { id: 1, name: '홍길동', email: 'hong@company.com' }

const mockDisks: Disk[] = [
  { id: 1, name: 'project1-data', mountPath: '/data/project1', server: 'server01', usedGB: 350, quotaGB: 500 },
  { id: 2, name: 'logs-archive',  mountPath: '/data/logs',     server: 'server01', usedGB: 460, quotaGB: 500 },
  { id: 3, name: 'tmp-workspace', mountPath: '/data/tmp',      server: 'server02', usedGB: 120, quotaGB: 500 },
  { id: 4, name: 'backup-store',  mountPath: '/backup/main',   server: 'server02', usedGB: 480, quotaGB: 500 },
]

const mockDiskConfigs: Record<number, DiskConfig> = {
  1: {
    diskId: 1, diskName: 'project1-data',
    internalPaths: ['/data/project1/logs/2024', '/data/project1/cache'],
    externalPaths: ['/archive/project1/logs/2024'],
    toEmails: ['hong@company.com'], ccEmails: ['team@company.com'],
  },
  2: {
    diskId: 2, diskName: 'logs-archive',
    internalPaths: ['/data/logs/2023'],
    externalPaths: ['/archive/logs/2023'],
    toEmails: ['hong@company.com'], ccEmails: [],
  },
}

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

export const handlers = [
  http.post(`${BASE_URL}/api/auth/login`, () =>
    HttpResponse.json({ token: 'mock-token-abc123', user: mockUser })
  ),

  http.get(`${BASE_URL}/api/auth/me`, () =>
    HttpResponse.json(mockUser)
  ),

  http.get(`${BASE_URL}/api/disks/`, () =>
    HttpResponse.json(mockDisks)
  ),

  http.get(`${BASE_URL}/api/disk-configs/`, () =>
    HttpResponse.json(Object.values(mockDiskConfigs))
  ),

  http.get(`${BASE_URL}/api/disk-configs/:diskId`, ({ params }) => {
    const config = mockDiskConfigs[Number(params.diskId)]
    return config ? HttpResponse.json(config) : new HttpResponse(null, { status: 404 })
  }),

  http.put(`${BASE_URL}/api/disk-recipients/:diskId`, async ({ params, request }) => {
    const body = await request.json() as { toEmails: string[], ccEmails: string[] }
    const diskId = Number(params.diskId)
    if (mockDiskConfigs[diskId]) {
      mockDiskConfigs[diskId] = { ...mockDiskConfigs[diskId], ...body }
    }
    return HttpResponse.json(body)
  }),

  http.get(`${BASE_URL}/api/process/`, () =>
    HttpResponse.json(mockProcesses)
  ),

  http.post(`${BASE_URL}/api/process/`, async ({ request }) => {
    const body = await request.json() as Omit<DeleteProcess, 'id' | 'createdBy' | 'createdAt' | 'status'>
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
