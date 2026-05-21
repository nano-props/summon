// Preload script — must be CommonJS (.js) because sandboxed renderers cannot use ESM.
const { contextBridge, ipcRenderer } = require('electron/renderer')

contextBridge.exposeInMainWorld('summonAPI', {
  getWindows: () => ipcRenderer.invoke('get-windows'),
  activateWindow: (id, terminalId) => ipcRenderer.invoke('activate-window', id, terminalId),
  newTerminal: () => ipcRenderer.invoke('new-terminal'),
  hidePanel: () => ipcRenderer.invoke('hide-panel'),
  getPrefs: () => ipcRenderer.invoke('get-prefs'),
  onPrefsChanged: (callback) => {
    const listener = (_event, prefs) => callback(prefs)
    ipcRenderer.on('prefs-changed', listener)
    return () => ipcRenderer.removeListener('prefs-changed', listener)
  },
})
