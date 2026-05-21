import type { Language, LanguageMode, Prefs, ThemeMode, WindowDTO } from '#/renderer/src/types.ts'

export interface UiSlice {
  selectedIndex: number
  setSelectedIndex: (i: number) => void
}

export interface PrefsSlice {
  theme: ThemeMode
  language: LanguageMode
  resolvedLanguage: Language
  shortcutEnabled: boolean
  hydrate: () => Promise<void>
  syncPrefs: (prefs: Prefs) => Promise<void>
}

export interface WindowsSlice {
  windows: WindowDTO[]
  fetchWindows: () => Promise<void>
  activateWindow: (id: string) => Promise<void>
}

export type SummonState = UiSlice & PrefsSlice & WindowsSlice
