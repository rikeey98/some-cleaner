export interface User {
  id: number
  name: string
  email: string
}

export interface Disk {
  id: number
  name: string
  mountPath: string
  server: string
  usedGB: number
  quotaGB: number
}

export interface DeleteProcess {
  id: number
  diskId: number
  diskName: string
  internalPaths: string[]
  externalPaths: string[]
  toEmail: string
  ccEmail: string
  createdBy: string
  createdAt: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  executedAt?: string
  message?: string
}
