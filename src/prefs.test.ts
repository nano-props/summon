import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const electronState = vi.hoisted(() => ({
  userData: '',
  locale: 'en-US',
}))

vi.mock('electron/main', () => ({
  app: {
    getPath: (name: string) => {
      if (name !== 'userData') throw new Error(`Unexpected path request: ${name}`)
      return electronState.userData
    },
    getLocale: () => electronState.locale,
  },
}))

let tempDir = ''

beforeEach(() => {
  tempDir = mkdtempSync(path.join(os.tmpdir(), 'summon-prefs-'))
  electronState.userData = tempDir
  electronState.locale = 'en-US'
})

afterEach(() => {
  rmSync(tempDir, { recursive: true, force: true })
  tempDir = ''
})

async function importPrefs() {
  vi.resetModules()
  return import('#/src/prefs.ts')
}

function prefsFile(): string {
  return path.join(tempDir, 'prefs.json')
}

describe('prefs', () => {
  it('loads defaults and resolves system language', async () => {
    electronState.locale = 'zh-Hans'
    const { loadPrefs } = await importPrefs()

    expect(loadPrefs()).toEqual({
      shortcutEnabled: true,
      shortcutAccelerator: 'Option+Space',
      theme: 'auto',
      language: 'auto',
      resolvedLanguage: 'zh',
    })
  })

  it('normalizes invalid stored values', async () => {
    electronState.locale = 'ja-JP'
    writeFileSync(
      prefsFile(),
      JSON.stringify({
        shortcutEnabled: 'yes',
        shortcutAccelerator: 'Bad+Shortcut',
        theme: 'neon',
        language: 'xx',
      }),
    )
    const { loadPrefs } = await importPrefs()

    expect(loadPrefs()).toEqual({
      shortcutEnabled: true,
      shortcutAccelerator: 'Option+Space',
      theme: 'auto',
      language: 'auto',
      resolvedLanguage: 'ja',
    })
  })

  it('writes normalized stored prefs without resolved fields', async () => {
    const { loadPrefs, updatePrefs } = await importPrefs()

    const prefs = updatePrefs({ shortcutEnabled: false, theme: 'dark', language: 'ko' })
    const stored = JSON.parse(readFileSync(prefsFile(), 'utf8')) as unknown

    expect(stored).toEqual({
      shortcutEnabled: false,
      shortcutAccelerator: 'Option+Space',
      theme: 'dark',
      language: 'ko',
    })
    expect(prefs).toEqual({
      shortcutEnabled: false,
      shortcutAccelerator: 'Option+Space',
      theme: 'dark',
      language: 'ko',
      resolvedLanguage: 'ko',
    })
    expect(loadPrefs()).toEqual(prefs)
  })
})
