export function Header() {
  return (
    <div className="h-7 shrink-0 flex items-center justify-between gap-3 px-4 text-tertiary-foreground whitespace-nowrap">
      <span className="text-[10px] font-medium opacity-80">Summon</span>
      <div className="flex items-center justify-end gap-2 text-[10px] opacity-55">
        <span>↑↓ / Tab</span>
        <span>·</span>
        <span>↵</span>
        <span>·</span>
        <span>⌘1–9</span>
        <span>·</span>
        <span>⌘N</span>
      </div>
    </div>
  )
}
