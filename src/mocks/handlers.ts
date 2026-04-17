import { http, HttpResponse } from 'msw'
import type { User, Disk, DeleteProcess, DeleteProcessInput } from '@/types'

const BASE_URL = import.meta.env.VITE_API_URL

const mockUser: User = { id: 1, name: '홍길동', email: 'hong@company.com' }

const mockDisks: Disk[] = [
  { id: 1, name: 'project1-data', mountPath: '/data/project1', server: 'server01', usedGB: 350, quotaGB: 500 },
  { id: 2, name: 'logs-archive',  mountPath: '/data/logs',     server: 'server01', usedGB: 460, quotaGB: 500 },
  { id: 3, name: 'tmp-workspace', mountPath: '/data/tmp',      server: 'server02', usedGB: 120, quotaGB: 500 },
  { id: 4, name: 'backup-store',  mountPath: '/backup/main',   server: 'server02', usedGB: 480, quotaGB: 500 },
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

  http.get(`${BASE_URL}/api/auth/me`, () =>
    HttpResponse.json(mockUser)
  ),

  http.get(`${BASE_URL}/api/disks/`, () =>
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
