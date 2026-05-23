import type {
  CommandResult,
  Language,
  LanguageMode,
  Prefs,
  ShortcutAccelerator,
  ThemeMode,
  WindowDto,
  WindowsState,
} from '#/src/shared/contracts.ts'

export interface UiSlice {
  selectedIndex: number
  setSelectedIndex: (i: number) => void
}

export interface PrefsSlice {
  theme: ThemeMode
  language: LanguageMode
  resolvedLanguage: Language
  shortcutEnabled: boolean
  shortcutAccelerator: ShortcutAccelerator
  hydrate: () => Promise<void>
  syncPrefs: (prefs: Prefs) => Promise<void>
}

export interface WindowsSlice {
  windowsVersion: number
  windows: WindowDto[]
  loadWindows: () => Promise<void>
  syncWindows: (state: WindowsState) => void
  activateWindow: (window: WindowDto) => Promise<CommandResult>
}

export interface CommandsSlice {
  newTerminal: () => Promise<CommandResult>
  hidePanel: () => Promise<CommandResult>
}

export type SummonState = UiSlice & PrefsSlice & WindowsSlice & CommandsSlice
