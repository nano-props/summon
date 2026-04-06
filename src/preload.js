// Preload script — must be CommonJS (.js) because sandboxed renderers cannot use ESM.
const { contextBridge, ipcRenderer } = require('electron/renderer')

contextBridge.exposeInMainWorld('summonAPI', {
  getWindows: () => ipcRenderer.invoke('get-windows'),
  activateWindow: (id) => ipcRenderer.invoke('activate-window', id),
  saveAlias: (id, alias) => ipcRenderer.invoke('save-alias', id, alias),
  reorderWindows: (orderedIds) => ipcRenderer.invoke('reorder-windows', orderedIds),
  newTerminal: () => ipcRenderer.invoke('new-terminal'),
  hidePanel: () => ipcRenderer.invoke('hide-panel'),
  quit: () => ipcRenderer.invoke('quit'),
})
