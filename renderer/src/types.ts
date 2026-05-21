export interface WindowDTO {
  key: string
  id: string
  title: string
  cwd: string
  tabCount: number
}

export interface WindowsResponse {
  windows: WindowDTO[]
}

export type ThemeMode = 'light' | 'dark' | 'auto'
export type Language = 'en' | 'zh' | 'ko' | 'ja'
export type LanguageMode = 'auto' | Language

export interface Prefs {
  shortcutEnabled: boolean
  theme: ThemeMode
  language: LanguageMode
  resolvedLanguage: Language
}

export interface SummonAPI {
  getWindows: () => Promise<WindowsResponse | null>
  activateWindow: (id: string) => Promise<{ ok: boolean; error?: string } | null>
  newTerminal: () => Promise<{ ok: boolean; error?: string } | null>
  hidePanel: () => Promise<{ ok: boolean } | null>
  getPrefs: () => Promise<Prefs | null>
  onPrefsChanged: (callback: (prefs: Prefs) => void) => () => void
}

declare global {
  interface Window {
    summonAPI: SummonAPI
  }
}
