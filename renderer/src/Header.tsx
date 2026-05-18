import { useStore } from './store'
import { Sun, Moon, Monitor, MoreVertical, Power, ChevronUp, Terminal, Pin, Keyboard } from 'lucide-react'
import { HeaderButton } from './HeaderButton'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
} from '@/components/ui/dropdown-menu'
import type { ThemeMode } from './types'

export function Header() {
  const { theme, setTheme, pinned, togglePin, shortcutEnabled, toggleShortcut } = useStore()

  return (
    <div className="flex items-center gap-1 px-3 pt-3 pb-2 shrink-0">
      <h1 className="text-sm font-semibold tracking-tight flex items-center gap-1.5">
        Summon
        <span
          title="Watching Ghostty windows"
          className="inline-block size-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.6)] animate-[pulse-dot_2s_ease-in-out_infinite]"
        />
      </h1>
      <span className="flex-1" />
      <HeaderButton icon={<Terminal />} title="New Terminal" onClick={() => window.summonAPI.newTerminal()} />
      <HeaderButton
        icon={<Pin fill={pinned ? 'currentColor' : 'none'} />}
        title={pinned ? 'Unpin (auto-hide)' : 'Pin (stay open)'}
        active={pinned}
        onClick={togglePin}
      />
      <HeaderButton icon={<ChevronUp />} title="Hide (Esc)" onClick={() => window.summonAPI.hidePanel()} />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <HeaderButton icon={<MoreVertical />} title="More" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-[200px]">
          <DropdownMenuLabel className="text-muted-foreground text-xs font-normal">Appearance</DropdownMenuLabel>
          <DropdownMenuRadioGroup value={theme} onValueChange={(v) => setTheme(v as ThemeMode)}>
            <DropdownMenuRadioItem value="light"><Sun /> Light</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="dark"><Moon /> Dark</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="auto"><Monitor /> Auto</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
          <DropdownMenuSeparator />
          <DropdownMenuCheckboxItem
            checked={shortcutEnabled}
            onCheckedChange={toggleShortcut}
            onSelect={(e) => e.preventDefault()}
          >
            <Keyboard /> Shortcut
            <DropdownMenuShortcut>⌥Space</DropdownMenuShortcut>
          </DropdownMenuCheckboxItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onClick={() => window.summonAPI.quit()}>
            <Power /> Quit Summon
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
