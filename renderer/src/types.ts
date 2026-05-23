import type { SummonApi } from '#/src/shared/contracts.ts'

export type {
  CommandResult,
  GitRepoInfo,
  Language,
  LanguageMode,
  PanelAnimationPhase,
  Prefs,
  ShortcutAccelerator,
  SummonApi,
  ThemeMode,
  WindowDto,
  WindowsState,
} from '#/src/shared/contracts.ts'

declare global {
  interface Window {
    summonAPI: SummonApi
  }
}
