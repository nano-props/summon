import { nativeImage } from 'electron'
import { app, Tray } from 'electron/main'
import path from 'node:path'
import { newTerminal } from '#/src/ghostty.ts'
import { registerIpcHandlers } from '#/src/ipc.ts'
import { PanelController } from '#/src/panel.ts'
import { loadPrefs } from '#/src/prefs.ts'
import { setShortcutEnabled, unregisterShortcuts } from '#/src/shortcut.ts'
import { TrayMenuController } from '#/src/tray-menu.ts'
import { refreshWindows } from '#/src/window-store.ts'

const isDev = !app.isPackaged
const DEV_RENDERER_URL = 'http://localhost:5173'
const PROD_RENDERER_PATH = path.join(import.meta.dirname, '..', 'dist-renderer', 'index.html')

if (process.platform !== 'darwin') {
  console.error('Summon only supports macOS')
  process.exit(1)
}

if (!app.requestSingleInstanceLock()) {
  app.quit()
}

let tray: Tray | null = null
let refreshTimer: ReturnType<typeof setInterval> | null = null
let trayMenu: TrayMenuController | null = null

const panel = new PanelController({
  isDev,
  devRendererUrl: DEV_RENDERER_URL,
  prodRendererPath: PROD_RENDERER_PATH,
  preloadPath: path.join(import.meta.dirname, 'preload.js'),
  onVisibilityChanged: () => trayMenu?.update(),
})

registerIpcHandlers({
  isDev,
  devRendererUrl: DEV_RENDERER_URL,
  prodRendererPath: PROD_RENDERER_PATH,
  panel,
})

// --- App lifecycle ---

app.whenReady().then(async () => {
  app.setActivationPolicy('accessory')
  app.dock?.hide()

  const trayIcon = nativeImage.createFromPath(path.join(import.meta.dirname, '..', 'icons', 'summon-tray.png'))
  tray = new Tray(trayIcon.resize({ width: 18, height: 18 }))
  tray.setToolTip('Summon')
  tray.setIgnoreDoubleClickEvents(true)
  trayMenu = new TrayMenuController(tray, {
    isPanelVisible: () => panel.isVisible(),
    togglePanel: () => panel.toggle(),
    hidePanel: () => panel.hide(),
    newTerminal,
    notifyPrefsChanged: (prefs) => panel.notifyPrefsChanged(prefs),
  })
  trayMenu.update()

  const prefs = loadPrefs()
  const shortcutOk = setShortcutEnabled(prefs.shortcutEnabled, prefs.shortcutAccelerator, () => panel.toggle())
  if (!shortcutOk) trayMenu.showShortcutRegistrationFailed(prefs.shortcutAccelerator)

  await refreshWindows()
  refreshTimer = setInterval(refreshWindows, 2000)
})

app.on('second-instance', () => {
  panel.showOrFocus()
})

app.on('before-quit', () => {
  unregisterShortcuts()
  if (refreshTimer) clearInterval(refreshTimer)
  panel.dispose()
})

app.on('window-all-closed', () => {
  // Don't quit — tray app stays alive
})
