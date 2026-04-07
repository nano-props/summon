import { useStore } from './store'
import { SearchOutline, CloseOutline } from '@ricons/ionicons5'
import { Icon } from './Icon'

export function SearchInput({ inputRef }: { inputRef: React.RefObject<HTMLInputElement | null> }) {
  const { query, setQuery } = useStore()

  return (
    <div className="relative mb-4">
      <Icon
        size={16}
        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
      ><SearchOutline /></Icon>
      <input
        ref={inputRef}
        type="text"
        className={`w-full bg-surface border border-border rounded-[10px] py-3 pl-10 ${query ? 'pr-9' : 'pr-3.5'} text-[13px] text-text outline-none transition-[border-color,box-shadow] duration-200 placeholder:text-text-muted focus:border-accent focus:shadow-[0_0_0_3px_var(--color-accent-dim)] select-text`}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Filter windows..."
      />
      {query && (
        <button
          onClick={() => { setQuery(''); inputRef.current?.focus() }}
          className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center p-0 bg-transparent border-none text-text-muted hover:text-text transition-colors duration-150 cursor-pointer"
          aria-label="Clear search"
          tabIndex={-1}
        >
          <Icon size={14}><CloseOutline /></Icon>
        </button>
      )}
    </div>
  )
}
