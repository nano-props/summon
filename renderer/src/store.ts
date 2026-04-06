import { create } from 'zustand'
import { isEqual, keyBy, compact, debounce } from 'lodash-es'
import type { WindowDTO } from './types'

interface SummonState {
  version: string
  windows: WindowDTO[]
  query: string
  savedId: string | null
  dark: boolean
  _lastData: unknown

  setQuery: (q: string) => void
  toggleTheme: () => void
  fetchWindows: () => Promise<void>
  activateWindow: (id: string) => Promise<void>
  saveAlias: (id: string, alias: string) => Promise<void>
  reorderWindows: (orderedIds: string[]) => Promise<void>
}

const clearSavedFeedback = debounce(() => useStore.setState({ savedId: null }), 800)

export const useStore = create<SummonState>((set, get) => ({
  version: '',
  windows: [],
  query: '',
  savedId: null,
  dark: (() => {
    const isDark = localStorage.getItem('theme') === 'dark'
    document.documentElement.classList.toggle('dark', isDark)
    return isDark
  })(),
  _lastData: null,

  setQuery: (q) => set({ query: q }),

  toggleTheme: () => {
    const next = !get().dark
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('theme', next ? 'dark' : 'light')
    set({ dark: next })
  },

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
}))
