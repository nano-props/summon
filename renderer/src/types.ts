import type { ShortcutAccelerator } from '#/src/shared/shortcuts.ts'

export type { ShortcutAccelerator } from '#/src/shared/shortcuts.ts'

export interface WindowDTO {
  key: string
  id: string
  terminalId: string
  title: string
  cwd: string
  tabCount: number
  gitRepo: {
    root: string
    rootName: string
    isRoot: boolean
  } | null
}

export interface WindowsResponse {
  windows: WindowDTO[]
}

export type ThemeMode = 'light' | 'dark' | 'auto'
export type Language = 'en' | 'zh' | 'ko' | 'ja'
export type LanguageMode = 'auto' | Language
export type PanelAnimationPhase = 'show' | 'hide'

export interface Prefs {
  shortcutEnabled: boolean
  shortcutAccelerator: ShortcutAccelerator
  theme: ThemeMode
  language: LanguageMode
  resolvedLanguage: Language
}

export interface SummonAPI {
  getWindows: () => Promise<WindowsResponse | null>
  activateWindow: (id: string, terminalId: string) => Promise<{ ok: boolean; error?: string } | null>
  newTerminal: () => Promise<{ ok: boolean; error?: string } | null>
  hidePanel: () => Promise<{ ok: boolean } | null>
  getPrefs: () => Promise<Prefs | null>
  onPanelAnimation: (callback: (phase: PanelAnimationPhase) => void) => () => void
  onPrefsChanged: (callback: (prefs: Prefs) => void) => () => void
}

declare global {
  interface Window {
    summonAPI: SummonAPI
  }
}
