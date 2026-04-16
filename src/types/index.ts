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

export interface DiskConfig {
  diskId: number
  diskName: string
  internalPaths: string[]
  externalPaths: string[]
  toEmails: string[]
  ccEmails: string[]
}

export interface DeleteProcess {
  id: number
  diskId: number
  diskName: string
  internalPaths: string[]
  externalPaths: string[]
  toEmails: string[]
  ccEmails: string[]
  createdBy: string
  createdAt: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  executedAt?: string
  message?: string
}
