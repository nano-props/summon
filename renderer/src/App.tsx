import { useEffect, useMemo, useRef, useCallback } from 'react'
import Sortable from 'sortablejs'
import { some } from 'lodash-es'
import { useStore } from './store'
import { AppsOutline } from '@ricons/ionicons5'
import { Icon } from './Icon'
import { WindowCard } from './WindowCard'
import { Header } from './Header'
import { SearchInput } from './SearchInput'
import { Footer } from './Footer'
import { useKeyboardNav } from './useKeyboardNav'

export function App() {
  const { windows, query, selectedIndex, setSelectedIndex, fetchWindows, reorderWindows } = useStore()
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchWindows()
    const timer = setInterval(fetchWindows, 2000)
    return () => clearInterval(timer)
  }, [fetchWindows])

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
    <div className="h-full flex flex-col rounded-xl overflow-hidden select-none">
      <Header />

      <div className="flex-1 overflow-y-auto px-5 pb-5">
        <SearchInput inputRef={searchRef} />

        {filtered.length === 0 ? (
          <div className="text-center py-12 px-5 text-text-muted text-[13px]">
            <Icon size={32} className="inline-block mb-3 opacity-40"><AppsOutline /></Icon>
            <div>{windows.length === 0 ? 'No Ghostty windows open' : 'No matching windows'}</div>
          </div>
        ) : (
          <div ref={listCallbackRef} className="flex flex-col gap-1">
            {filtered.map((w, i) => (
              <WindowCard
                key={w.id}
                window={w}
                selected={i === selectedIndex}
                onHandle={handleCardRef}
              />
            ))}
          </div>
        )}

        <Footer />
      </div>
    </div>
  )
}
