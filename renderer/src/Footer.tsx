import { useStore } from './store'

export function Footer() {
  const version = useStore((s) => s.version)

  return (
    <div className="mt-6 text-center text-[10px] text-text-muted">
      {version && <span>v{version}</span>}
    </div>
  )
}
