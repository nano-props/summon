import { Menu, shell, type MenuItemConstructorOptions } from 'electron'
import type { Tray } from 'electron/main'
import { loadPrefs, updatePrefs, type Language, type LanguageMode, type Prefs, type ThemeMode } from '#/src/prefs.ts'
import { SHORTCUT_ACCELERATOR, setShortcutEnabled } from '#/src/shortcut.ts'

const GITHUB_URL = 'https://github.com/nano-props/summon'

const trayLabels: Record<Language, Record<string, string>> = {
  en: {
    show: 'Show Summon',
    hide: 'Hide Summon',
    newTerminal: 'New Terminal',
    appearance: 'Appearance',
    system: 'System',
    light: 'Light',
    dark: 'Dark',
    language: 'Language',
    shortcut: 'Shortcut',
    github: 'GitHub',
    quit: 'Quit Summon',
  },
  zh: {
    show: '显示 Summon',
    hide: '隐藏 Summon',
    newTerminal: '新建终端',
    appearance: '外观',
    system: '跟随系统',
    light: '浅色',
    dark: '深色',
    language: '语言',
    shortcut: '快捷键',
    github: 'GitHub',
    quit: '退出 Summon',
  },
  ko: {
    show: 'Summon 표시',
    hide: 'Summon 숨기기',
    newTerminal: '새 터미널',
    appearance: '모양',
    system: '시스템',
    light: '라이트',
    dark: '다크',
    language: '언어',
    shortcut: '단축키',
    github: 'GitHub',
    quit: 'Summon 종료',
  },
  ja: {
    show: 'Summon を表示',
    hide: 'Summon を隠す',
    newTerminal: '新しいターミナル',
    appearance: '外観',
    system: 'システム',
    light: 'ライト',
    dark: 'ダーク',
    language: '言語',
    shortcut: 'ショートカット',
    github: 'GitHub',
    quit: 'Summon を終了',
  },
}

const languageLabels: Record<LanguageMode, string> = {
  auto: 'System',
  en: 'English',
  zh: '中文',
  ko: '한국어',
  ja: '日本語',
}

interface TrayMenuControllerOptions {
  isPanelVisible: () => boolean
  togglePanel: () => void
  hidePanel: () => void
  newTerminal: () => Promise<void>
  notifyPrefsChanged: (prefs: Prefs) => void
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

  private buildMenu(): Electron.Menu {
    const prefs = loadPrefs()
    const label = trayLabels[prefs.resolvedLanguage]
    const themeItems: MenuItemConstructorOptions[] = [
      { label: label.system, type: 'radio', checked: prefs.theme === 'auto', click: () => this.updateTheme('auto') },
      { label: label.light, type: 'radio', checked: prefs.theme === 'light', click: () => this.updateTheme('light') },
      { label: label.dark, type: 'radio', checked: prefs.theme === 'dark', click: () => this.updateTheme('dark') },
    ]
    const languageItems: MenuItemConstructorOptions[] = (['auto', 'en', 'zh', 'ko', 'ja'] as const).map((value) => ({
      label: value === 'auto' ? label.system : languageLabels[value],
      type: 'radio',
      checked: prefs.language === value,
      click: () => this.updateLanguage(value),
    }))

    return Menu.buildFromTemplate([
      {
        label: this.options.isPanelVisible() ? label.hide : label.show,
        accelerator: SHORTCUT_ACCELERATOR,
        click: this.options.togglePanel,
      },
      {
        label: label.newTerminal,
        accelerator: 'Command+N',
        click: async () => {
          await this.options.newTerminal()
          this.options.hidePanel()
        },
      },
      { type: 'separator' },
      { label: label.appearance, submenu: themeItems },
      { label: label.language, submenu: languageItems },
      { type: 'separator' },
      {
        label: `${label.shortcut} (⌥Space)`,
        type: 'checkbox',
        checked: prefs.shortcutEnabled,
        click: (item) => this.updateShortcutEnabled(item.checked),
      },
      {
        label: label.github,
        click: async () => {
          await shell.openExternal(GITHUB_URL)
        },
      },
      { type: 'separator' },
      { label: label.quit, role: 'quit' },
    ])
  }
}
