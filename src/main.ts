import { app, BrowserWindow, Tray, ipcMain, nativeImage, screen, globalShortcut } from 'electron/main'
import path from 'node:path'
import { clamp } from 'lodash-es'
import { activateWindow, newTerminal } from './ghostty.ts'
import { calcPlacementX, PANEL_GAP, SCREEN_PADDING } from './placement.ts'
import type { Placement } from './placement.ts'
import { refreshWindows, getWindowDtos, saveAlias, reorder } from './window-store.ts'
import { fadeIn, fadeOut, stopAnimation } from './panel-animator.ts'
import { loadPrefs, updatePrefs } from './prefs.ts'

const isDev = !app.isPackaged

if (process.platform !== 'darwin') {
  console.error('Summon only supports macOS')
  process.exit(1)
}

if (!app.requestSingleInstanceLock()) {
  app.quit()
}

let tray: Tray | null = null
let mainWindow: BrowserWindow | null = null
let panelVisible = false
let refreshTimer: ReturnType<typeof setInterval> | null = null

// --- Main window ---

function createMainWindow(): BrowserWindow {
  const win = new BrowserWindow({
    type: 'panel',
    width: 440,
    height: 600,
    show: false,
    frame: false,
    hasShadow: true,
    roundedCorners: true,
    resizable: false,
    movable: false,
    webPreferences: {
      preload: path.join(import.meta.dirname, 'preload.js'),
      contextIsolation: true,
      sandbox: true,
      nodeIntegration: false,
    },
  })

  if (isDev) {
    win.loadURL('http://localhost:5173')
  } else {
    win.loadFile(path.join(import.meta.dirname, '..', 'dist-renderer', 'index.html'))
  }

  win.on('close', (e) => {
    e.preventDefault()
    hidePanel()
  })

  return win
}

function positionWindowBelowTray(placement: Placement = 'bottom-start'): void {
  if (!mainWindow || !tray) return
  const trayBounds = tray.getBounds()
  const winBounds = mainWindow.getBounds()
  const display = screen.getDisplayNearestPoint({ x: trayBounds.x, y: trayBounds.y })
  const workArea = display.workArea

  const x = calcPlacementX(placement, trayBounds, winBounds.width)
  const y = trayBounds.y + trayBounds.height + PANEL_GAP

  const minX = workArea.x + SCREEN_PADDING
  const maxX = workArea.x + workArea.width - winBounds.width - SCREEN_PADDING
  mainWindow.setPosition(clamp(x, minX, maxX), y)
}

// --- Panel show/hide ---

function showPanel(): void {
  if (!mainWindow || mainWindow.isDestroyed()) return
  panelVisible = true
  mainWindow.show()
  mainWindow.focus()
  fadeIn(mainWindow)
}

function hidePanel(): void {
  if (!mainWindow || mainWindow.isDestroyed() || !panelVisible) return
  panelVisible = false
  const win = mainWindow
  fadeOut(win, () => {
    if (!win.isDestroyed()) {
      win.hide()
      win.setOpacity(1)
    }
  })
}

function toggleMainWindow(): void {
  if (!mainWindow || mainWindow.isDestroyed()) {
    mainWindow = createMainWindow()
    mainWindow.once('ready-to-show', () => {
      positionWindowBelowTray()
      showPanel()
    })
    return
  }

  if (panelVisible) {
    hidePanel()
  } else {
    positionWindowBelowTray()
    showPanel()
  }
}

// --- Global shortcut ---

const SHORTCUT_ACCELERATOR = 'Option+Space'

function setShortcutEnabled(enabled: boolean): boolean {
  if (enabled) {
    if (globalShortcut.isRegistered(SHORTCUT_ACCELERATOR)) return true
    const ok = globalShortcut.register(SHORTCUT_ACCELERATOR, toggleMainWindow)
    if (!ok) console.warn(`Failed to register ${SHORTCUT_ACCELERATOR} — may be in use by another app`)
    return ok
  }
  globalShortcut.unregister(SHORTCUT_ACCELERATOR)
  return true
}

// --- IPC handlers ---

function validateSender(frame: Electron.WebFrameMain): boolean {
  try {
    const senderUrl = new URL(frame.url)
    if (senderUrl.protocol === 'file:') return true
    if (isDev && senderUrl.hostname === 'localhost') return true
    return false
  } catch {
    return false
  }
}

ipcMain.handle('get-windows', (event) => {
  if (!validateSender(event.senderFrame)) return null
  return { version: app.getVersion(), windows: getWindowDtos() }
})

ipcMain.handle('activate-window', async (event, id: string) => {
  if (!validateSender(event.senderFrame)) return null
  await activateWindow(id)
  if (!loadPrefs().pinned) hidePanel()
  return { ok: true }
})

ipcMain.handle('save-alias', (event, id: string, alias: string) => {
  if (!validateSender(event.senderFrame)) return null
  saveAlias(id, alias)
  return { ok: true }
})

ipcMain.handle('reorder-windows', async (event, orderedIds: string[]) => {
  if (!validateSender(event.senderFrame)) return null
  reorder(orderedIds)
  await refreshWindows()
  return { ok: true }
})

ipcMain.handle('new-terminal', async (event) => {
  if (!validateSender(event.senderFrame)) return null
  await newTerminal()
  if (!loadPrefs().pinned) hidePanel()
  return { ok: true }
})

ipcMain.handle('hide-panel', (event) => {
  if (!validateSender(event.senderFrame)) return null
  hidePanel()
})

ipcMain.handle('get-prefs', (event) => {
  if (!validateSender(event.senderFrame)) return null
  return loadPrefs()
})

ipcMain.handle('set-pinned', (event, value: boolean) => {
  if (!validateSender(event.senderFrame)) return null
  try {
    updatePrefs({ pinned: !!value })
    return { ok: true }
  } catch (e) {
    console.error('set-pinned failed:', e)
    return { ok: false }
  }
})

ipcMain.handle('set-shortcut-enabled', (event, value: boolean) => {
  if (!validateSender(event.senderFrame)) return null
  const enabled = !!value
  try {
    updatePrefs({ shortcutEnabled: enabled })
  } catch (e) {
    console.error('set-shortcut-enabled failed:', e)
    return { ok: false }
  }
  return { ok: setShortcutEnabled(enabled) }
})

ipcMain.handle('set-theme', (event, value: 'light' | 'dark' | 'auto') => {
  if (!validateSender(event.senderFrame)) return null
  if (value !== 'light' && value !== 'dark' && value !== 'auto') return { ok: false }
  try {
    updatePrefs({ theme: value })
    return { ok: true }
  } catch (e) {
    console.error('set-theme failed:', e)
    return { ok: false }
  }
})

ipcMain.handle('quit', (event) => {
  if (!validateSender(event.senderFrame)) return null
  app.quit()
})

// --- App lifecycle ---

app.whenReady().then(() => {
  app.dock.hide()

  const trayIcon = nativeImage.createFromPath(path.join(import.meta.dirname, '..', 'icons', 'summon-tray.png'))
  tray = new Tray(trayIcon.resize({ width: 18, height: 18 }))
  tray.setToolTip('Summon')
  tray.setIgnoreDoubleClickEvents(true)
  tray.on('click', toggleMainWindow)

  setShortcutEnabled(loadPrefs().shortcutEnabled)

  refreshWindows()
  refreshTimer = setInterval(refreshWindows, 2000)
})

app.on('second-instance', () => {
  toggleMainWindow()
})

app.on('before-quit', () => {
  stopAnimation()
  globalShortcut.unregisterAll()
  if (refreshTimer) clearInterval(refreshTimer)
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.removeAllListeners('close')
    mainWindow.close()
  }
})

app.on('window-all-closed', () => {
  // Don't quit — tray app stays alive
})
