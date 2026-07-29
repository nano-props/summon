import { createStore } from 'zustand/vanilla'
import { describe, expect, it, vi } from 'vitest'
import { summonClient } from '#/renderer/src/data/summon-client.ts'
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

  it('does not retain mutable snapshot data', () => {
    const store = createTestStore()
    const snapshot = {
      version: 1,
      windows: [
        {
          id: '1',
          terminalId: 't1',
          title: 'original',
          cwd: '/repo',
          tabCount: 1,
          gitRepo: { root: '/repo', rootName: 'repo', isRoot: true },
        },
      ],
    }

    store.getState().syncWindows(snapshot)
    snapshot.windows[0].title = 'mutated'
    snapshot.windows[0].gitRepo.rootName = 'mutated'

    expect(store.getState().windows[0]).toEqual(
      expect.objectContaining({
        title: 'original',
        gitRepo: expect.objectContaining({ rootName: 'repo' }),
      }),
    )
  })

  it('loads the current snapshot from the client', async () => {
    const store = createTestStore()
    vi.spyOn(summonClient, 'getWindows').mockResolvedValue({
      version: 3,
      windows: [{ id: '1', terminalId: 't1', title: 'loaded', cwd: '/repo', tabCount: 1, gitRepo: null }],
    })

    await store.getState().loadWindows()

    expect(store.getState().windowsVersion).toBe(3)
    expect(store.getState().windows[0].title).toBe('loaded')
  })

  it('leaves existing state unchanged when loading returns no snapshot', async () => {
    const store = createTestStore()
    store.getState().syncWindows({
      version: 1,
      windows: [{ id: '1', terminalId: 't1', title: 'existing', cwd: '/repo', tabCount: 1, gitRepo: null }],
    })
    vi.spyOn(summonClient, 'getWindows').mockResolvedValue(null)

    await store.getState().loadWindows()

    expect(store.getState().windowsVersion).toBe(1)
    expect(store.getState().windows[0].title).toBe('existing')
  })
})
