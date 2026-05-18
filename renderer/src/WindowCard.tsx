import { useRef, useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { GripVertical } from 'lucide-react'
import { useStore } from './store'
import { pressItem, releaseItem } from './flash-item'
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
  onHandle?: (id: string, handle: WindowCardHandle | null) => void
}

export function WindowCard({ window: w, selected, onHandle }: WindowCardProps) {
  const { t } = useTranslation()
  const savedId = useStore((s) => s.savedId)
  const activateWindow = useStore((s) => s.activateWindow)
  const saveAlias = useStore((s) => s.saveAlias)
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

  const handlePointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).tagName !== 'INPUT') {
      pressItem(w.id)
    }
  }

  const handlePointerRelease = () => {
    releaseItem(w.id)
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
  const dirName = w.cwd ? w.cwd.split('/').pop() || w.cwd : t('window.noPath')
  const hasAlias = draft.trim().length > 0
  const showAlias = focused || hasAlias

  return (
    <div
      className={cn(
        'relative group bg-card text-card-foreground border-b border-border px-3 py-2 flex items-center gap-2 cursor-pointer transition-colors',
        'hover:bg-accent/60',
        'first:rounded-t-lg last:rounded-b-lg last:border-b-0',
        selected && 'bg-accent',
      )}
      onClick={handleClick}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerRelease}
      onPointerCancel={handlePointerRelease}
      onPointerLeave={handlePointerRelease}
      data-id={w.id}
    >
      <div
        className="drag-handle flex items-center cursor-grab text-muted-foreground/60 opacity-30 group-hover:opacity-100 transition-opacity hover:text-foreground active:cursor-grabbing shrink-0 -ml-1"
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <GripVertical className="size-4 pointer-events-none" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 min-w-0 pr-20">
          <span className="font-medium text-sm truncate leading-tight">{dirName}</span>
          {w.tabCount > 1 && (
            <span className="shrink-0 text-[10px] font-medium text-secondary-foreground bg-secondary rounded px-1.5 py-0.5 leading-none">
              {w.tabCount}
            </span>
          )}
        </div>
        <div className="text-xs text-muted-foreground mt-0.5 truncate leading-tight">{w.title || t('window.untitled')}</div>
      </div>

      <Input
        ref={inputRef}
        type="text"
        className={cn(
          'absolute top-1.5 right-2 h-5 w-20 text-[11px] px-1.5 text-right',
          'border-transparent bg-transparent shadow-none',
          'opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity',
          'hover:bg-background hover:border-input',
          'focus-visible:text-left focus-visible:bg-background',
          showAlias && 'opacity-100',
          isSaved && 'border-emerald-500 ring-2 ring-emerald-500/30',
        )}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        onClick={(e) => e.stopPropagation()}
        spellCheck={false}
      />
    </div>
  )
}
