import { createStore } from 'zustand/vanilla'
import { describe, expect, it } from 'vitest'
import { createWindowsSlice } from '#/renderer/src/store/windows.ts'
import type { SummonState } from '#/renderer/src/store/types.ts'

function createTestStore() {
  return createStore<SummonState>()((...args) => ({
    selectedIndex: -1,
    setSelectedIndex: () => {},
    theme: 'auto',
    language: 'auto',
    resolvedLanguage: 'en',
    shortcutEnabled: true,
    shortcutAccelerator: 'Option+Space',
    hydrate: async () => {},
    syncPrefs: async () => {},
    ...createWindowsSlice(...args),
    newTerminal: async () => ({ ok: true }),
    hidePanel: async () => ({ ok: true }),
  }))
}

describe('windows slice', () => {
  it('ignores stale window snapshots', () => {
    const store = createTestStore()
    const newer = {
      version: 2,
      windows: [{ id: '1', terminalId: 't1', title: 'new', cwd: '/repo', tabCount: 1, gitRepo: null }],
    }
    const older = {
      version: 1,
      windows: [{ id: '1', terminalId: 't1', title: 'old', cwd: '/repo', tabCount: 1, gitRepo: null }],
    }

    store.getState().syncWindows(newer)
    store.getState().syncWindows(older)

    expect(store.getState().windowsVersion).toBe(2)
    expect(store.getState().windows[0].title).toBe('new')
  })
})
