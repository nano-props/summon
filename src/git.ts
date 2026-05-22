import { execa } from 'execa'
import path from 'node:path'

export interface GitRepoInfo {
  root: string
  rootName: string
  isRoot: boolean
}

interface CacheEntry {
  value: GitRepoInfo | null
  expiresAt: number
}

const CACHE_TTL_MS = 10_000
const GIT_TIMEOUT_MS = 600
const cache = new Map<string, CacheEntry>()

function normalizePath(value: string): string {
  return path.resolve(value)
}

export async function gitRepoInfo(cwd: string): Promise<GitRepoInfo | null> {
  if (!cwd) return null
  const now = Date.now()
  const cached = cache.get(cwd)
  if (cached && cached.expiresAt > now) return cached.value

  try {
    const { stdout } = await execa('git', ['-C', cwd, 'rev-parse', '--show-toplevel'], { timeout: GIT_TIMEOUT_MS })
    const root = normalizePath(stdout.trim())
    const value = {
      root,
      rootName: path.basename(root) || root,
      isRoot: normalizePath(cwd) === root,
    }
    cache.set(cwd, { value, expiresAt: now + CACHE_TTL_MS })
    return value
  } catch {
    cache.set(cwd, { value: null, expiresAt: now + CACHE_TTL_MS })
    return null
  }
}
