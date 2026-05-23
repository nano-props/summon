// Preload script — must be CommonJS (.js) because sandboxed renderers cannot use ESM.
const { contextBridge, ipcRenderer } = require('electron/renderer')

// Keep these aligned with src/shared/ipc.ts. Sandboxed preload scripts cannot import the TS/ESM module.
const IPC_CHANNELS = {
  getWindows: 'get-windows',
  activateWindow: 'activate-window',
  newTerminal: 'new-terminal',
  hidePanel: 'hide-panel',
  getPrefs: 'get-prefs',
}
const RENDERER_CHANNELS = {
  windowsChanged: 'windows-changed',
  panelAnimation: 'panel-animation',
  prefsChanged: 'prefs-changed',
}
// Cache the latest animation phase so late subscribers receive the current CSS state immediately.
const panelAnimationCallbacks = new Set()
let panelAnimationPhase = 'hide'

ipcRenderer.on(RENDERER_CHANNELS.panelAnimation, (_event, phase) => {
  if (phase !== 'show' && phase !== 'hide') return
  panelAnimationPhase = phase
  for (const callback of panelAnimationCallbacks) {
    try {
      callback(phase)
    } catch (e) {
      console.error('Panel animation callback failed:', e)
    }
  }
})

contextBridge.exposeInMainWorld('summonAPI', {
  getWindows: () => ipcRenderer.invoke(IPC_CHANNELS.getWindows),
  activateWindow: (id, terminalId) => ipcRenderer.invoke(IPC_CHANNELS.activateWindow, id, terminalId),
  newTerminal: () => ipcRenderer.invoke(IPC_CHANNELS.newTerminal),
  hidePanel: () => ipcRenderer.invoke(IPC_CHANNELS.hidePanel),
  getPrefs: () => ipcRenderer.invoke(IPC_CHANNELS.getPrefs),
  onWindowsChanged: (callback) => {
    if (typeof callback !== 'function') return () => {}
    const listener = (_event, state) => callback(state)
    ipcRenderer.on(RENDERER_CHANNELS.windowsChanged, listener)
    return () => ipcRenderer.removeListener(RENDERER_CHANNELS.windowsChanged, listener)
  },
  onPanelAnimation: (callback) => {
    if (typeof callback !== 'function') return () => {}
    callback(panelAnimationPhase)
    panelAnimationCallbacks.add(callback)
    return () => panelAnimationCallbacks.delete(callback)
  },
  onPrefsChanged: (callback) => {
    if (typeof callback !== 'function') return () => {}
    const listener = (_event, prefs) => callback(prefs)
    ipcRenderer.on(RENDERER_CHANNELS.prefsChanged, listener)
    return () => ipcRenderer.removeListener(RENDERER_CHANNELS.prefsChanged, listener)
  },
})
