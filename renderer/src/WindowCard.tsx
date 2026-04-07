import { useRef, useState, useEffect } from 'react'
import { ReorderTwo } from '@ricons/ionicons5'
import { Icon } from './Icon'
import { useStore } from './store'
import type { WindowDTO } from './types'

export interface WindowCardHandle {
  focusInput: () => void
  isInputFocused: () => boolean
}

export function WindowCard({ window: w, selected, onHandle }: { window: WindowDTO; selected?: boolean; onHandle?: (id: string, handle: WindowCardHandle | null) => void }) {
  const { savedId, activateWindow, saveAlias } = useStore()
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handle: WindowCardHandle = {
      focusInput: () => inputRef.current?.focus(),
      isInputFocused: () => document.activeElement === inputRef.current,
    }
    onHandle?.(w.id, handle)
    return () => onHandle?.(w.id, null)
  }, [w.id, onHandle])
  const [draft, setDraft] = useState(w.alias)
  const [focused, setFocused] = useState(false)

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
    if (alias !== w.alias) saveAlias(w.id, alias)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === 'Escape') {
      e.preventDefault()
      inputRef.current?.blur()
    }
  }

  const isSaved = savedId === w.id

  return (
    <div
      className={`bg-surface border rounded-[10px] px-4 py-3.5 flex flex-wrap items-center gap-x-3.5 gap-y-2.5 cursor-pointer transition-[background,border-color,transform] duration-150 hover:bg-surface-hover hover:translate-x-0.5 ${selected ? 'border-accent bg-surface-hover' : 'border-border'}`}
      onClick={handleClick}
      data-id={w.id}
    >
      <div
        className="drag-handle flex items-center cursor-grab text-text-muted opacity-0 transition-opacity duration-150 hover:text-text-dim active:cursor-grabbing shrink-0 -ml-1 mr-0.5"
        onClick={(e) => e.stopPropagation()}
      >
        <Icon size={14} className="pointer-events-none"><ReorderTwo /></Icon>
      </div>
      <div className="flex-1 min-w-[200px]">
        <div className="font-semibold text-[14px] text-text truncate">{w.title || '(untitled)'}</div>
        <div className="text-[11px] text-text-muted mt-0.5 truncate">
          {w.cwd && <span>{w.cwd.split('/').pop() || w.cwd}</span>}
          {w.tabCount > 1 && <span className="text-text-muted ml-1.5">{w.tabCount} tabs</span>}
        </div>
      </div>
      <input
        ref={inputRef}
        type="text"
        className={`w-[140px] shrink-0 bg-transparent border rounded-md px-3 py-2 text-[13px] font-medium text-accent outline-none ml-auto text-right transition-[background,border-color,box-shadow,color] duration-200 placeholder:text-text-muted placeholder:opacity-30 placeholder:font-normal hover:bg-bg focus:bg-bg focus:border-accent focus:shadow-[0_0_0_2px_var(--color-accent-dim)] focus:text-text focus:font-normal focus:text-left select-text ${isSaved ? 'border-green shadow-[0_0_0_2px_var(--color-green-dim)]' : 'border-transparent'}`}
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
