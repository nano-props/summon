import { useTranslation } from 'react-i18next'
import { GitBranch } from 'lucide-react'
import { pressItem, releaseItem } from '#/renderer/src/flash-item.ts'
import { cn } from '#/renderer/src/lib/utils.ts'
import { useStore } from '#/renderer/src/store.ts'
import type { WindowDto } from '#/src/shared/contracts.ts'

interface WindowCardProps {
  window: WindowDto
  index: number
  selected?: boolean
}

export function WindowCard({ window: w, index, selected }: WindowCardProps) {
  const { t } = useTranslation()
  const activateWindow = useStore((s) => s.activateWindow)
  const setSelectedIndex = useStore((s) => s.setSelectedIndex)

  const handleClick = () => {
    void activateWindow(w)
  }

  const handlePointerDown = () => {
    pressItem(w.id)
  }

  const handlePointerRelease = () => {
    releaseItem(w.id)
  }

  const dirName = w.cwd ? w.cwd.split('/').pop() || w.cwd : t('window.no-path')
  const shortcut = index < 9 ? `⌘${index + 1}` : `${index + 1}`
  const gitLabel = w.gitRepo && !w.gitRepo.isRoot ? w.gitRepo.rootName : null

  return (
    <button
      type="button"
      className={cn(
        'relative group w-full appearance-none bg-row text-left text-card-foreground px-5 py-2 flex items-center gap-3 cursor-pointer transition-colors backdrop-blur-sm outline-none shadow-[inset_0_-1px_0_var(--separator)]',
        'hover:bg-row-hover',
        'last:shadow-none',
        selected && 'bg-row-selected shadow-none hover:bg-row-selected-hover',
      )}
      onClick={handleClick}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerRelease}
      onPointerCancel={handlePointerRelease}
      onPointerLeave={handlePointerRelease}
      onFocus={() => setSelectedIndex(index)}
      data-id={w.id}
      data-window-row
      aria-selected={selected}
      tabIndex={selected ? 0 : -1}
    >
      <span
        className={cn(
          'shrink-0 w-8 h-5 rounded-md inline-flex items-center justify-center text-[10px] font-medium tracking-tight transition-colors',
          selected ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground',
        )}
      >
        {shortcut}
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="font-medium text-sm truncate leading-tight">{dirName}</span>
          {w.gitRepo && (
            <span
              className="shrink min-w-0 inline-flex items-center gap-1 text-[10px] font-medium text-tertiary-foreground bg-secondary rounded px-1.5 py-0.5 leading-none"
              title={w.gitRepo.root}
            >
              <GitBranch className="size-3 shrink-0" aria-hidden="true" />
              {gitLabel && <span className="truncate">{gitLabel}</span>}
            </span>
          )}
          {w.tabCount > 1 && (
            <span className="shrink-0 text-[10px] font-medium text-secondary-foreground bg-secondary rounded px-1.5 py-0.5 leading-none">
              {w.tabCount}
            </span>
          )}
        </div>
        <div className="text-xs text-muted-foreground mt-0.5 truncate leading-tight">
          {w.title || t('window.untitled')}
        </div>
      </div>
    </button>
  )
}
