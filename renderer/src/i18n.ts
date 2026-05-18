import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import type { Language } from './types'

export const languages: { value: Language; label: string }[] = [
  { value: 'en', label: 'English' },
  { value: 'zh', label: '中文' },
  { value: 'ko', label: '한국어' },
  { value: 'ja', label: '日本語' },
]

export const defaultLanguage: Language = 'en'

i18n.use(initReactI18next).init({
  lng: defaultLanguage,
  fallbackLng: defaultLanguage,
  interpolation: { escapeValue: false },
  resources: {
    en: {
      translation: {
        status: {
          watching: 'Watching Ghostty windows',
        },
        actions: {
          newTerminal: 'New Terminal',
          pin: 'Pin (stay open)',
          unpin: 'Unpin (auto-hide)',
          hide: 'Hide (Esc)',
          more: 'More',
          quit: 'Quit Summon',
          clearSearch: 'Clear search',
        },
        menu: {
          appearance: 'Appearance',
          language: 'Language',
          shortcut: 'Shortcut',
        },
        language: {
          auto: 'Auto (System)',
        },
        theme: {
          light: 'Light',
          dark: 'Dark',
          auto: 'Auto',
        },
        search: {
          placeholder: 'Filter windows...',
        },
        empty: {
          noWindows: 'No Ghostty windows open',
          noMatches: 'No matching windows',
        },
        window: {
          noPath: '(no path)',
          untitled: '(untitled)',
        },
      },
    },
    zh: {
      translation: {
        status: {
          watching: '正在监听 Ghostty 窗口',
        },
        actions: {
          newTerminal: '新建终端',
          pin: '固定（保持显示）',
          unpin: '取消固定（自动隐藏）',
          hide: '隐藏（Esc）',
          more: '更多',
          quit: '退出 Summon',
          clearSearch: '清空搜索',
        },
        menu: {
          appearance: '外观',
          language: '语言',
          shortcut: '快捷键',
        },
        language: {
          auto: '自动（系统）',
        },
        theme: {
          light: '浅色',
          dark: '深色',
          auto: '自动',
        },
        search: {
          placeholder: '过滤窗口...',
        },
        empty: {
          noWindows: '没有打开的 Ghostty 窗口',
          noMatches: '没有匹配的窗口',
        },
        window: {
          noPath: '（无路径）',
          untitled: '（无标题）',
        },
      },
    },
    ko: {
      translation: {
        status: {
          watching: 'Ghostty 창 감시 중',
        },
        actions: {
          newTerminal: '새 터미널',
          pin: '고정하기',
          unpin: '고정 해제',
          hide: '숨기기 (Esc)',
          more: '더 보기',
          quit: 'Summon 종료',
          clearSearch: '검색 지우기',
        },
        menu: {
          appearance: '모양',
          language: '언어',
          shortcut: '단축키',
        },
        language: {
          auto: '자동 (시스템)',
        },
        theme: {
          light: '라이트',
          dark: '다크',
          auto: '자동',
        },
        search: {
          placeholder: '창 필터링...',
        },
        empty: {
          noWindows: '열려 있는 Ghostty 창이 없습니다',
          noMatches: '일치하는 창이 없습니다',
        },
        window: {
          noPath: '(경로 없음)',
          untitled: '(제목 없음)',
        },
      },
    },
    ja: {
      translation: {
        status: {
          watching: 'Ghostty ウィンドウを監視中',
        },
        actions: {
          newTerminal: '新規ターミナル',
          pin: '固定する',
          unpin: '固定を解除',
          hide: '隠す（Esc）',
          more: 'その他',
          quit: 'Summon を終了',
          clearSearch: '検索をクリア',
        },
        menu: {
          appearance: '外観',
          language: '言語',
          shortcut: 'ショートカット',
        },
        language: {
          auto: '自動（システム）',
        },
        theme: {
          light: 'ライト',
          dark: 'ダーク',
          auto: '自動',
        },
        search: {
          placeholder: 'ウィンドウを絞り込み...',
        },
        empty: {
          noWindows: '開いている Ghostty ウィンドウはありません',
          noMatches: '一致するウィンドウはありません',
        },
        window: {
          noPath: '（パスなし）',
          untitled: '（無題）',
        },
      },
    },
  },
})

export { i18n }
