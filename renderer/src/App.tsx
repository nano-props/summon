import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LayoutGrid } from 'lucide-react'
import { summonClient } from '#/renderer/src/data/summon-client.ts'
import { Header } from '#/renderer/src/Header.tsx'
import { useStore } from '#/renderer/src/store.ts'
import type { PanelAnimationPhase } from '#/src/shared/contracts.ts'
import { useKeyboardNav } from '#/renderer/src/useKeyboardNav.ts'
import { WindowCard } from '#/renderer/src/WindowCard.tsx'

export function App() {
  const { t } = useTranslation()
  const windows = useStore((s) => s.windows)
  const selectedIndex = useStore((s) => s.selectedIndex)
  const setSelectedIndex = useStore((s) => s.setSelectedIndex)
  const loadWindows = useStore((s) => s.loadWindows)
  const syncWindows = useStore((s) => s.syncWindows)
  const hydrate = useStore((s) => s.hydrate)
  const syncPrefs = useStore((s) => s.syncPrefs)
  const [panelAnimation, setPanelAnimation] = useState<PanelAnimationPhase>('hide')

  useEffect(() => {
    void hydrate()
    void loadWindows()
    return summonClient.onWindowsChanged(syncWindows)
  }, [hydrate, loadWindows, syncWindows])

  useEffect(() => {
    return summonClient.onPrefsChanged(syncPrefs)
  }, [syncPrefs])
  useEffect(() => {
    return summonClient.onPanelAnimation(setPanelAnimation)
  }, [setPanelAnimation])

  useEffect(() => {
    window.addEventListener('focus', loadWindows)
    return () => window.removeEventListener('focus', loadWindows)
  }, [loadWindows])

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
      !active || active === document.body || (active instanceof HTMLElement && active.hasAttribute('data-window-row'))
    if (shouldFocus) child?.focus({ preventScroll: true })
  }, [selectedIndex, windows])

  return (
    <div
      className={`relative h-full flex flex-col rounded-[14px] overflow-hidden select-none macos-panel panel-surface panel-surface-${panelAnimation} text-foreground`}
    >
      <Header />

      <div className="custom-scrollbar flex-1 overflow-y-auto">
        {windows.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-10 px-5 text-muted-foreground text-sm gap-2">
            <LayoutGrid className="size-7 opacity-30" />
            <div>{t('empty.no-windows')}</div>
            <div className="text-xs text-tertiary-foreground">{t('empty.new-terminal-hint')}</div>
          </div>
        ) : (
          <div ref={listRef} className="flex flex-col bg-list overflow-hidden">
            {windows.map((w, i) => (
              <WindowCard key={w.id} window={w} index={i} selected={i === selectedIndex} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
