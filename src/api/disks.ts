import client from './client'
import type { Disk } from '@/types'

export const getDisks = () => client.get<Disk[]>('/api/disks/')
