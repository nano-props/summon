export const IPC_CHANNELS = {
  getWindows: 'get-windows',
  activateWindow: 'activate-window',
  newTerminal: 'new-terminal',
  hidePanel: 'hide-panel',
  getPrefs: 'get-prefs',
} as const

export const RENDERER_CHANNELS = {
  windowsChanged: 'windows-changed',
  panelAnimation: 'panel-animation',
  prefsChanged: 'prefs-changed',
} as const
