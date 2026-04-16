export interface User {
  id: number
  name: string
  email: string
}

export interface Script {
  id: number
  internalPath: string
  externalPath: string
  createdBy: string
  createdAt: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  executedAt?: string
  message?: string
}
