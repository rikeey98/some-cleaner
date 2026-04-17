import client from './client'
import type { DeleteProcess, DeleteProcessInput } from '@/types'

export const getProcesses = () => client.get<DeleteProcess[]>('/api/process/')

export const getLatestProcessInput = (diskId: number) =>
  client.get<DeleteProcessInput>(`/api/process/latest-config/${diskId}/`).then((r) => r.data)

export const createProcess = (data: DeleteProcessInput) =>
  client.post<DeleteProcess>('/api/process/', data)
