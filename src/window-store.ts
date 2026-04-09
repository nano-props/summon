import { keyBy, isEqual } from 'lodash-es'
import { listWindows } from './ghostty.ts'
import type { TerminalWindow } from './ghostty.ts'

export interface WindowDto {
  id: string
  title: string
  cwd: string
  tabCount: number
  alias: string
}

const knownOrderSet = new Set<string>()
let knownOrderList: string[] = []
const aliases: Record<string, string> = {}
let cachedWindows: TerminalWindow[] = []
let lastSnapshot: { windows: TerminalWindow[]; aliases: Record<string, string> } | null = null

function stableSort(windows: TerminalWindow[]): TerminalWindow[] {
  const byId = keyBy(windows, 'id')
  for (const w of windows) {
    if (!knownOrderSet.has(w.id)) {
      knownOrderSet.add(w.id)
      knownOrderList.push(w.id)
    }
  }
  knownOrderList = knownOrderList.filter((id) => id in byId)
  knownOrderSet.clear()
  for (const id of knownOrderList) knownOrderSet.add(id)
  return knownOrderList.map((id) => byId[id])
}

function toDto(w: TerminalWindow): WindowDto {
  return {
    id: w.id,
    title: w.title,
    cwd: w.cwd,
    tabCount: w.tabCount,
    alias: aliases[w.id] || '',
  }
}

export async function refreshWindows(): Promise<void> {
  try {
    const latest = await listWindows()
    const sorted = stableSort(latest)
    const snapshot = { windows: sorted, aliases: { ...aliases } }
    if (!isEqual(snapshot, lastSnapshot)) {
      lastSnapshot = snapshot
      cachedWindows = sorted
    }
  } catch (e: any) {
    console.error('Refresh failed:', e.message)
  }
}

export function getWindowDtos(): WindowDto[] {
  return cachedWindows.map(toDto)
}

export function saveAlias(id: string, alias: string): void {
  if (!alias || !alias.trim()) {
    delete aliases[id]
  } else {
    aliases[id] = alias.trim()
  }
  lastSnapshot = null
}

export function reorder(orderedIds: string[]): void {
  knownOrderList = orderedIds.filter((id) => knownOrderSet.has(id))
  knownOrderSet.clear()
  for (const id of knownOrderList) knownOrderSet.add(id)
  lastSnapshot = null
}
