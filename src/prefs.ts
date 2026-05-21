import { app } from 'electron/main'
import { readFileSync, writeFileSync, mkdirSync, renameSync, unlinkSync } from 'node:fs'
import path from 'node:path'

export type ThemeMode = 'light' | 'dark' | 'auto'
export type Language = 'en' | 'zh' | 'ko' | 'ja'
export type LanguageMode = 'auto' | Language

export interface Prefs {
  shortcutEnabled: boolean
  theme: ThemeMode
  language: LanguageMode
  resolvedLanguage: Language
}

interface StoredPrefs {
  shortcutEnabled: boolean
  theme: ThemeMode
  language: LanguageMode
}

const DEFAULT_PREFS: StoredPrefs = {
  shortcutEnabled: true,
  theme: 'auto',
  language: 'auto',
}

let cached: StoredPrefs | null = null

function prefsPath(): string {
  return path.join(app.getPath('userData'), 'prefs.json')
}

function systemLanguage(): Language {
  const locale = app.getLocale().toLowerCase()
  if (locale.startsWith('zh')) return 'zh'
  if (locale.startsWith('ko')) return 'ko'
  if (locale.startsWith('ja')) return 'ja'
  return 'en'
}

function normalizeTheme(value: unknown): ThemeMode {
  return value === 'light' || value === 'dark' || value === 'auto' ? value : DEFAULT_PREFS.theme
}

function normalizeLanguage(value: unknown): LanguageMode {
  return value === 'auto' || value === 'en' || value === 'zh' || value === 'ko' || value === 'ja'
    ? value
    : DEFAULT_PREFS.language
}

function resolveLanguage(language: LanguageMode): Language {
  return language === 'auto' ? systemLanguage() : language
}

function normalizePrefs(parsed: Partial<StoredPrefs>): StoredPrefs {
  return {
    shortcutEnabled:
      typeof parsed.shortcutEnabled === 'boolean' ? parsed.shortcutEnabled : DEFAULT_PREFS.shortcutEnabled,
    theme: normalizeTheme(parsed.theme),
    language: normalizeLanguage(parsed.language),
  }
}

function readCached(): StoredPrefs {
  if (cached) return cached
  try {
    const raw = readFileSync(prefsPath(), 'utf-8')
    const parsed = JSON.parse(raw) as Partial<StoredPrefs>
    cached = normalizePrefs(parsed)
  } catch {
    cached = { ...DEFAULT_PREFS }
  }
  return cached
}

export function loadPrefs(): Prefs {
  const prefs = readCached()
  return { ...prefs, resolvedLanguage: resolveLanguage(prefs.language) }
}

export function updatePrefs(patch: Partial<StoredPrefs>): Prefs {
  const next = normalizePrefs({ ...readCached(), ...patch })
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
  return loadPrefs()
}
