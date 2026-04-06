import { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import Sortable from 'sortablejs'
import { some } from 'lodash-es'
import { useStore } from './store'
import { SearchOutline, SunnyOutline, MoonOutline, AppsOutline, EllipsisVertical, PowerOutline, ChevronUpOutline, TerminalOutline } from '@ricons/ionicons5'
import { Icon } from './Icon'
import { WindowCard } from './WindowCard'

export function App() {
  const { version, windows, query, dark, setQuery, toggleTheme, fetchWindows, activateWindow, reorderWindows } = useStore()
  const searchRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const sortableRef = useRef<Sortable | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchWindows()
    const timer = setInterval(fetchWindows, 2000)
    return () => clearInterval(timer)
  }, [fetchWindows])

  useEffect(() => {
    const onFocus = () => searchRef.current?.focus()
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') window.summonAPI.hidePanel()
    }
    window.addEventListener('focus', onFocus)
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('focus', onFocus)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [])

  useEffect(() => {
    if (!menuOpen) return
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [menuOpen])

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim()
    if (!q) return windows
    const fields = ['title', 'cwd', 'alias', 'displayLabel'] as const
    return windows.filter((w) => some(fields, (f) => w[f].toLowerCase().includes(q)))
  }, [windows, query])

  const reorderRef = useRef(reorderWindows)
  reorderRef.current = reorderWindows
  const filteredRef = useRef(filtered)
  filteredRef.current = filtered
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
        // Reorder within the filtered subset
        const filteredIds = filteredRef.current.map((w) => w.id)
        const [moved] = filteredIds.splice(evt.oldIndex, 1)
        filteredIds.splice(evt.newIndex, 0, moved)
        // Merge back: walk the full list, replacing filtered items in new order
        const filteredSet = new Set(filteredIds)
        let fi = 0
        const fullIds = windowsRef.current.map((w) => (filteredSet.has(w.id) ? filteredIds[fi++] : w.id))
        reorderRef.current(fullIds)
      },
    })
  }, [])

  return (
    <div className="h-screen flex flex-col rounded-xl overflow-hidden select-none">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-5 pb-3 shrink-0">
        <h1 className="text-[1.4rem] font-bold tracking-tight text-accent">Summon</h1>
        <span className="text-[0.7rem] text-text-muted tracking-wider uppercase">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-green mr-1.5 shadow-[0_0_8px_rgba(74,222,128,0.4)] animate-[pulse-dot_2s_ease-in-out_infinite]" />
          watching
        </span>
        <span className="flex-1" />
        <button
          className="bg-surface border border-border rounded-lg w-9 h-9 flex items-center justify-center cursor-pointer text-text-dim shrink-0 transition-all duration-200 hover:bg-surface-hover hover:text-text"
          onClick={() => window.summonAPI.newTerminal()}
          title="New Terminal"
        >
          <Icon size={16}><TerminalOutline /></Icon>
        </button>
        <button
          className="bg-surface border border-border rounded-lg w-9 h-9 flex items-center justify-center cursor-pointer text-text-dim shrink-0 transition-all duration-200 hover:bg-surface-hover hover:text-text"
          onClick={() => window.summonAPI.hidePanel()}
          title="Hide (Esc)"
        >
          <Icon size={16}><ChevronUpOutline /></Icon>
        </button>
        <div className="relative" ref={menuRef}>
          <button
            className="bg-surface border border-border rounded-lg w-9 h-9 flex items-center justify-center cursor-pointer text-text-dim shrink-0 transition-all duration-200 hover:bg-surface-hover hover:text-text"
            onClick={() => setMenuOpen(!menuOpen)}
            title="More"
          >
            <Icon size={16}><EllipsisVertical /></Icon>
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-11 bg-surface border border-border rounded-lg shadow-lg py-1 min-w-[160px] z-50">
              <button
                className="w-full px-4 py-2 text-left text-sm text-text hover:bg-surface-hover flex items-center gap-2.5 cursor-pointer"
                onClick={() => {
                  toggleTheme()
                  setMenuOpen(false)
                }}
              >
                {dark ? <Icon size={14}><SunnyOutline /></Icon> : <Icon size={14}><MoonOutline /></Icon>}
                {dark ? 'Light mode' : 'Dark mode'}
              </button>
              <div className="h-px bg-border mx-2 my-1" />
              <button
                className="w-full px-4 py-2 text-left text-sm text-text hover:bg-surface-hover flex items-center gap-2.5 cursor-pointer hover:text-red-500"
                onClick={() => window.summonAPI.quit()}
              >
                <Icon size={14}><PowerOutline /></Icon>
                Quit Summon
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-5 pb-5">
        {/* Search */}
        <div className="relative mb-4">
          <Icon
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
          ><SearchOutline /></Icon>
          <input
            ref={searchRef}
            type="text"
            className="w-full bg-surface border border-border rounded-[10px] py-3 pl-10 pr-3.5 text-[0.85rem] text-text outline-none transition-[border-color,box-shadow] duration-200 placeholder:text-text-muted focus:border-accent focus:shadow-[0_0_0_3px_var(--color-accent-dim)] select-text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && filtered.length > 0) {
                activateWindow(filtered[0].id)
              }
            }}
            placeholder="Filter windows..."
          />
        </div>

        {/* Window list */}
        {filtered.length === 0 ? (
          <div className="text-center py-12 px-5 text-text-muted text-[0.85rem]">
            <Icon size={32} className="inline-block mb-3 opacity-40"><AppsOutline /></Icon>
            <div>{windows.length === 0 ? 'No Ghostty windows open' : 'No matching windows'}</div>
          </div>
        ) : (
          <div ref={listCallbackRef} className="flex flex-col gap-1">
            {filtered.map((w) => <WindowCard key={w.id} window={w} />)}
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 px-0.5 flex justify-between items-center text-[0.68rem] text-text-muted">
          {version && <span>v{version}</span>}
          <span className="flex-1" />
          <span>
            <kbd className="inline-block bg-surface border border-border rounded px-1.5 py-px text-[0.65rem] mx-0.5">
              ⌥ + S
            </kbd>{' '}
            Toggle |{' '}
            <kbd className="inline-block bg-surface border border-border rounded px-1.5 py-px text-[0.65rem] mx-0.5">
              Esc
            </kbd>{' '}
            Hide
          </span>
        </div>
      </div>
    </div>
  )
}
