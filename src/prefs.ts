import { app } from 'electron/main'
import { readFileSync, writeFileSync, mkdirSync, renameSync, unlinkSync } from 'node:fs'
import path from 'node:path'

export type ThemeMode = 'light' | 'dark' | 'auto'

export interface Prefs {
  pinned: boolean
  shortcutEnabled: boolean
  theme: ThemeMode
}

const DEFAULT_PREFS: Prefs = {
  pinned: false,
  shortcutEnabled: true,
  theme: 'auto',
}

let cached: Prefs | null = null

function prefsPath(): string {
  return path.join(app.getPath('userData'), 'prefs.json')
}

function readCached(): Prefs {
  if (cached) return cached
  try {
    const raw = readFileSync(prefsPath(), 'utf-8')
    const parsed = JSON.parse(raw) as Partial<Prefs>
    cached = { ...DEFAULT_PREFS, ...parsed }
  } catch {
    cached = { ...DEFAULT_PREFS }
  }
  return cached
}

export function loadPrefs(): Prefs {
  return { ...readCached() }
}

export function updatePrefs(patch: Partial<Prefs>): Prefs {
  const next = { ...readCached(), ...patch }
  const target = prefsPath()
  const tmp = `${target}.${process.pid}.tmp`
  try {
    mkdirSync(path.dirname(target), { recursive: true })
    writeFileSync(tmp, JSON.stringify(next, null, 2), 'utf-8')
    renameSync(tmp, target)
  } catch (e) {
    try {
      unlinkSync(tmp)
    } catch {
      // tmp may not exist — ignore
    }
    throw e
  }
  cached = next
  return { ...next }
}
