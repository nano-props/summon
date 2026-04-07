import { useEffect, useRef, useState } from 'react'
import { useStore } from './store'
import { SunnyOutline, MoonOutline, EllipsisVertical, PowerOutline, ChevronUpOutline, TerminalOutline } from '@ricons/ionicons5'
import { Icon } from './Icon'
import { HeaderButton } from './HeaderButton'

export function Header() {
  const { dark, toggleTheme } = useStore()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!menuOpen) return
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [menuOpen])

  return (
    <div className="flex items-center gap-3 px-5 pt-5 pb-3 shrink-0">
      <h1 className="text-[21px] font-bold tracking-tight text-accent">Summon</h1>
      <span className="text-[10px] text-text-muted tracking-wider uppercase">
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-green mr-1.5 shadow-[0_0_8px_rgba(74,222,128,0.4)] animate-[pulse-dot_2s_ease-in-out_infinite]" />
        watching
      </span>
      <span className="flex-1" />
      <HeaderButton icon={<TerminalOutline />} title="New Terminal" onClick={() => window.summonAPI.newTerminal()} />
      <HeaderButton icon={<ChevronUpOutline />} title="Hide (Esc)" onClick={() => window.summonAPI.hidePanel()} />
      <div className="relative" ref={menuRef}>
        <HeaderButton icon={<EllipsisVertical />} title="More" onClick={() => setMenuOpen(!menuOpen)} />
        {menuOpen && (
          <div className="absolute right-0 top-11 bg-surface border border-border rounded-lg shadow-lg py-1 min-w-[160px] z-50">
            <button
              className="w-full px-4 py-2 text-left text-[13px] text-text hover:bg-surface-hover flex items-center gap-2.5 cursor-pointer"
              onClick={() => {
                toggleTheme()
                setMenuOpen(false)
              }}
              tabIndex={-1}
            >
              {dark ? <Icon size={14}><SunnyOutline /></Icon> : <Icon size={14}><MoonOutline /></Icon>}
              {dark ? 'Light mode' : 'Dark mode'}
            </button>
            <div className="h-px bg-border mx-2 my-1" />
            <button
              className="w-full px-4 py-2 text-left text-[13px] text-text hover:bg-surface-hover flex items-center gap-2.5 cursor-pointer hover:text-red-500"
              onClick={() => window.summonAPI.quit()}
              tabIndex={-1}
            >
              <Icon size={14}><PowerOutline /></Icon>
              Quit Summon
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
