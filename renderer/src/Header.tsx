export function Header() {
  return (
    <div className="h-8 shrink-0 flex items-center justify-between gap-3 px-4 border-b border-separator bg-list text-tertiary-foreground whitespace-nowrap">
      <span className="text-[11px] font-medium text-muted-foreground">Summon</span>
      <div className="flex items-center justify-end gap-2 text-[10px]">
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
