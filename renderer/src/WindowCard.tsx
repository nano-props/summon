import { useRef, useState, useEffect } from 'react'
import { GripVertical } from 'lucide-react'
import { useStore } from './store'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import type { WindowDTO } from './types'

export interface WindowCardHandle {
  focusInput: () => void
  isInputFocused: () => boolean
}

interface WindowCardProps {
  window: WindowDTO
  selected?: boolean
  shortcut?: string | null
  onHandle?: (id: string, handle: WindowCardHandle | null) => void
}

export function WindowCard({ window: w, selected, shortcut, onHandle }: WindowCardProps) {
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
  const dirName = w.cwd ? w.cwd.split('/').pop() || w.cwd : '(no path)'

  return (
    <div
      className={cn(
        'relative group bg-card text-card-foreground border border-border rounded-lg px-3 py-2 flex items-center gap-2 cursor-pointer transition-colors',
        'hover:bg-accent/60 hover:border-accent-foreground/10',
        selected && 'border-ring bg-accent ring-2 ring-ring/30',
      )}
      onClick={handleClick}
      data-id={w.id}
    >
      <div
        className="drag-handle flex items-center cursor-grab text-muted-foreground/60 opacity-30 group-hover:opacity-100 transition-opacity hover:text-foreground active:cursor-grabbing shrink-0 -ml-1"
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical className="size-4 pointer-events-none" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="font-medium text-sm truncate leading-tight">{dirName}</span>
          {w.tabCount > 1 && (
            <span className="shrink-0 text-[10px] font-medium text-secondary-foreground bg-secondary rounded px-1.5 py-0.5 leading-none">
              {w.tabCount}
            </span>
          )}
        </div>
        <div className="text-xs text-muted-foreground mt-0.5 truncate leading-tight">
          {w.title || '(untitled)'}
        </div>
      </div>

      <Input
        ref={inputRef}
        type="text"
        className={cn(
          'h-7 w-[96px] shrink-0 text-xs px-2 text-right',
          'border-transparent bg-transparent shadow-none placeholder:text-muted-foreground/50',
          'hover:bg-background hover:border-input',
          'focus-visible:text-left focus-visible:bg-background',
          isSaved && 'border-emerald-500 ring-2 ring-emerald-500/30',
        )}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        onClick={(e) => e.stopPropagation()}
        placeholder="alias"
        spellCheck={false}
      />

      {shortcut && (
        <kbd className="shrink-0 text-[10px] font-mono text-muted-foreground/70 bg-muted/60 border border-border rounded px-1.5 py-0.5 leading-none pointer-events-none">
          ⌘{shortcut}
        </kbd>
      )}
    </div>
  )
}
