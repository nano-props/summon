import { useStore } from './store'

export function Footer() {
  const version = useStore((s) => s.version)

  return (
    <div className="text-right text-[10px] text-muted-foreground/70 pt-2">
      {version && (
        <span>
          v{version}
          {__GIT_HASH__ && ` · ${__GIT_HASH__}`}
        </span>
      )}
    </div>
  )
}
