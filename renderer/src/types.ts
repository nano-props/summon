export interface WindowDTO {
  id: string
  title: string
  cwd: string
  tabCount: number
  alias: string
}

export interface WindowsResponse {
  version: string
  windows: WindowDTO[]
}

export type ThemeMode = 'light' | 'dark' | 'auto'
export type Language = 'en' | 'zh' | 'ko' | 'ja'
export type LanguageMode = 'auto' | Language

export interface Prefs {
  pinned: boolean
  shortcutEnabled: boolean
  theme: ThemeMode
  language: LanguageMode
  resolvedLanguage: Language
}

export interface SummonAPI {
  getWindows: () => Promise<WindowsResponse>
  activateWindow: (id: string) => Promise<{ ok: boolean }>
  saveAlias: (id: string, alias: string) => Promise<{ ok: boolean }>
  reorderWindows: (orderedIds: string[]) => Promise<{ ok: boolean }>
  newTerminal: () => Promise<{ ok: boolean }>
  hidePanel: () => Promise<void>
  getPrefs: () => Promise<Prefs>
  setPinned: (value: boolean) => Promise<{ ok: boolean }>
  setShortcutEnabled: (value: boolean) => Promise<{ ok: boolean }>
  setTheme: (value: ThemeMode) => Promise<{ ok: boolean }>
  setLanguage: (value: LanguageMode) => Promise<{ ok: boolean; resolvedLanguage?: Language }>
  openGitHub: () => Promise<{ ok: boolean }>
  quit: () => Promise<void>
}

declare global {
  interface Window {
    summonAPI: SummonAPI
  }
  const __GIT_HASH__: string
}
