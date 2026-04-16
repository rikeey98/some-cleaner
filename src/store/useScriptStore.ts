import { create } from 'zustand'
import { getScripts, createScript } from '@/api/scripts'
import type { Script } from '@/types'

interface ScriptState {
  scripts: Script[]
  isLoading: boolean
  fetchScripts: () => Promise<void>
  createScript: (data: Pick<Script, 'internalPath' | 'externalPath'>) => Promise<void>
}

export const useScriptStore = create<ScriptState>((set) => ({
  scripts: [],
  isLoading: false,
  fetchScripts: async () => {
    set({ isLoading: true })
    const { data } = await getScripts()
    set({ scripts: data, isLoading: false })
  },
  createScript: async (data) => {
    const { data: created } = await createScript(data)
    set((state) => ({ scripts: [created, ...state.scripts] }))
  },
}))
