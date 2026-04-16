import { create } from 'zustand'
import { getDisks } from '@/api/disks'
import type { Disk } from '@/types'

interface DiskState {
  disks: Disk[]
  isLoading: boolean
  fetchDisks: () => Promise<void>
}

export const useDiskStore = create<DiskState>((set) => ({
  disks: [],
  isLoading: false,
  fetchDisks: async () => {
    set({ isLoading: true })
    const { data } = await getDisks()
    set({ disks: data, isLoading: false })
  },
}))
