import { ipcMain } from 'electron/main'
import { fileURLToPath } from 'node:url'
import { activateWindow, newTerminal } from '#/src/ghostty.ts'
import type { PanelController } from '#/src/panel.ts'
import { loadPrefs } from '#/src/prefs.ts'
import { IPC_CHANNELS } from '#/src/shared/ipc.ts'
import { hasWindowId, refreshWindows } from '#/src/window-store.ts'

interface RegisterIpcHandlersOptions {
  isDev: boolean
  devRendererUrl: string
  prodRendererPath: string
  panel: PanelController
}

export function registerIpcHandlers(options: RegisterIpcHandlersOptions): void {
  const validateSender = (frame: Electron.WebFrameMain | null): boolean => {
    if (!frame) return false
    try {
      const senderUrl = new URL(frame.url)
      if (options.isDev) return senderUrl.origin === new URL(options.devRendererUrl).origin
      if (senderUrl.protocol !== 'file:') return false
      return fileURLToPath(senderUrl) === options.prodRendererPath
    } catch {
      return false
    }
  }

  ipcMain.handle(IPC_CHANNELS.getWindows, async (event) => {
    if (!validateSender(event.senderFrame)) return null
    try {
      return await refreshWindows()
    } catch (e) {
      console.error('get-windows failed:', e)
      return null
    }
  })

  ipcMain.handle(IPC_CHANNELS.activateWindow, async (event, id: string, terminalId = '') => {
    if (!validateSender(event.senderFrame)) return null
    if (typeof id !== 'string') return { ok: false, error: 'Invalid window id' }
    if (typeof terminalId !== 'string') return { ok: false, error: 'Invalid terminal id' }
    if (!hasWindowId(id)) return { ok: false, error: 'Window not found' }
    try {
      await activateWindow(id, terminalId)
      options.panel.hide()
      return { ok: true }
    } catch (e) {
      console.error('activate-window failed:', e)
      return { ok: false, error: e instanceof Error ? e.message : String(e) }
    }
  })

  ipcMain.handle(IPC_CHANNELS.newTerminal, async (event) => {
    if (!validateSender(event.senderFrame)) return null
    try {
      await newTerminal()
      options.panel.hide()
      return { ok: true }
    } catch (e) {
      console.error('new-terminal failed:', e)
      return { ok: false, error: e instanceof Error ? e.message : String(e) }
    }
  })

  ipcMain.handle(IPC_CHANNELS.hidePanel, (event) => {
    if (!validateSender(event.senderFrame)) return null
    try {
      options.panel.hide()
      return { ok: true }
    } catch (e) {
      console.error('hide-panel failed:', e)
      return { ok: false, error: e instanceof Error ? e.message : String(e) }
    }
  })

  ipcMain.handle(IPC_CHANNELS.getPrefs, (event) => {
    if (!validateSender(event.senderFrame)) return null
    try {
      return loadPrefs()
    } catch (e) {
      console.error('get-prefs failed:', e)
      return null
    }
  })
}
