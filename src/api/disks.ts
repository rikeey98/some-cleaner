import client from './client'
import type { Disk } from '@/types'

interface DiskResponse {
  id: number
  name: string
  alert: string
  threshold: number
  usage: number
  project: string
  created_date: string
}

interface PaginatedResponse<T> {
  results: T[]
}

function isPaginatedResponse<T>(data: unknown): data is PaginatedResponse<T> {
  return Boolean(data) && typeof data === 'object' && Array.isArray((data as PaginatedResponse<T>).results)
}

function toDisk(disk: DiskResponse): Disk {
  return {
    id: disk.id,
    name: disk.name,
    alert: disk.alert === 'y' ? 'y' : 'n',
    threshold: Number(disk.threshold),
    usage: Number(disk.usage),
    project: disk.project,
    createdDate: disk.created_date,
  }
}

export async function getDisks() {
  const response = await client.get<DiskResponse[] | PaginatedResponse<DiskResponse>>('/some/disk/')
  const disks = isPaginatedResponse<DiskResponse>(response.data) ? response.data.results : response.data

  return {
    ...response,
    data: disks.map(toDisk),
  }
}
