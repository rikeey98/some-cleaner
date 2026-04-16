import { create } from 'zustand'
import type { DiskConfig } from '@/types'

interface DiskConfigState {
  configs: Record<number, DiskConfig>
  setConfig: (diskId: number, config: DiskConfig) => void
  getConfig: (diskId: number) => DiskConfig | undefined
}

export const useDiskConfigStore = create<DiskConfigState>((set, get) => ({
  configs: {},
  setConfig: (diskId, config) =>
    set((state) => ({ configs: { ...state.configs, [diskId]: config } })),
  getConfig: (diskId) => get().configs[diskId],
}))
