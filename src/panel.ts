import { BrowserWindow, screen } from 'electron/main'
import { fadeIn, fadeOut, stopAnimation } from '#/src/panel-animator.ts'
import type { Prefs } from '#/src/prefs.ts'

const WORKSPACE_VISIBILITY_OPTIONS = {
  visibleOnFullScreen: false,
  skipTransformProcessType: true,
} as const
const PANEL_WIDTH = 560
const PANEL_HEIGHT = 380
const AUTO_HIDE_ON_BLUR_DELAY_MS = 100

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
  private blurHideTimer: ReturnType<typeof setTimeout> | null = null
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
      const win = this.createWindow()
      this.mainWindow = win
      win.once('ready-to-show', () => {
        if (this.mainWindow !== win || win.isDestroyed()) return
        this.positionAtScreenCenter(win)
        this.showWindow(win)
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
    const win = this.mainWindow
    if (!win || win.isDestroyed()) return
    this.showWindow(win)
  }

  private showWindow(win: BrowserWindow): void {
    if (win.isDestroyed()) return
    this.clearBlurHideTimer()
    this.panelVisible = true
    win.setOpacity(0)
    win.setVisibleOnAllWorkspaces(true, WORKSPACE_VISIBILITY_OPTIONS)
    win.show()
    win.focus()
    this.options.onVisibilityChanged()
    fadeIn(win)
  }

  showOrFocus(): void {
    if (!this.mainWindow || this.mainWindow.isDestroyed()) {
      const win = this.createWindow()
      this.mainWindow = win
      win.once('ready-to-show', () => {
        if (this.mainWindow !== win || win.isDestroyed()) return
        this.positionAtScreenCenter(win)
        this.showWindow(win)
      })
      return
    }

    this.positionAtScreenCenter()
    this.show()
  }

  hide(): void {
    if (!this.mainWindow || this.mainWindow.isDestroyed() || !this.panelVisible) return
    this.clearBlurHideTimer()
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
    this.clearBlurHideTimer()
    const wasVisible = this.panelVisible
    this.panelVisible = false
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.destroy()
    }
    this.mainWindow = null
    if (wasVisible) this.options.onVisibilityChanged()
  }

  private createWindow(): BrowserWindow {
    const win = new BrowserWindow({
      type: 'panel',
      width: PANEL_WIDTH,
      height: PANEL_HEIGHT,
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
    win.webContents.setWindowOpenHandler(() => ({ action: 'deny' }))
    win.webContents.on('will-navigate', (event) => {
      event.preventDefault()
    })

    if (this.options.isDev) {
      win.loadURL(this.options.devRendererUrl)
    } else {
      win.loadFile(this.options.prodRendererPath)
    }

    win.on('close', (e) => {
      e.preventDefault()
      this.hide()
    })
    win.on('blur', () => {
      this.clearBlurHideTimer()
      this.scheduleBlurHide(win)
    })
    win.on('focus', () => {
      this.clearBlurHideTimer()
    })
    win.on('closed', () => {
      if (this.mainWindow !== win) return
      this.clearBlurHideTimer()
      const wasVisible = this.panelVisible
      this.mainWindow = null
      this.panelVisible = false
      if (wasVisible) this.options.onVisibilityChanged()
    })

    return win
  }

  private clearBlurHideTimer(): void {
    if (!this.blurHideTimer) return
    clearTimeout(this.blurHideTimer)
    this.blurHideTimer = null
  }

  private scheduleBlurHide(win: BrowserWindow): void {
    this.blurHideTimer = setTimeout(() => {
      this.blurHideTimer = null
      if (win.isDestroyed() || this.mainWindow !== win) return
      if (!this.panelVisible || win.isFocused()) return
      this.hide()
    }, AUTO_HIDE_ON_BLUR_DELAY_MS)
  }

  private positionAtScreenCenter(win = this.mainWindow): void {
    if (!win || win.isDestroyed()) return
    const display = screen.getDisplayNearestPoint(screen.getCursorScreenPoint())
    const workArea = display.workArea

    const x = Math.round(workArea.x + (workArea.width - PANEL_WIDTH) / 2)
    const y = Math.round(workArea.y + (workArea.height - PANEL_HEIGHT) / 2)

    win.setPosition(x, y)
  }
}
