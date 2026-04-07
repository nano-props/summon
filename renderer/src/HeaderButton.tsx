import type { ReactElement } from 'react'
import { Icon } from './Icon'

export function HeaderButton({ icon, title, onClick }: { icon: ReactElement; title: string; onClick: () => void }) {
  return (
    <button
      className="bg-surface border border-border rounded-lg w-9 h-9 flex items-center justify-center cursor-pointer text-text-dim shrink-0 transition-all duration-200 hover:bg-surface-hover hover:text-text"
      onClick={onClick}
      title={title}
      tabIndex={-1}
    >
      <Icon size={16}>{icon}</Icon>
    </button>
  )
}
