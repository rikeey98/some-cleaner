import client from './client'
import type { DiskConfig } from '@/types'

export const getDiskConfigs = () =>
  client.get<DiskConfig[]>('/api/disk-configs/').then((r) => r.data)

export const getDiskConfig = (diskId: number) =>
  client.get<DiskConfig>(`/api/disk-configs/${diskId}/`).then((r) => r.data)

export const saveRecipients = (diskId: number, toEmails: string[], ccEmails: string[]) =>
  client.put(`/api/disk-recipients/${diskId}/`, { toEmails, ccEmails }).then((r) => r.data)
