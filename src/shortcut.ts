import { globalShortcut } from 'electron/main'
import type { ShortcutAccelerator } from '#/src/shared/shortcuts.ts'

let registeredAccelerator: ShortcutAccelerator | null = null

export function setShortcutEnabled(enabled: boolean, accelerator: ShortcutAccelerator, action: () => void): boolean {
  if (registeredAccelerator) {
    globalShortcut.unregister(registeredAccelerator)
    registeredAccelerator = null
  }
  if (!enabled) return true
  const ok = globalShortcut.register(accelerator, action)
  if (!ok) console.warn(`Failed to register ${accelerator} — may be in use by another app`)
  if (ok) registeredAccelerator = accelerator
  return ok
}

export function unregisterShortcuts(): void {
  globalShortcut.unregisterAll()
  registeredAccelerator = null
}
