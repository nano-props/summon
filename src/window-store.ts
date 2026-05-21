import { isEqual } from 'lodash-es'
import { listWindows } from './ghostty.ts'
import type { TerminalWindow } from './ghostty.ts'

export interface WindowDto {
  id: string
  title: string
  cwd: string
  tabCount: number
}

let cachedWindows: TerminalWindow[] = []
let lastSnapshot: TerminalWindow[] | null = null

function cloneWindows(windows: TerminalWindow[]): TerminalWindow[] {
  return windows.map((w) => ({ ...w }))
}

function toDto(w: TerminalWindow): WindowDto {
  return {
    id: w.id,
    title: w.title,
    cwd: w.cwd,
    tabCount: w.tabCount,
  }
}

export async function refreshWindows(): Promise<void> {
  try {
    const latest = await listWindows()
    const snapshot = cloneWindows(latest)
    if (!isEqual(snapshot, lastSnapshot)) {
      lastSnapshot = snapshot
      cachedWindows = cloneWindows(latest)
    }
  } catch (e: any) {
    console.error('Refresh failed:', e.message)
  }
}

export function getWindowDtos(): WindowDto[] {
  return cachedWindows.map(toDto)
}

export function hasWindowId(id: string): boolean {
  return cachedWindows.some((w) => w.id === id)
}
