import { useStore } from './store'

export function Footer() {
  const version = useStore((s) => s.version)

  return (
    <div className="mt-6 px-0.5 flex justify-between items-center text-[10px] text-text-muted">
      {version && <span>v{version}</span>}
      <span className="flex-1" />
      <span>
        <kbd className="inline-block bg-surface border border-border rounded px-1.5 py-px text-[10px] mx-0.5">
          ⌥Space
        </kbd>{' '}
        Toggle |{' '}
        <kbd className="inline-block bg-surface border border-border rounded px-1.5 py-px text-[10px] mx-0.5">
          Tab
        </kbd>{' '}
        Edit alias |{' '}
        <kbd className="inline-block bg-surface border border-border rounded px-1.5 py-px text-[10px] mx-0.5">
          Esc
        </kbd>{' '}
        Hide
      </span>
    </div>
  )
}
