import type { StateCreator } from 'zustand'
import { i18n } from '#/renderer/src/i18n.ts'
import { applyTheme } from '#/renderer/src/store/theme.ts'
import type { PrefsSlice, SummonState } from '#/renderer/src/store/types.ts'
import type { Prefs } from '#/renderer/src/types.ts'

async function applyPrefs(set: (patch: Partial<PrefsSlice>) => void, prefs: Prefs): Promise<void> {
  applyTheme(prefs.theme)
  await i18n.changeLanguage(prefs.resolvedLanguage)
  set({
    theme: prefs.theme,
    language: prefs.language,
    resolvedLanguage: prefs.resolvedLanguage,
    shortcutEnabled: prefs.shortcutEnabled,
  })
}

export const createPrefsSlice: StateCreator<SummonState, [], [], PrefsSlice> = (set) => ({
  theme: 'auto',
  language: 'auto',
  resolvedLanguage: 'en',
  shortcutEnabled: true,

  hydrate: async () => {
    try {
      const prefs = await window.summonAPI.getPrefs()
      if (!prefs) return
      await applyPrefs(set, prefs)
    } catch (e) {
      console.error('Hydrate failed:', e)
    }
  },

  syncPrefs: async (prefs) => {
    try {
      await applyPrefs(set, prefs)
    } catch (e) {
      console.error('Sync prefs failed:', e)
    }
  },
})
