import { useEffect, useMemo, useRef, useCallback } from 'react'
import Sortable from 'sortablejs'
import { some } from 'lodash-es'
import { useStore } from './store'
import { LayoutGrid } from 'lucide-react'
import { WindowCard } from './WindowCard'
import { Header } from './Header'
import { SearchInput } from './SearchInput'
import { Footer } from './Footer'
import { useKeyboardNav, shortcutLabel } from './useKeyboardNav'

export function App() {
  const { windows, query, selectedIndex, setSelectedIndex, fetchWindows, reorderWindows, hydrate } = useStore()
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    hydrate()
    fetchWindows()
    const timer = setInterval(fetchWindows, 2000)
    return () => clearInterval(timer)
  }, [fetchWindows, hydrate])

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim()
    if (!q) return windows
    const fields = ['title', 'cwd', 'alias'] as const
    return windows.filter((w) => some(fields, (f) => w[f].toLowerCase().includes(q)))
  }, [windows, query])

  const filteredRef = useRef(filtered)
  filteredRef.current = filtered

  const handleCardRef = useKeyboardNav(searchRef, filteredRef)

  // Clamp selectedIndex when filtered list shrinks
  useEffect(() => {
    if (selectedIndex >= filtered.length) {
      setSelectedIndex(Math.max(filtered.length - 1, -1))
    }
  }, [filtered.length, selectedIndex, setSelectedIndex])

  // Scroll selected item into view
  const listRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (selectedIndex < 0 || !listRef.current) return
    const child = listRef.current.children[selectedIndex] as HTMLElement | undefined
    child?.scrollIntoView({ block: 'nearest' })
  }, [selectedIndex])

  const sortableRef = useRef<Sortable | null>(null)
  const reorderRef = useRef(reorderWindows)
  reorderRef.current = reorderWindows
  const windowsRef = useRef(windows)
  windowsRef.current = windows

  const listCallbackRef = useCallback((el: HTMLDivElement | null) => {
    if (sortableRef.current) {
      sortableRef.current.destroy()
      sortableRef.current = null
    }
    listRef.current = el
    if (!el) return
    sortableRef.current = Sortable.create(el, {
      animation: 200,
      easing: 'cubic-bezier(0.25, 0.8, 0.25, 1)',
      handle: '.drag-handle',
      ghostClass: 'sortable-ghost',
      chosenClass: 'sortable-chosen',
      dragClass: 'sortable-drag',
      filter: 'input',
      preventOnFilter: false,
      onEnd(evt) {
        if (evt.oldIndex == null || evt.newIndex == null) return
        if (evt.oldIndex === evt.newIndex) return
        const filteredIds = filteredRef.current.map((w) => w.id)
        const [moved] = filteredIds.splice(evt.oldIndex, 1)
        filteredIds.splice(evt.newIndex, 0, moved)
        const filteredSet = new Set(filteredIds)
        let fi = 0
        const fullIds = windowsRef.current.map((w) => (filteredSet.has(w.id) ? filteredIds[fi++] : w.id))
        reorderRef.current(fullIds)
      },
    })
  }, [])

  return (
    <div className="h-full flex flex-col rounded-xl overflow-hidden select-none bg-background text-foreground">
      <Header />

      <div className="px-3 shrink-0">
        <SearchInput inputRef={searchRef} />
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-1">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-12 px-3 text-muted-foreground text-sm gap-2">
            <LayoutGrid className="size-7 opacity-30" />
            <div>{windows.length === 0 ? 'No Ghostty windows open' : 'No matching windows'}</div>
          </div>
        ) : (
          <div ref={listCallbackRef} className="flex flex-col gap-1 px-1 py-1">
            {filtered.map((w, i) => (
              <WindowCard
                key={w.id}
                window={w}
                selected={i === selectedIndex}
                shortcut={shortcutLabel(i)}
                onHandle={handleCardRef}
              />
            ))}
          </div>
        )}
      </div>

      <div className="px-3 pb-3 shrink-0">
        <Footer />
      </div>
    </div>
  )
}
