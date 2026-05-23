import { create } from 'zustand'
import { createCommandsSlice } from '#/renderer/src/store/commands.ts'
import { createPrefsSlice } from '#/renderer/src/store/prefs.ts'
import { watchSystemTheme } from '#/renderer/src/store/theme.ts'
import type { SummonState } from '#/renderer/src/store/types.ts'
import { createUiSlice } from '#/renderer/src/store/ui.ts'
import { createWindowsSlice } from '#/renderer/src/store/windows.ts'

export const useStore = create<SummonState>()((...args) => ({
  ...createUiSlice(...args),
  ...createPrefsSlice(...args),
  ...createWindowsSlice(...args),
  ...createCommandsSlice(...args),
}))

watchSystemTheme(() => useStore.getState().theme)
