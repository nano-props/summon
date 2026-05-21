import { globalShortcut } from 'electron/main'

export const SHORTCUT_ACCELERATOR = 'Option+Space'

export function setShortcutEnabled(enabled: boolean, action: () => void): boolean {
  if (enabled) {
    if (globalShortcut.isRegistered(SHORTCUT_ACCELERATOR)) return true
    const ok = globalShortcut.register(SHORTCUT_ACCELERATOR, action)
    if (!ok) console.warn(`Failed to register ${SHORTCUT_ACCELERATOR} — may be in use by another app`)
    return ok
  }
  globalShortcut.unregister(SHORTCUT_ACCELERATOR)
  return true
}

export function unregisterShortcuts(): void {
  globalShortcut.unregisterAll()
}
