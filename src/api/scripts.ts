import client from './client'
import type { Script } from '@/types'

export const getScripts = () =>
  client.get<Script[]>('/api/scripts/')

export const createScript = (data: Pick<Script, 'internalPath' | 'externalPath'>) =>
  client.post<Script>('/api/scripts/', data)
