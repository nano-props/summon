import { BrowserWindow, screen } from 'electron/main'
import path from 'node:path'
import { fadeIn, fadeOut, stopAnimation } from './panel-animator.ts'
import type { Prefs } from './prefs.ts'

const WORKSPACE_VISIBILITY_OPTIONS = {
  visibleOnFullScreen: false,
  skipTransformProcessType: true,
} as const

interface PanelControllerOptions {
  isDev: boolean
  devRendererUrl: string
  prodRendererPath: string
  preloadPath: string
  onVisibilityChanged: () => void
}

export class PanelController {
  private mainWindow: BrowserWindow | null = null
  private panelVisible = false
  private readonly options: PanelControllerOptions

  constructor(options: PanelControllerOptions) {
    this.options = options
  }

  isVisible(): boolean {
    return this.panelVisible
  }

  notifyPrefsChanged(prefs: Prefs): void {
    if (!this.mainWindow || this.mainWindow.isDestroyed()) return
    this.mainWindow.webContents.send('prefs-changed', prefs)
  }

  toggle(): void {
    if (!this.mainWindow || this.mainWindow.isDestroyed()) {
      this.mainWindow = this.createWindow()
      this.mainWindow.once('ready-to-show', () => {
        this.positionAtScreenCenter()
        this.show()
      })
      return
    }

    if (this.panelVisible) {
      this.hide()
    } else {
      this.positionAtScreenCenter()
      this.show()
    }
  }

  show(): void {
    if (!this.mainWindow || this.mainWindow.isDestroyed()) return
    this.panelVisible = true
    this.mainWindow.setVisibleOnAllWorkspaces(true, WORKSPACE_VISIBILITY_OPTIONS)
    this.mainWindow.show()
    this.mainWindow.focus()
    this.options.onVisibilityChanged()
    fadeIn(this.mainWindow)
  }

  hide(): void {
    if (!this.mainWindow || this.mainWindow.isDestroyed() || !this.panelVisible) return
    this.panelVisible = false
    this.options.onVisibilityChanged()
    const win = this.mainWindow
    fadeOut(win, () => {
      if (!win.isDestroyed()) {
        win.hide()
        win.setOpacity(1)
      }
    })
  }

  dispose(): void {
    stopAnimation()
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.destroy()
    }
  }

  private createWindow(): BrowserWindow {
    const win = new BrowserWindow({
      type: 'panel',
      width: 520,
      height: 340,
      show: false,
      frame: false,
      hasShadow: true,
      roundedCorners: true,
      resizable: false,
      movable: false,
      skipTaskbar: true,
      webPreferences: {
        preload: this.options.preloadPath,
        contextIsolation: true,
        sandbox: true,
        nodeIntegration: false,
      },
    })
    win.setVisibleOnAllWorkspaces(true, WORKSPACE_VISIBILITY_OPTIONS)

    if (this.options.isDev) {
      win.loadURL(this.options.devRendererUrl)
    } else {
      win.loadFile(this.options.prodRendererPath)
    }

    win.on('close', (e) => {
      e.preventDefault()
      this.hide()
    })

    return win
  }

  private positionAtScreenCenter(): void {
    if (!this.mainWindow) return
    const winBounds = this.mainWindow.getBounds()
    const display = screen.getDisplayNearestPoint(screen.getCursorScreenPoint())
    const workArea = display.workArea

    const x = Math.round(workArea.x + (workArea.width - winBounds.width) / 2)
    const y = Math.round(workArea.y + (workArea.height - winBounds.height) / 2)

    this.mainWindow.setPosition(x, y)
  }
}
