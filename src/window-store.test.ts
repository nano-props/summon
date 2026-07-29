import { beforeEach, describe, expect, it, vi } from 'vitest'
import { gitRepoInfo } from '#/src/git.ts'
import { listWindows } from '#/src/ghostty.ts'

const state = vi.hoisted(() => ({
  windows: [] as Array<{ id: string; terminalId: string; title: string; cwd: string; tabCount: number }>,
  repos: new Map<string, { root: string; rootName: string; isRoot: boolean } | null>(),
}))

vi.mock('#/src/ghostty.ts', () => ({
  listWindows: vi.fn(async () => state.windows),
}))

vi.mock('#/src/git.ts', () => ({
  gitRepoInfo: vi.fn(async (cwd: string) => state.repos.get(cwd) ?? null),
}))

beforeEach(() => {
  state.windows = []
  state.repos.clear()
  vi.mocked(listWindows).mockImplementation(async () => state.windows)
  vi.mocked(gitRepoInfo).mockImplementation(async (cwd: string) => state.repos.get(cwd) ?? null)
})

async function importWindowStore() {
  vi.resetModules()
  return import('#/src/window-store.ts')
}

describe('window-store', () => {
  it('publishes enriched state only when windows change', async () => {
    const store = await importWindowStore()
    const listener = vi.fn()
    store.subscribeWindows(listener)
    state.windows = [{ id: '1', terminalId: 't1', title: 'one', cwd: '/repo/src', tabCount: 2 }]
    state.repos.set('/repo/src', { root: '/repo', rootName: 'repo', isRoot: false })

    const first = await store.refreshWindows()
    const unchanged = await store.refreshWindows()

    expect(first).toEqual({
      version: 1,
      windows: [
        {
          id: '1',
          terminalId: 't1',
          title: 'one',
          cwd: '/repo/src',
          tabCount: 2,
          gitRepo: { root: '/repo', rootName: 'repo', isRoot: false },
        },
      ],
    })
    expect(unchanged.version).toBe(1)
    expect(listener).toHaveBeenCalledTimes(1)

    state.windows = [{ id: '1', terminalId: 't1', title: 'two', cwd: '/repo/src', tabCount: 2 }]
    const second = await store.refreshWindows()

    expect(second.version).toBe(2)
    expect(listener).toHaveBeenCalledTimes(2)
  })

  it('does not expose mutable internal state', async () => {
    const store = await importWindowStore()
    state.windows = [{ id: '1', terminalId: 't1', title: 'one', cwd: '/repo/src', tabCount: 1 }]

    const first = await store.refreshWindows()
    first.windows[0].title = 'mutated'

    expect(store.getWindowsState().windows[0].title).toBe('one')
  })

  it('isolates listener snapshots from each other', async () => {
    const store = await importWindowStore()
    state.windows = [{ id: '1', terminalId: 't1', title: 'one', cwd: '/repo/src', tabCount: 1 }]
    const first = vi.fn((snapshot: Awaited<ReturnType<typeof store.refreshWindows>>) => {
      snapshot.windows[0].title = 'mutated'
    })
    const second = vi.fn()
    store.subscribeWindows(first)
    store.subscribeWindows(second)

    await store.refreshWindows()

    expect(second).toHaveBeenCalledWith(
      expect.objectContaining({
        windows: [expect.objectContaining({ title: 'one' })],
      }),
    )
  })

  it('stops publishing to an unsubscribed listener', async () => {
    const store = await importWindowStore()
    const listener = vi.fn()
    const unsubscribe = store.subscribeWindows(listener)
    unsubscribe()
    state.windows = [{ id: '1', terminalId: 't1', title: 'one', cwd: '/repo', tabCount: 1 }]

    await store.refreshWindows()

    expect(listener).not.toHaveBeenCalled()
  })

  it('shares the underlying work between concurrent refreshes', async () => {
    const store = await importWindowStore()
    let resolveWindows!: (windows: typeof state.windows) => void
    const pendingWindows = new Promise<typeof state.windows>((resolve) => {
      resolveWindows = resolve
    })
    vi.mocked(listWindows).mockReturnValueOnce(pendingWindows)

    const first = store.refreshWindows()
    const second = store.refreshWindows()
    resolveWindows([{ id: '1', terminalId: 't1', title: 'one', cwd: '/repo', tabCount: 1 }])

    await expect(Promise.all([first, second])).resolves.toEqual([
      expect.objectContaining({ version: 1 }),
      expect.objectContaining({ version: 1 }),
    ])
    expect(listWindows).toHaveBeenCalledTimes(1)
  })

  it('can refresh again after a failed query', async () => {
    const store = await importWindowStore()
    vi.mocked(listWindows).mockRejectedValueOnce(new Error('query failed'))

    await expect(store.refreshWindows()).resolves.toEqual({ version: 0, windows: [] })

    state.windows = [{ id: '1', terminalId: 't1', title: 'recovered', cwd: '/repo', tabCount: 1 }]
    await expect(store.refreshWindows()).resolves.toEqual(
      expect.objectContaining({
        version: 1,
        windows: [expect.objectContaining({ title: 'recovered' })],
      }),
    )
    expect(listWindows).toHaveBeenCalledTimes(2)
  })
})
