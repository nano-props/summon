import type { StateCreator } from 'zustand'
import { isEqual, keyBy, compact, debounce } from 'lodash-es'
import type { SummonState, WindowsSlice } from './types'

export const createWindowsSlice: StateCreator<SummonState, [], [], WindowsSlice> = (set, get) => {
  const clearSavedFeedback = debounce(() => set({ savedId: null }), 800)

  return {
    version: '',
    windows: [],
    _lastData: null,

    fetchWindows: async () => {
      try {
        const data = await window.summonAPI.getWindows()
        if (!data) return
        if (isEqual(data, get()._lastData)) return
        set({ _lastData: data, version: data.version, windows: data.windows })
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

    saveAlias: async (id, alias) => {
      try {
        await window.summonAPI.saveAlias(id, alias)
        set((state) => ({
          savedId: id,
          _lastData: null,
          windows: state.windows.map((w) => (w.id === id ? { ...w, alias } : w)),
        }))
        clearSavedFeedback()
      } catch (e) {
        console.error('Save failed:', e)
      }
    },

    reorderWindows: async (orderedIds) => {
      try {
        await window.summonAPI.reorderWindows(orderedIds)
        set((state) => {
          const byId = keyBy(state.windows, 'id')
          const reordered = compact(orderedIds.map((id) => byId[id]))
          return { windows: reordered, _lastData: null }
        })
      } catch (e) {
        console.error('Reorder failed:', e)
      }
    },
  }
}
