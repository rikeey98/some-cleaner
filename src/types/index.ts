export interface User {
  id: string | number
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

export interface DeleteProcessInput {
  diskId: number
  diskName: string
  internalPaths: string[]
  externalPaths: string[]
  toEmails: string[]
  ccEmails: string[]
}

export interface DeleteProcess extends DeleteProcessInput {
  id: number
  createdBy: string
  createdAt: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  executedAt?: string
  message?: string
}
