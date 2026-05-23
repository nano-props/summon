import { execa } from 'execa'
import QuickLRU from 'quick-lru'
import path from 'node:path'

export interface GitRepoInfo {
  root: string
  rootName: string
  isRoot: boolean
}

const CACHE_TTL_MS = 10_000
const CACHE_TARGET_ENTRIES = 200
const GIT_TIMEOUT_MS = 600
const cache = new QuickLRU<string, GitRepoInfo | false>({ maxSize: CACHE_TARGET_ENTRIES, maxAge: CACHE_TTL_MS })

function normalizePath(value: string): string {
  return path.resolve(value)
}

export async function gitRepoInfo(cwd: string): Promise<GitRepoInfo | null> {
  if (!cwd) return null
  const cached = cache.get(cwd)
  if (cached !== undefined) return cached || null

  try {
    const { stdout } = await execa('git', ['-C', cwd, 'rev-parse', '--show-toplevel'], { timeout: GIT_TIMEOUT_MS })
    const root = normalizePath(stdout.trim())
    const value = {
      root,
      rootName: path.basename(root) || root,
      isRoot: normalizePath(cwd) === root,
    }
    cache.set(cwd, value)
    return value
  } catch {
    cache.set(cwd, false)
    return null
  }
}
