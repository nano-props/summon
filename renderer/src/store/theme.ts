import type { ThemeMode } from '../types'

const systemDarkMQ = window.matchMedia('(prefers-color-scheme: dark)')

export function applyTheme(mode: ThemeMode) {
  const isDark = mode === 'dark' || (mode === 'auto' && systemDarkMQ.matches)
  document.documentElement.classList.toggle('dark', isDark)
}

export function watchSystemTheme(getTheme: () => ThemeMode) {
  systemDarkMQ.addEventListener('change', () => {
    if (getTheme() === 'auto') applyTheme('auto')
  })
}
