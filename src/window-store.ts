import { isEqual } from 'lodash-es'
import { listWindows } from '#/src/ghostty.ts'
import type { TerminalWindow } from '#/src/ghostty.ts'

export interface WindowDto {
  key: string
  id: string
  terminalId: string
  title: string
  cwd: string
  tabCount: number
}

let cachedWindows: TerminalWindow[] = []
let lastSnapshot: TerminalWindow[] | null = null
let refreshInFlight: Promise<void> | null = null

function cloneWindows(windows: TerminalWindow[]): TerminalWindow[] {
  return windows.map((w) => ({ ...w }))
}

function toDto(w: TerminalWindow, index: number): WindowDto {
  return {
    key: encodeURIComponent(JSON.stringify([index, w.id, w.terminalId, w.title, w.cwd, w.tabCount])),
    id: w.id,
    terminalId: w.terminalId,
    title: w.title,
    cwd: w.cwd,
    tabCount: w.tabCount,
  }
}

export async function refreshWindows(): Promise<void> {
  if (refreshInFlight) return refreshInFlight

  refreshInFlight = (async () => {
    try {
      const latest = await listWindows()
      const snapshot = cloneWindows(latest)
      if (!isEqual(snapshot, lastSnapshot)) {
        lastSnapshot = snapshot
        cachedWindows = cloneWindows(latest)
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
