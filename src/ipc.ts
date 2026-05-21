import { ipcMain } from 'electron/main'
import { fileURLToPath } from 'node:url'
import { activateWindow, newTerminal } from './ghostty.ts'
import type { PanelController } from './panel.ts'
import { loadPrefs } from './prefs.ts'
import { getWindowDtos, hasWindowId } from './window-store.ts'

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

  ipcMain.handle('get-windows', (event) => {
    if (!validateSender(event.senderFrame)) return null
    return { windows: getWindowDtos() }
  })

  ipcMain.handle('activate-window', async (event, id: string) => {
    if (!validateSender(event.senderFrame)) return null
    if (!hasWindowId(id)) return { ok: false }
    await activateWindow(id)
    options.panel.hide()
    return { ok: true }
  })

  ipcMain.handle('new-terminal', async (event) => {
    if (!validateSender(event.senderFrame)) return null
    await newTerminal()
    options.panel.hide()
    return { ok: true }
  })

  ipcMain.handle('hide-panel', (event) => {
    if (!validateSender(event.senderFrame)) return null
    options.panel.hide()
    return { ok: true }
  })

  ipcMain.handle('get-prefs', (event) => {
    if (!validateSender(event.senderFrame)) return null
    return loadPrefs()
  })
}
