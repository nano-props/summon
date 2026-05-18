import type { StateCreator } from 'zustand'
import { i18n } from '../i18n'
import { applyTheme } from './theme'
import type { SummonState, PrefsSlice } from './types'

export const createPrefsSlice: StateCreator<SummonState, [], [], PrefsSlice> = (set, get) => ({
  theme: 'auto',
  language: 'auto',
  resolvedLanguage: 'en',
  pinned: false,
  shortcutEnabled: true,

  setTheme: async (mode) => {
    const prev = get().theme
    applyTheme(mode)
    set({ theme: mode })
    try {
      const result = await window.summonAPI.setTheme(mode)
      if (result?.ok) return
    } catch (e) {
      console.error('Set theme failed:', e)
    }
    applyTheme(prev)
    set({ theme: prev })
  },

  setLanguage: async (language) => {
    const prevLanguage = get().language
    const prevResolvedLanguage = get().resolvedLanguage
    try {
      const result = await window.summonAPI.setLanguage(language)
      if (result?.ok && result.resolvedLanguage) {
        await i18n.changeLanguage(result.resolvedLanguage)
        set({ language, resolvedLanguage: result.resolvedLanguage })
        return
      }
    } catch (e) {
      console.error('Set language failed:', e)
    }
    await i18n.changeLanguage(prevResolvedLanguage)
    set({ language: prevLanguage, resolvedLanguage: prevResolvedLanguage })
  },

  togglePin: async () => {
    const next = !get().pinned
    set({ pinned: next })
    try {
      const result = await window.summonAPI.setPinned(next)
      if (result?.ok) return
    } catch (e) {
      console.error('Set pin failed:', e)
    }
    set({ pinned: !next })
  },

  toggleShortcut: async () => {
    const next = !get().shortcutEnabled
    set({ shortcutEnabled: next })
    try {
      const result = await window.summonAPI.setShortcutEnabled(next)
      if (result?.ok) return
    } catch (e) {
      console.error('Set shortcut failed:', e)
    }
    set({ shortcutEnabled: !next })
  },

  hydrate: async () => {
    try {
      const prefs = await window.summonAPI.getPrefs()
      if (!prefs) return
      applyTheme(prefs.theme)
      await i18n.changeLanguage(prefs.resolvedLanguage)
      set({
        theme: prefs.theme,
        language: prefs.language,
        resolvedLanguage: prefs.resolvedLanguage,
        pinned: prefs.pinned,
        shortcutEnabled: prefs.shortcutEnabled,
      })
    } catch (e) {
      console.error('Hydrate failed:', e)
    }
  },
})
