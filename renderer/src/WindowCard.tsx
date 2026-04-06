import { useRef, useState, useEffect } from 'react'
import { ReorderTwo } from '@ricons/ionicons5'
import { Icon } from './Icon'
import { useStore } from './store'
import type { WindowDTO } from './types'

function dirName(path: string): string {
  if (!path) return ''
  const last = path.split('/').pop()
  return last || path
}

export function WindowCard({ window: w }: { window: WindowDTO }) {
  const { savedId, activateWindow, saveAlias } = useStore()
  const inputRef = useRef<HTMLInputElement>(null)
  const [draft, setDraft] = useState(w.alias)
  const [focused, setFocused] = useState(false)

  // Sync external alias changes, but only when the input is not focused
  useEffect(() => {
    if (!focused) setDraft(w.alias)
  }, [w.alias, focused])

  const handleClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).tagName !== 'INPUT') {
      activateWindow(w.id)
    }
  }

  const handleBlur = () => {
    setFocused(false)
    const alias = draft.trim()
    saveAlias(w.id, alias)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      inputRef.current?.blur()
    }
  }

  const isSaved = savedId === w.id

  return (
    <div
      className="bg-surface border border-border rounded-[10px] px-4 py-3.5 flex flex-wrap items-center gap-x-3.5 gap-y-2.5 cursor-pointer transition-[background,border-color,transform] duration-150 hover:bg-surface-hover hover:translate-x-0.5"
      onClick={handleClick}
      data-id={w.id}
    >
      <div
        className="drag-handle flex items-center cursor-grab text-text-muted transition-opacity duration-150 hover:text-text-dim active:cursor-grabbing shrink-0 -ml-1 mr-0.5"
        onClick={(e) => e.stopPropagation()}
      >
        <Icon size={14} className="pointer-events-none"><ReorderTwo /></Icon>
      </div>
      <div className="flex-1 min-w-[200px]">
        <div className="font-semibold text-sm text-text truncate">{w.title || '(untitled)'}</div>
        <div className="text-xs text-text-dim mt-0.5 truncate">
          <span>{dirName(w.cwd)}</span>
          {w.tabCount > 1 && <span className="text-text-muted ml-1.5">{w.tabCount} tabs</span>}
        </div>
      </div>
      <input
        ref={inputRef}
        type="text"
        className={`w-[140px] shrink-0 bg-transparent border rounded-md px-3 py-2 text-sm font-medium text-accent outline-none ml-auto text-right transition-[background,border-color,box-shadow,color] duration-200 placeholder:text-text-muted placeholder:opacity-30 placeholder:font-normal hover:bg-bg focus:bg-bg focus:border-accent focus:shadow-[0_0_0_2px_var(--color-accent-dim)] focus:text-text focus:font-normal focus:text-left select-text ${isSaved ? 'border-green shadow-[0_0_0_2px_var(--color-green-dim)]' : 'border-transparent'}`}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        onClick={(e) => e.stopPropagation()}
        placeholder="alias"
        spellCheck={false}
      />
    </div>
  )
}
