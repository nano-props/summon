import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useStore } from './store'
import { LayoutGrid } from 'lucide-react'
import { WindowCard } from './WindowCard'
import { Header } from './Header'
import { useKeyboardNav } from './useKeyboardNav'

export function App() {
  const { t } = useTranslation()
  const windows = useStore((s) => s.windows)
  const selectedIndex = useStore((s) => s.selectedIndex)
  const setSelectedIndex = useStore((s) => s.setSelectedIndex)
  const fetchWindows = useStore((s) => s.fetchWindows)
  const hydrate = useStore((s) => s.hydrate)
  const syncPrefs = useStore((s) => s.syncPrefs)

  useEffect(() => {
    hydrate()
    fetchWindows()
    const timer = setInterval(fetchWindows, 2000)
    return () => clearInterval(timer)
  }, [fetchWindows, hydrate])

  useEffect(() => window.summonAPI.onPrefsChanged(syncPrefs), [syncPrefs])

  useEffect(() => {
    window.addEventListener('focus', fetchWindows)
    return () => window.removeEventListener('focus', fetchWindows)
  }, [fetchWindows])

  const windowsRef = useRef(windows)
  windowsRef.current = windows
  useKeyboardNav(windowsRef)

  // Clamp selectedIndex when list shrinks
  useEffect(() => {
    if (windows.length === 0) {
      if (selectedIndex !== -1) setSelectedIndex(-1)
      return
    }
    if (selectedIndex < 0) {
      setSelectedIndex(0)
      return
    }
    if (selectedIndex >= windows.length) {
      setSelectedIndex(windows.length - 1)
    }
  }, [windows.length, selectedIndex, setSelectedIndex])

  // Scroll selected item into view
  const listRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (selectedIndex < 0 || !listRef.current) return
    const child = listRef.current.children[selectedIndex] as HTMLElement | undefined
    child?.scrollIntoView({ block: 'nearest' })
    const active = document.activeElement
    const shouldFocus =
      !active ||
      active === document.body ||
      (active instanceof HTMLElement && active.hasAttribute('data-window-row'))
    if (shouldFocus) child?.focus({ preventScroll: true })
  }, [selectedIndex, windows])

  return (
    <div className="relative h-full flex flex-col rounded-[14px] overflow-hidden select-none macos-panel text-foreground">
      <Header />

      <div className="custom-scrollbar flex-1 overflow-y-auto">
        {windows.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-12 px-5 text-muted-foreground text-sm gap-2">
            <LayoutGrid className="size-7 opacity-30" />
            <div>{t('empty.no-windows')}</div>
            <div className="text-xs text-tertiary-foreground">{t('empty.new-terminal-hint')}</div>
          </div>
        ) : (
          <div
            ref={listRef}
            className="flex flex-col bg-list border-b border-separator overflow-hidden"
          >
            {windows.map((w, i) => (
              <WindowCard key={w.id} window={w} index={i} selected={i === selectedIndex} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
