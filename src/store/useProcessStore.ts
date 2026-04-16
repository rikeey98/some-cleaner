import { create } from 'zustand'
import { getProcesses, createProcess } from '@/api/process'
import type { DeleteProcess } from '@/types'

interface ProcessState {
  processes: DeleteProcess[]
  isLoading: boolean
  fetchProcesses: () => Promise<void>
  createProcess: (data: Omit<DeleteProcess, 'id' | 'createdBy' | 'createdAt' | 'status'>) => Promise<void>
}

export const useProcessStore = create<ProcessState>((set) => ({
  processes: [],
  isLoading: false,
  fetchProcesses: async () => {
    set({ isLoading: true })
    const { data } = await getProcesses()
    set({ processes: data, isLoading: false })
  },
  createProcess: async (data) => {
    const { data: created } = await createProcess(data)
    set((state) => ({ processes: [created, ...state.processes] }))
  },
}))
