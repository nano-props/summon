import type { StateCreator } from 'zustand'
import { summonClient } from '#/renderer/src/data/summon-client.ts'
import type { SummonState, WindowsSlice } from '#/renderer/src/store/types.ts'
import type { WindowDto, WindowsState } from '#/src/shared/contracts.ts'

function cloneWindow(window: WindowDto): WindowDto {
  return { ...window, gitRepo: window.gitRepo ? { ...window.gitRepo } : null }
}

export const createWindowsSlice: StateCreator<SummonState, [], [], WindowsSlice> = (set, get) => {
  const syncWindows = (state: WindowsState) => {
    if (state.version <= get().windowsVersion) return
    set({ windowsVersion: state.version, windows: state.windows.map(cloneWindow) })
  }

  return {
    windowsVersion: -1,
    windows: [],

    loadWindows: async () => {
      try {
        const data = await summonClient.getWindows()
        if (!data) return
        syncWindows(data)
      } catch (e) {
        console.error('Failed to load windows:', e)
      }
    },

    syncWindows,

    activateWindow: (window) => summonClient.activateWindow(window),
  }
}
