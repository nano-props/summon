import type { StateCreator } from 'zustand'
import { isEqual } from 'lodash-es'
import type { SummonState, WindowsSlice } from '#/renderer/src/store/types.ts'
import type { WindowsResponse } from '#/renderer/src/types.ts'

let lastData: WindowsResponse | null = null

export const createWindowsSlice: StateCreator<SummonState, [], [], WindowsSlice> = (set) => {
  return {
    windows: [],

    fetchWindows: async () => {
      try {
        const data = await window.summonAPI.getWindows()
        if (!data) return
        if (isEqual(data, lastData)) return
        lastData = data
        set({ windows: data.windows })
      } catch (e) {
        console.error('Failed to fetch:', e)
      }
    },

    activateWindow: async (id) => {
      try {
        const result = await window.summonAPI.activateWindow(id)
        if (!result?.ok) console.error('Activate failed:', result?.error ?? 'unknown error')
      } catch (e) {
        console.error('Activate failed:', e)
      }
    },
  }
}
