import { isEqual } from 'lodash-es'
import { gitRepoInfo, type GitRepoInfo } from '#/src/git.ts'
import { listWindows } from '#/src/ghostty.ts'
import type { TerminalWindow } from '#/src/ghostty.ts'

export interface WindowDto {
  key: string
  id: string
  terminalId: string
  title: string
  cwd: string
  tabCount: number
  gitRepo: GitRepoInfo | null
}

interface CachedWindow extends TerminalWindow {
  gitRepo: GitRepoInfo | null
}

let cachedWindows: CachedWindow[] = []
let lastSnapshot: CachedWindow[] | null = null
let refreshInFlight: Promise<void> | null = null

function cloneWindows(windows: CachedWindow[]): CachedWindow[] {
  return windows.map((w) => ({ ...w, gitRepo: w.gitRepo ? { ...w.gitRepo } : null }))
}

async function withGitRepo(w: TerminalWindow): Promise<CachedWindow> {
  return { ...w, gitRepo: await gitRepoInfo(w.cwd) }
}

function toDto(w: CachedWindow, index: number): WindowDto {
  return {
    key: encodeURIComponent(JSON.stringify([index, w.id, w.terminalId, w.title, w.cwd, w.tabCount])),
    id: w.id,
    terminalId: w.terminalId,
    title: w.title,
    cwd: w.cwd,
    tabCount: w.tabCount,
    gitRepo: w.gitRepo,
  }
}

export async function refreshWindows(): Promise<void> {
  if (refreshInFlight) return refreshInFlight

  refreshInFlight = (async () => {
    try {
      const latest = await listWindows()
      const enriched = await Promise.all(latest.map(withGitRepo))
      const snapshot = cloneWindows(enriched)
      if (!isEqual(snapshot, lastSnapshot)) {
        lastSnapshot = snapshot
        cachedWindows = cloneWindows(enriched)
      }
    } catch (e) {
      console.error('Refresh failed:', e instanceof Error ? e.message : e)
    } finally {
      refreshInFlight = null
    }
  })()

  return refreshInFlight
}

export function getWindowDtos(): WindowDto[] {
  return cachedWindows.map(toDto)
}

export function hasWindowId(id: string): boolean {
  return cachedWindows.some((w) => w.id === id)
}
