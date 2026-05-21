import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

const defaultLanguage = 'en'

i18n.use(initReactI18next).init({
  lng: defaultLanguage,
  fallbackLng: defaultLanguage,
  interpolation: { escapeValue: false },
  resources: {
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
      },
    },
  },
})

export { i18n }
