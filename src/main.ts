import { app, BrowserWindow, Tray, ipcMain, nativeImage, screen, globalShortcut } from 'electron/main'
import path from 'node:path'
import { keyBy, isEqual, clamp } from 'lodash-es'
import { listWindows, activateWindow, newTerminal } from './ghostty.ts'
import type { TerminalWindow } from './ghostty.ts'

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
let cachedWindows: TerminalWindow[] = []
const knownOrderSet = new Set<string>()
let knownOrderList: string[] = []
const aliases: Record<string, string> = {}
let refreshTimer: ReturnType<typeof setInterval> | null = null
let lastSnapshot: { windows: TerminalWindow[]; aliases: Record<string, string> } | null = null

// --- Window management ---

function stableSort(windows: TerminalWindow[]): TerminalWindow[] {
  const byId = keyBy(windows, 'id')
  for (const w of windows) {
    if (!knownOrderSet.has(w.id)) {
      knownOrderSet.add(w.id)
      knownOrderList.push(w.id)
    }
  }
  knownOrderList = knownOrderList.filter((id) => id in byId)
  knownOrderSet.clear()
  for (const id of knownOrderList) knownOrderSet.add(id)
  return knownOrderList.map((id) => byId[id])
}

function windowDto(w: TerminalWindow) {
  return {
    id: w.id,
    title: w.title,
    cwd: w.cwd,
    tabCount: w.tabCount,
    alias: aliases[w.id] || '',
  }
}

async function refreshWindows(): Promise<void> {
  try {
    const latest = await listWindows()
    const sorted = stableSort(latest)
    const snapshot = { windows: sorted, aliases: { ...aliases } }
    if (!isEqual(snapshot, lastSnapshot)) {
      lastSnapshot = snapshot
      cachedWindows = sorted
    }
  } catch (e: any) {
    console.error('Refresh failed:', e.message)
  }
}

// --- Main window ---

function createMainWindow(): BrowserWindow {
  const win = new BrowserWindow({
    type: 'panel',
    width: 500,
    height: 700,
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

function positionWindowBelowTray(): void {
  if (!mainWindow || !tray) return
  const trayBounds = tray.getBounds()
  const winBounds = mainWindow.getBounds()
  const display = screen.getDisplayNearestPoint({ x: trayBounds.x, y: trayBounds.y })
  const workArea = display.workArea

  const x = Math.round(trayBounds.x + trayBounds.width / 2 - winBounds.width / 2)
  const y = trayBounds.y + trayBounds.height + 4

  mainWindow.setPosition(clamp(x, workArea.x + 8, workArea.x + workArea.width - winBounds.width - 8), y)
}

// --- Panel animation ---

const ANIM_DURATION = 100 // ms
const ANIM_INTERVAL = 16 // ~60fps
const easeOut = (t: number) => 1 - (1 - t) * (1 - t)
const easeIn = (t: number) => t * t

let animTimer: ReturnType<typeof setInterval> | null = null
let panelVisible = false

function stopAnimation(): void {
  if (animTimer) {
    clearInterval(animTimer)
    animTimer = null
  }
}

function animateOpacity(
  from: number,
  to: number,
  easing: (t: number) => number,
  onComplete?: () => void,
): void {
  if (!mainWindow || mainWindow.isDestroyed()) return
  stopAnimation()
  mainWindow.setOpacity(from)
  const start = Date.now()
  animTimer = setInterval(() => {
    const t = Math.min((Date.now() - start) / ANIM_DURATION, 1)
    mainWindow?.setOpacity(from + (to - from) * easing(t))
    if (t >= 1) {
      stopAnimation()
      onComplete?.()
    }
  }, ANIM_INTERVAL)
}

function showPanel(): void {
  if (!mainWindow || mainWindow.isDestroyed()) return
  panelVisible = true
  mainWindow.show()
  mainWindow.focus()
  animateOpacity(0, 1, easeOut)
}

function hidePanel(): void {
  if (!mainWindow || mainWindow.isDestroyed() || !panelVisible) return
  panelVisible = false
  animateOpacity(1, 0, easeIn, () => {
    mainWindow?.hide()
    mainWindow?.setOpacity(1)
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
  return {
    version: app.getVersion(),
    windows: cachedWindows.map(windowDto),
  }
})

ipcMain.handle('activate-window', async (event, id: string) => {
  if (!validateSender(event.senderFrame)) return null
  await activateWindow(id)
  hidePanel()
  return { ok: true }
})

ipcMain.handle('save-alias', (event, id: string, alias: string) => {
  if (!validateSender(event.senderFrame)) return null
  if (!alias || !alias.trim()) {
    delete aliases[id]
  } else {
    aliases[id] = alias.trim()
  }
  lastSnapshot = null
  return { ok: true }
})

ipcMain.handle('reorder-windows', async (event, orderedIds: string[]) => {
  if (!validateSender(event.senderFrame)) return null
  knownOrderList = orderedIds.filter((id) => knownOrderSet.has(id))
  knownOrderSet.clear()
  for (const id of knownOrderList) knownOrderSet.add(id)
  lastSnapshot = null
  await refreshWindows()
  return { ok: true }
})

ipcMain.handle('new-terminal', async (event) => {
  if (!validateSender(event.senderFrame)) return null
  await newTerminal()
  hidePanel()
  return { ok: true }
})

ipcMain.handle('hide-panel', (event) => {
  if (!validateSender(event.senderFrame)) return null
  hidePanel()
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

  const registered = globalShortcut.register('Option+Space', toggleMainWindow)
  if (!registered) {
    console.warn('Failed to register global shortcut Option+Space — may be in use by another app')
  }

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
