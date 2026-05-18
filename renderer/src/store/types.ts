import type { Language, LanguageMode, ThemeMode, WindowDTO } from '../types'

export interface UiSlice {
  query: string
  selectedIndex: number
  savedId: string | null
  setQuery: (q: string) => void
  setSelectedIndex: (i: number) => void
}

export interface PrefsSlice {
  theme: ThemeMode
  language: LanguageMode
  resolvedLanguage: Language
  pinned: boolean
  shortcutEnabled: boolean
  setTheme: (mode: ThemeMode) => Promise<void>
  setLanguage: (language: LanguageMode) => Promise<void>
  togglePin: () => Promise<void>
  toggleShortcut: () => Promise<void>
  hydrate: () => Promise<void>
}

export interface WindowsSlice {
  version: string
  windows: WindowDTO[]
  _lastData: unknown
  fetchWindows: () => Promise<void>
  activateWindow: (id: string) => Promise<void>
  saveAlias: (id: string, alias: string) => Promise<void>
  reorderWindows: (orderedIds: string[]) => Promise<void>
}

export type SummonState = UiSlice & PrefsSlice & WindowsSlice
