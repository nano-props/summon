import { app, Menu, shell, type MenuItemConstructorOptions } from 'electron'
import type { Tray } from 'electron/main'
import i18next from 'i18next'
import { execSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { defaultLanguage, i18nResources } from '#/src/i18n-resources.ts'
import { loadPrefs, updatePrefs, type Language, type LanguageMode, type Prefs, type ThemeMode } from '#/src/prefs.ts'
import { SHORTCUT_ACCELERATOR, setShortcutEnabled } from '#/src/shortcut.ts'

const GITHUB_URL = 'https://github.com/nano-props/summon'

const nativeLanguageLabels: Record<Language, string> = {
  en: 'English',
  zh: '中文',
  ko: '한국어',
  ja: '日本語',
}

type TrayLabelKey = keyof (typeof i18nResources)[typeof defaultLanguage]['translation']['tray']

interface TrayMenuControllerOptions {
  isPanelVisible: () => boolean
  togglePanel: () => void
  hidePanel: () => void
  newTerminal: () => Promise<void>
  notifyPrefsChanged: (prefs: Prefs) => void
}

interface PackageMetadata {
  summonBuild?: {
    commit?: unknown
  }
}

function packageCommitHash(): string {
  try {
    const pkg = JSON.parse(readFileSync(path.join(app.getAppPath(), 'package.json'), 'utf8')) as PackageMetadata
    return typeof pkg.summonBuild?.commit === 'string' ? pkg.summonBuild.commit : ''
  } catch {
    return ''
  }
}

function gitCommitHash(): string {
  try {
    return execSync('git rev-parse --short HEAD', { cwd: app.getAppPath() }).toString().trim()
  } catch {
    return ''
  }
}

const BUILD_HASH = packageCommitHash() || gitCommitHash()
const trayI18n = i18next.createInstance()
// Tray labels use bundled in-process resources, without an async i18next backend.
void trayI18n.init({
  lng: defaultLanguage,
  fallbackLng: defaultLanguage,
  interpolation: { escapeValue: false },
  resources: i18nResources,
})

function trayLabel(language: Language, key: TrayLabelKey): string {
  return trayI18n.t(`tray.${key}`, { lng: language })
}

export class TrayMenuController {
  private readonly tray: Tray
  private readonly options: TrayMenuControllerOptions

  constructor(tray: Tray, options: TrayMenuControllerOptions) {
    this.tray = tray
    this.options = options
  }

  update(): void {
    if (this.tray.isDestroyed()) return
    this.tray.setContextMenu(this.buildMenu())
  }

  private updateShortcutEnabled(enabled: boolean): boolean {
    const previous = loadPrefs().shortcutEnabled
    if (enabled === previous) return true
    const shortcutOk = setShortcutEnabled(enabled, this.options.togglePanel)
    if (!shortcutOk) return false
    try {
      const prefs = updatePrefs({ shortcutEnabled: enabled })
      this.options.notifyPrefsChanged(prefs)
      this.update()
      return true
    } catch (e) {
      console.error('set-shortcut-enabled failed:', e)
      setShortcutEnabled(previous, this.options.togglePanel)
      return false
    }
  }

  private updateTheme(value: ThemeMode): boolean {
    if (value !== 'light' && value !== 'dark' && value !== 'auto') return false
    try {
      const prefs = updatePrefs({ theme: value })
      this.options.notifyPrefsChanged(prefs)
      this.update()
      return true
    } catch (e) {
      console.error('set-theme failed:', e)
      return false
    }
  }

  private updateLanguage(value: LanguageMode): Prefs | null {
    if (value !== 'auto' && value !== 'en' && value !== 'zh' && value !== 'ko' && value !== 'ja') return null
    try {
      const prefs = updatePrefs({ language: value })
      this.options.notifyPrefsChanged(prefs)
      this.update()
      return prefs
    } catch (e) {
      console.error('set-language failed:', e)
      return null
    }
  }

  private versionBuildLabel(language: Language): string {
    return `${trayLabel(language, 'version')} ${app.getVersion()} · ${trayLabel(language, 'build')} ${
      BUILD_HASH || trayLabel(language, 'unknown')
    }`
  }

  private buildMenu(): Electron.Menu {
    const prefs = loadPrefs()
    const language = prefs.resolvedLanguage
    const label = (key: TrayLabelKey) => trayLabel(language, key)
    const themeItems: MenuItemConstructorOptions[] = [
      { label: label('system'), type: 'radio', checked: prefs.theme === 'auto', click: () => this.updateTheme('auto') },
      {
        label: label('light'),
        type: 'radio',
        checked: prefs.theme === 'light',
        click: () => this.updateTheme('light'),
      },
      { label: label('dark'), type: 'radio', checked: prefs.theme === 'dark', click: () => this.updateTheme('dark') },
    ]
    const languageItems: MenuItemConstructorOptions[] = (['auto', 'en', 'zh', 'ko', 'ja'] as const).map((value) => ({
      label: value === 'auto' ? label('system') : nativeLanguageLabels[value],
      type: 'radio',
      checked: prefs.language === value,
      click: () => this.updateLanguage(value),
    }))

    return Menu.buildFromTemplate([
      {
        label: this.options.isPanelVisible() ? label('hide') : label('show'),
        accelerator: SHORTCUT_ACCELERATOR,
        click: this.options.togglePanel,
      },
      {
        label: label('newTerminal'),
        accelerator: 'Command+N',
        click: async () => {
          await this.options.newTerminal()
          this.options.hidePanel()
        },
      },
      { type: 'separator' },
      { label: label('appearance'), submenu: themeItems },
      { label: label('language'), submenu: languageItems },
      { type: 'separator' },
      {
        label: `${label('shortcut')} (⌥Space)`,
        type: 'checkbox',
        checked: prefs.shortcutEnabled,
        click: (item) => this.updateShortcutEnabled(item.checked),
      },
      {
        label: label('github'),
        click: async () => {
          await shell.openExternal(GITHUB_URL)
        },
      },
      { type: 'separator' },
      {
        label: this.versionBuildLabel(language),
        enabled: false,
      },
      { type: 'separator' },
      { label: label('quit'), role: 'quit' },
    ])
  }
}
