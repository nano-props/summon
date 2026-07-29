import { beforeEach, describe, expect, it, vi } from 'vitest'
import { activateWindow, newTerminal } from '#/src/ghostty.ts'
import { registerIpcHandlers } from '#/src/ipc.ts'
import type { PanelController } from '#/src/panel.ts'
import { loadPrefs } from '#/src/prefs.ts'
import { IPC_CHANNELS } from '#/src/shared/ipc.ts'
import { getWindowsState, hasWindowId, refreshWindows } from '#/src/window-store.ts'

type IpcHandler = (event: { senderFrame: { url: string } | null }, ...args: unknown[]) => unknown

const ipcState = vi.hoisted(() => ({
  handlers: new Map<string, IpcHandler>(),
  handle: vi.fn(),
}))

vi.mock('electron/main', () => ({
  ipcMain: { handle: ipcState.handle },
}))

vi.mock('#/src/ghostty.ts', () => ({
  activateWindow: vi.fn(),
  newTerminal: vi.fn(),
}))

vi.mock('#/src/prefs.ts', () => ({
  loadPrefs: vi.fn(),
}))

vi.mock('#/src/window-store.ts', () => ({
  getWindowsState: vi.fn(),
  hasWindowId: vi.fn(),
  refreshWindows: vi.fn(),
}))

const panel = {
  hide: vi.fn(),
} as unknown as PanelController

function register(isDev: boolean): void {
  registerIpcHandlers({
    isDev,
    devRendererUrl: 'http://localhost:5173',
    prodRendererPath: '/Applications/Summon/dist-renderer/index.html',
    panel,
  })
}

function invoke(channel: string, senderUrl: string | null, ...args: unknown[]): unknown {
  const handler = ipcState.handlers.get(channel)
  if (!handler) throw new Error(`Handler not registered: ${channel}`)
  return handler({ senderFrame: senderUrl === null ? null : { url: senderUrl } }, ...args)
}

beforeEach(() => {
  ipcState.handlers.clear()
  ipcState.handle.mockImplementation((channel: string, handler: IpcHandler) => {
    ipcState.handlers.set(channel, handler)
  })
  vi.mocked(getWindowsState).mockReturnValue({ version: 0, windows: [] })
  vi.mocked(hasWindowId).mockReturnValue(true)
  vi.mocked(refreshWindows).mockResolvedValue({ version: 0, windows: [] })
  vi.mocked(loadPrefs).mockReturnValue({
    shortcutEnabled: true,
    shortcutAccelerator: 'Option+Space',
    theme: 'auto',
    language: 'auto',
    resolvedLanguage: 'en',
  })
})

describe('registerIpcHandlers', () => {
  it('rejects requests from an untrusted development origin', () => {
    register(true)

    expect(invoke(IPC_CHANNELS.getPrefs, 'http://localhost:4173')).toBeNull()
    expect(loadPrefs).not.toHaveBeenCalled()
  })

  it('accepts requests from the configured development origin', () => {
    register(true)

    expect(invoke(IPC_CHANNELS.getPrefs, 'http://localhost:5173/settings')).toEqual(
      expect.objectContaining({ shortcutAccelerator: 'Option+Space' }),
    )
  })

  it('only accepts the configured renderer file in production', () => {
    register(false)

    expect(invoke(IPC_CHANNELS.getPrefs, 'file:///Applications/Summon/dist-renderer/other.html')).toBeNull()
    expect(invoke(IPC_CHANNELS.getPrefs, 'file:///Applications/Summon/dist-renderer/index.html')).toEqual(
      expect.objectContaining({ resolvedLanguage: 'en' }),
    )
    expect(loadPrefs).toHaveBeenCalledTimes(1)
  })

  it('validates activation arguments and known window ids', async () => {
    register(true)

    await expect(invoke(IPC_CHANNELS.activateWindow, 'http://localhost:5173', 1, 'terminal')).resolves.toEqual({
      ok: false,
      error: 'Invalid window id',
    })
    await expect(invoke(IPC_CHANNELS.activateWindow, 'http://localhost:5173', 'window', 1)).resolves.toEqual({
      ok: false,
      error: 'Invalid terminal id',
    })

    vi.mocked(hasWindowId).mockReturnValue(false)
    await expect(invoke(IPC_CHANNELS.activateWindow, 'http://localhost:5173', 'missing', 'terminal')).resolves.toEqual({
      ok: false,
      error: 'Window not found',
    })
    expect(activateWindow).not.toHaveBeenCalled()
  })

  it('hides the panel after successful activation and terminal creation', async () => {
    register(true)

    await expect(invoke(IPC_CHANNELS.activateWindow, 'http://localhost:5173', 'window', 'terminal')).resolves.toEqual({
      ok: true,
    })
    await expect(invoke(IPC_CHANNELS.newTerminal, 'http://localhost:5173')).resolves.toEqual({ ok: true })

    expect(activateWindow).toHaveBeenCalledWith('window', 'terminal')
    expect(newTerminal).toHaveBeenCalledOnce()
    expect(panel.hide).toHaveBeenCalledTimes(2)
  })
})
