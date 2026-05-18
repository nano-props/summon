import { create } from 'zustand'
import { createPrefsSlice } from './store/prefs'
import { watchSystemTheme } from './store/theme'
import type { SummonState } from './store/types'
import { createUiSlice } from './store/ui'
import { createWindowsSlice } from './store/windows'

export const useStore = create<SummonState>()((...args) => ({
  ...createUiSlice(...args),
  ...createPrefsSlice(...args),
  ...createWindowsSlice(...args),
}))

watchSystemTheme(() => useStore.getState().theme)
