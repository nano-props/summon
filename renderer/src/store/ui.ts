import type { StateCreator } from 'zustand'
import type { SummonState, UiSlice } from './types'

export const createUiSlice: StateCreator<SummonState, [], [], UiSlice> = (set) => ({
  selectedIndex: -1,
  setSelectedIndex: (i) => set({ selectedIndex: i }),
})
