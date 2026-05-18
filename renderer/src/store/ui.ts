import type { StateCreator } from 'zustand'
import type { SummonState, UiSlice } from './types'

export const createUiSlice: StateCreator<SummonState, [], [], UiSlice> = (set) => ({
  query: '',
  selectedIndex: -1,
  savedId: null,
  setQuery: (q) => set({ query: q, selectedIndex: -1 }),
  setSelectedIndex: (i) => set({ selectedIndex: i }),
})
