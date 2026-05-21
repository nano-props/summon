import type { StateCreator } from 'zustand'
import { isEqual } from 'lodash-es'
import type { SummonState, WindowsSlice } from './types'
import type { WindowsResponse } from '../types'

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
        await window.summonAPI.activateWindow(id)
      } catch (e) {
        console.error('Activate failed:', e)
      }
    },
  }
}
