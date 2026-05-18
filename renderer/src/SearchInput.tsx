import { useStore } from './store'
import { useTranslation } from 'react-i18next'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'

export function SearchInput({ inputRef }: { inputRef: React.RefObject<HTMLInputElement | null> }) {
  const { t } = useTranslation()
  const query = useStore((s) => s.query)
  const setQuery = useStore((s) => s.setQuery)

  return (
    <div className="relative mb-3">
      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
      <Input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t('search.placeholder')}
        className={`pl-8 bg-card dark:bg-card ${query ? 'pr-8' : ''} select-text`}
      />
      {query && (
        <button
          onClick={() => {
            setQuery('')
            inputRef.current?.focus()
          }}
          className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center p-1 rounded text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer"
          aria-label={t('actions.clearSearch')}
          tabIndex={-1}
        >
          <X className="size-3.5" />
        </button>
      )}
    </div>
  )
}
