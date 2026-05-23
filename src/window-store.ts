import { isEqual } from 'lodash-es'
import pLimit from 'p-limit'
import { gitRepoInfo } from '#/src/git.ts'
import { listWindows } from '#/src/ghostty.ts'
import type { TerminalWindow } from '#/src/ghostty.ts'
import type { GitRepoInfo, WindowDto, WindowsState } from '#/src/shared/contracts.ts'

interface CachedWindow extends TerminalWindow {
  gitRepo: GitRepoInfo | null
}

type WindowsListener = (state: WindowsState) => void

let currentState: WindowsState = { version: 0, windows: [] }
let refreshInFlight: Promise<WindowsState> | null = null
const enrichGitRepo = pLimit(4)
const listeners = new Set<WindowsListener>()

function cloneWindow(w: WindowDto): WindowDto {
  return { ...w, gitRepo: w.gitRepo ? { ...w.gitRepo } : null }
}

function cloneState(state: WindowsState): WindowsState {
  return { version: state.version, windows: state.windows.map(cloneWindow) }
}

async function withGitRepo(w: TerminalWindow): Promise<CachedWindow> {
  return { ...w, gitRepo: await gitRepoInfo(w.cwd) }
}

function toDto(w: CachedWindow): WindowDto {
  return {
    id: w.id,
    terminalId: w.terminalId,
    title: w.title,
    cwd: w.cwd,
    tabCount: w.tabCount,
    gitRepo: w.gitRepo,
  }
}

function publish(state: WindowsState): void {
  for (const listener of listeners) {
    try {
      listener(cloneState(state))
    } catch (e) {
      console.error('Window listener failed:', e instanceof Error ? e.message : e)
    }
  }
}

export function subscribeWindows(listener: WindowsListener): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export async function refreshWindows(): Promise<WindowsState> {
  if (refreshInFlight) return refreshInFlight

  refreshInFlight = (async () => {
    try {
      const latest = await listWindows()
      const enriched = await Promise.all(latest.map((w) => enrichGitRepo(() => withGitRepo(w))))
      const nextWindows = enriched.map(toDto)
      if (!isEqual(nextWindows, currentState.windows)) {
        const nextState: WindowsState = { version: currentState.version + 1, windows: nextWindows }
        currentState = cloneState(nextState)
        publish(currentState)
      }
    } catch (e) {
      console.error('Refresh failed:', e instanceof Error ? e.message : e)
    } finally {
      refreshInFlight = null
    }
    return getWindowsState()
  })()

  return refreshInFlight
}

export function getWindowsState(): WindowsState {
  return cloneState(currentState)
}

export function hasWindowId(id: string): boolean {
  return currentState.windows.some((w) => w.id === id)
}
