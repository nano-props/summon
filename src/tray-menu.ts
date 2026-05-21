import { app, dialog, Menu, shell, type MenuItemConstructorOptions } from 'electron'
import type { Tray } from 'electron/main'
import i18next from 'i18next'
import { execSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { defaultLanguage, i18nResources } from '#/src/i18n-resources.ts'
import { loadPrefs, updatePrefs, type Language, type LanguageMode, type Prefs, type ThemeMode } from '#/src/prefs.ts'
import { setShortcutEnabled } from '#/src/shortcut.ts'
import { SHORTCUT_ACCELERATORS, type ShortcutAccelerator } from '#/src/shared/shortcuts.ts'

const GITHUB_URL = 'https://github.com/nano-props/summon'

const nativeLanguageLabels: Record<Language, string> = {
  en: 'English',
  zh: '中文',
  ko: '한국어',
  ja: '日本語',
}

const shortcutLabels: Record<ShortcutAccelerator, string> = {
  'Option+Space': '⌥ Space',
  'Option+Tab': '⌥ Tab',
  'Command+Shift+Space': '⌘ ⇧ Space',
  'Control+Space': '⌃ Space',
  'Command+Space': '⌘ Space',
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

function buildHash(): string {
  const packagedHash = packageCommitHash()
  if (packagedHash || app.isPackaged) return packagedHash
  return gitCommitHash()
}

const BUILD_HASH = buildHash()
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

function restoreShortcut(prefs: Prefs, action: () => void): void {
  const restored = setShortcutEnabled(prefs.shortcutEnabled, prefs.shortcutAccelerator, action)
  if (!restored) console.warn(`Failed to restore ${prefs.shortcutAccelerator}`)
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

  showShortcutRegistrationFailed(accelerator: ShortcutAccelerator): void {
    const language = loadPrefs().resolvedLanguage
    void dialog.showMessageBox({
      type: 'warning',
      message: trayLabel(language, 'shortcutRegistrationFailed'),
      detail: trayI18n.t('tray.shortcutRegistrationFailedDetail', { lng: language, accelerator }),
    })
  }

  private updateShortcut(enabled: boolean, accelerator: ShortcutAccelerator): boolean {
    const previous = loadPrefs()
    if (enabled === previous.shortcutEnabled && accelerator === previous.shortcutAccelerator) return true
    const shortcutOk = setShortcutEnabled(enabled, accelerator, this.options.togglePanel)
    if (!shortcutOk) {
      restoreShortcut(previous, this.options.togglePanel)
      this.showShortcutRegistrationFailed(accelerator)
      return false
    }
    try {
      const prefs = updatePrefs({ shortcutEnabled: enabled, shortcutAccelerator: accelerator })
      this.options.notifyPrefsChanged(prefs)
      this.update()
      return true
    } catch (e) {
      console.error('set-shortcut failed:', e)
      restoreShortcut(previous, this.options.togglePanel)
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
    const shortcutItems: MenuItemConstructorOptions[] = [
      ...SHORTCUT_ACCELERATORS.map((value) => ({
        label: shortcutLabels[value],
        type: 'radio' as const,
        checked: prefs.shortcutEnabled && prefs.shortcutAccelerator === value,
        click: () => this.updateShortcut(true, value),
      })),
      { type: 'separator' as const },
      {
        label: label('shortcutOff'),
        type: 'radio',
        checked: !prefs.shortcutEnabled,
        click: () => this.updateShortcut(false, prefs.shortcutAccelerator),
      },
    ]

    return Menu.buildFromTemplate([
      {
        label: this.options.isPanelVisible() ? label('hide') : label('show'),
        accelerator: prefs.shortcutEnabled ? prefs.shortcutAccelerator : undefined,
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
      { label: label('shortcut'), submenu: shortcutItems },
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
