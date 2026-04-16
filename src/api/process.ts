import client from './client'
import type { DeleteProcess } from '@/types'

export const getProcesses = () => client.get<DeleteProcess[]>('/api/process/')

export const createProcess = (data: Omit<DeleteProcess, 'id' | 'createdBy' | 'createdAt' | 'status'>) =>
  client.post<DeleteProcess>('/api/process/', data)
