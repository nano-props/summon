export const defaultLanguage = 'en'

export const i18nResources = {
  en: {
    translation: {
      empty: {
        'no-windows': 'No Ghostty windows open',
        'new-terminal-hint': 'Press ⌘N to open a new terminal',
      },
      window: {
        'no-path': '(no path)',
        untitled: '(untitled)',
      },
      tray: {
        show: 'Show Summon',
        hide: 'Hide Summon',
        newTerminal: 'New Terminal',
        appearance: 'Appearance',
        system: 'System',
        light: 'Light',
        dark: 'Dark',
        language: 'Language',
        shortcut: 'Shortcut',
        shortcutOff: 'Off',
        shortcutRegistrationFailed: 'Shortcut unavailable',
        shortcutRegistrationFailedDetail:
          '{{accelerator}} could not be registered. It may already be in use by macOS or another app.',
        about: 'About',
        github: 'GitHub',
        version: 'Version',
        build: 'Build',
        unknown: 'unknown',
        quit: 'Quit Summon',
      },
    },
  },
  zh: {
    translation: {
      empty: {
        'no-windows': '没有打开的 Ghostty 窗口',
        'new-terminal-hint': '按 ⌘N 新建终端',
      },
      window: {
        'no-path': '（无路径）',
        untitled: '（无标题）',
      },
      tray: {
        show: '显示 Summon',
        hide: '隐藏 Summon',
        newTerminal: '新建终端',
        appearance: '外观',
        system: '跟随系统',
        light: '浅色',
        dark: '深色',
        language: '语言',
        shortcut: '快捷键',
        shortcutOff: '关闭',
        shortcutRegistrationFailed: '快捷键不可用',
        shortcutRegistrationFailedDetail: '无法注册 {{accelerator}}，它可能已被 macOS 或其他应用占用。',
        about: '关于',
        github: 'GitHub',
        version: '版本',
        build: '构建',
        unknown: '未知',
        quit: '退出 Summon',
      },
    },
  },
  ko: {
    translation: {
      empty: {
        'no-windows': '열려 있는 Ghostty 창이 없습니다',
        'new-terminal-hint': '⌘N을 눌러 새 터미널을 여세요',
      },
      window: {
        'no-path': '(경로 없음)',
        untitled: '(제목 없음)',
      },
      tray: {
        show: 'Summon 표시',
        hide: 'Summon 숨기기',
        newTerminal: '새 터미널',
        appearance: '모양',
        system: '시스템',
        light: '라이트',
        dark: '다크',
        language: '언어',
        shortcut: '단축키',
        shortcutOff: '끄기',
        shortcutRegistrationFailed: '단축키를 사용할 수 없음',
        shortcutRegistrationFailedDetail:
          '{{accelerator}}을(를) 등록할 수 없습니다. macOS 또는 다른 앱에서 이미 사용 중일 수 있습니다.',
        about: '정보',
        github: 'GitHub',
        version: '버전',
        build: '빌드',
        unknown: '알 수 없음',
        quit: 'Summon 종료',
      },
    },
  },
  ja: {
    translation: {
      empty: {
        'no-windows': '開いている Ghostty ウィンドウはありません',
        'new-terminal-hint': '⌘N で新しいターミナルを開く',
      },
      window: {
        'no-path': '（パスなし）',
        untitled: '（無題）',
      },
      tray: {
        show: 'Summon を表示',
        hide: 'Summon を隠す',
        newTerminal: '新しいターミナル',
        appearance: '外観',
        system: 'システム',
        light: 'ライト',
        dark: 'ダーク',
        language: '言語',
        shortcut: 'ショートカット',
        shortcutOff: 'オフ',
        shortcutRegistrationFailed: 'ショートカットを使用できません',
        shortcutRegistrationFailedDetail:
          '{{accelerator}} を登録できませんでした。macOS または別のアプリが既に使用している可能性があります。',
        about: 'Summon について',
        github: 'GitHub',
        version: 'バージョン',
        build: 'ビルド',
        unknown: '不明',
        quit: 'Summon を終了',
      },
    },
  },
} as const
