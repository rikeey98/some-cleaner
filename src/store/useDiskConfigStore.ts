import { create } from 'zustand'
import type { DiskConfig } from '@/types'
import { getDiskConfigs, getDiskConfig, saveRecipients } from '@/api/diskConfig'

interface DiskConfigState {
  configs: Record<number, DiskConfig>
  fetchAllConfigs: () => Promise<void>
  fetchConfig: (diskId: number) => Promise<void>
  saveConfig: (diskId: number, config: DiskConfig) => Promise<void>
  getConfig: (diskId: number) => DiskConfig | undefined
}

export const useDiskConfigStore = create<DiskConfigState>((set, get) => ({
  configs: {},

  fetchAllConfigs: async () => {
    const list = await getDiskConfigs()
    const map = Object.fromEntries(list.map((c) => [c.diskId, c]))
    set({ configs: map })
  },

  fetchConfig: async (diskId) => {
    try {
      const config = await getDiskConfig(diskId)
      set((state) => ({ configs: { ...state.configs, [diskId]: config } }))
    } catch {
      // 404 등: 설정 없음 — 기존 캐시 유지
    }
  },

  saveConfig: async (diskId, config) => {
    await saveRecipients(diskId, config.toEmails, config.ccEmails)
    set((state) => ({ configs: { ...state.configs, [diskId]: config } }))
  },

  getConfig: (diskId) => get().configs[diskId],
}))
