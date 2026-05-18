import { create } from 'zustand'
import { isEqual, keyBy, compact, debounce } from 'lodash-es'
import type { ThemeMode, WindowDTO } from './types'

interface SummonState {
  version: string
  windows: WindowDTO[]
  query: string
  selectedIndex: number
  savedId: string | null
  theme: ThemeMode
  pinned: boolean
  shortcutEnabled: boolean
  _lastData: unknown

  setQuery: (q: string) => void
  setSelectedIndex: (i: number) => void
  setTheme: (mode: ThemeMode) => void
  togglePin: () => void
  toggleShortcut: () => void
  hydrate: () => Promise<void>
  fetchWindows: () => Promise<void>
  activateWindow: (id: string) => Promise<void>
  saveAlias: (id: string, alias: string) => Promise<void>
  reorderWindows: (orderedIds: string[]) => Promise<void>
}

const clearSavedFeedback = debounce(() => useStore.setState({ savedId: null }), 800)

const systemDarkMQ = window.matchMedia('(prefers-color-scheme: dark)')

function applyTheme(mode: ThemeMode) {
  const isDark = mode === 'dark' || (mode === 'auto' && systemDarkMQ.matches)
  document.documentElement.classList.toggle('dark', isDark)
}

export const useStore = create<SummonState>((set, get) => ({
  version: '',
  windows: [],
  query: '',
  selectedIndex: -1,
  savedId: null,
  theme: 'auto',
  pinned: false,
  shortcutEnabled: true,
  _lastData: null,

  setQuery: (q) => set({ query: q, selectedIndex: -1 }),
  setSelectedIndex: (i) => set({ selectedIndex: i }),

  setTheme: async (mode) => {
    const prev = get().theme
    applyTheme(mode)
    set({ theme: mode })
    const result = await window.summonAPI.setTheme(mode)
    if (!result?.ok) {
      applyTheme(prev)
      set({ theme: prev })
    }
  },

  togglePin: async () => {
    const next = !get().pinned
    set({ pinned: next })
    const result = await window.summonAPI.setPinned(next)
    if (!result?.ok) set({ pinned: !next })
  },

  toggleShortcut: async () => {
    const next = !get().shortcutEnabled
    set({ shortcutEnabled: next })
    const result = await window.summonAPI.setShortcutEnabled(next)
    if (!result?.ok) set({ shortcutEnabled: !next })
  },

  hydrate: async () => {
    const prefs = await window.summonAPI.getPrefs()
    if (!prefs) return
    applyTheme(prefs.theme)
    set({ theme: prefs.theme, pinned: prefs.pinned, shortcutEnabled: prefs.shortcutEnabled })
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

systemDarkMQ.addEventListener('change', () => {
  if (useStore.getState().theme === 'auto') applyTheme('auto')
})
