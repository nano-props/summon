import { useStore } from './store'
import { useTranslation } from 'react-i18next'
import { languages } from './i18n'
import { Sun, Moon, Monitor, MoreVertical, Power, Terminal, Pin, Keyboard, ExternalLink } from 'lucide-react'
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
import type { LanguageMode, ThemeMode } from './types'

export function Header() {
  const { t } = useTranslation()
  const theme = useStore((s) => s.theme)
  const setTheme = useStore((s) => s.setTheme)
  const language = useStore((s) => s.language)
  const setLanguage = useStore((s) => s.setLanguage)
  const pinned = useStore((s) => s.pinned)
  const togglePin = useStore((s) => s.togglePin)
  const shortcutEnabled = useStore((s) => s.shortcutEnabled)
  const toggleShortcut = useStore((s) => s.toggleShortcut)

  return (
    <div className="flex items-center gap-1 px-3 pt-3 pb-2 shrink-0">
      <h1 className="text-sm font-semibold tracking-tight flex items-center gap-1.5">
        Summon
        <span
          title={t('status.watching')}
          className="inline-block size-1.5 rounded-full bg-blue-700 shadow-[0_0_6px_rgba(29,78,216,0.6)] animate-[pulse-dot_2s_ease-in-out_infinite]"
        />
      </h1>
      <span className="flex-1" />
      <HeaderButton icon={<Terminal />} title={t('actions.newTerminal')} onClick={() => window.summonAPI.newTerminal()} />
      <HeaderButton
        icon={<Pin fill={pinned ? 'currentColor' : 'none'} />}
        title={pinned ? t('actions.unpin') : t('actions.pin')}
        active={pinned}
        onClick={togglePin}
      />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <HeaderButton icon={<MoreVertical />} title={t('actions.more')} />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-[200px]">
          <DropdownMenuLabel className="text-muted-foreground text-xs font-normal">{t('menu.appearance')}</DropdownMenuLabel>
          <DropdownMenuRadioGroup value={theme} onValueChange={(v) => setTheme(v as ThemeMode)}>
            <DropdownMenuRadioItem value="light"><Sun /> {t('theme.light')}</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="dark"><Moon /> {t('theme.dark')}</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="auto"><Monitor /> {t('theme.auto')}</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
          <DropdownMenuSeparator />
          <DropdownMenuLabel className="text-muted-foreground text-xs font-normal">{t('menu.language')}</DropdownMenuLabel>
          <DropdownMenuRadioGroup value={language} onValueChange={(v) => setLanguage(v as LanguageMode)}>
            <DropdownMenuRadioItem value="auto">{t('language.auto')}</DropdownMenuRadioItem>
            {languages.map((lang) => (
              <DropdownMenuRadioItem key={lang.value} value={lang.value}>
                {lang.label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
          <DropdownMenuSeparator />
          <DropdownMenuCheckboxItem
            checked={shortcutEnabled}
            onCheckedChange={toggleShortcut}
            onSelect={(e) => e.preventDefault()}
          >
            <Keyboard /> {t('menu.shortcut')}
            <DropdownMenuShortcut>⌥Space</DropdownMenuShortcut>
          </DropdownMenuCheckboxItem>
          <DropdownMenuItem onClick={() => window.summonAPI.openGitHub()}>
            <ExternalLink /> {t('menu.github')}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onClick={() => window.summonAPI.quit()}>
            <Power /> {t('actions.quit')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
