import type { ShortcutAccelerator } from '#/src/shared/shortcuts.ts'

export type { ShortcutAccelerator } from '#/src/shared/shortcuts.ts'

export type ThemeMode = 'light' | 'dark' | 'auto'
export type Language = 'en' | 'zh' | 'ko' | 'ja'
export type LanguageMode = 'auto' | Language
export type PanelAnimationPhase = 'show' | 'hide'

export interface GitRepoInfo {
  root: string
  rootName: string
  isRoot: boolean
}

export interface WindowDto {
  id: string
  terminalId: string
  title: string
  cwd: string
  tabCount: number
  gitRepo: GitRepoInfo | null
}

export interface WindowsState {
  version: number
  windows: WindowDto[]
}

export interface Prefs {
  shortcutEnabled: boolean
  shortcutAccelerator: ShortcutAccelerator
  theme: ThemeMode
  language: LanguageMode
  resolvedLanguage: Language
}

export type CommandResult = { ok: true } | { ok: false; error?: string }

export interface SummonApi {
  // `null` means the preload/main-process boundary rejected or could not service the request.
  // Command handlers use CommandResult for application-level failures after the request is accepted.
  getWindows: () => Promise<WindowsState | null>
  activateWindow: (id: string, terminalId: string) => Promise<CommandResult | null>
  newTerminal: () => Promise<CommandResult | null>
  hidePanel: () => Promise<CommandResult | null>
  getPrefs: () => Promise<Prefs | null>
  onWindowsChanged: (callback: (state: WindowsState) => void) => () => void
  onPanelAnimation: (callback: (phase: PanelAnimationPhase) => void) => () => void
  onPrefsChanged: (callback: (prefs: Prefs) => void) => () => void
}
