#!/usr/bin/env bun
import { spawnSync } from 'node:child_process'
import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import type { ParseArgsConfig } from 'node:util'
import { parseArgs } from 'node:util'

const APP_NAME = 'Summon'
const DEST = path.join(os.homedir(), 'Applications')
const NPM_MIRROR_ELECTRON = 'https://npmmirror.com/mirrors/electron/'
const NPM_MIRROR_BINARIES = 'https://npmmirror.com/mirrors/electron-builder-binaries/'

const repoRoot = path.resolve(import.meta.dirname)
process.chdir(repoRoot)

const USAGE = `Usage: ./install.ts [options]

Fast-reinstall Summon into ~/Applications. Defaults to the fast path; pass
--full to run typecheck before packaging.

  --clean                Clear electron / electron-builder caches before building.
  --npmmirror            Route electron + electron-builder-binaries downloads
                         through npmmirror.
  --mirror=URL           Electron download mirror (overrides --npmmirror).
  --binaries-mirror=URL  electron-builder-binaries mirror (overrides --npmmirror).
  --full                 Run the full typecheck step before packaging.
  -h, --help             Show this help.

Mirror env vars take a URL; leave unset/empty to disable:
  ELECTRON_MIRROR, ELECTRON_BUILDER_BINARIES_MIRROR
`

const options = {
  clean: { type: 'boolean' as const },
  npmmirror: { type: 'boolean' as const },
  mirror: { type: 'string' as const },
  'binaries-mirror': { type: 'string' as const },
  full: { type: 'boolean' as const },
  help: { type: 'boolean' as const, short: 'h' as const },
} satisfies ParseArgsConfig['options']

type Values = {
  clean?: boolean
  npmmirror?: boolean
  mirror?: string
  'binaries-mirror'?: string
  full?: boolean
  help?: boolean
}

let values: Values
try {
  values = parseArgs({ options, strict: true }).values as Values
} catch (err) {
  const msg = err instanceof Error ? err.message : String(err)
  process.stderr.write(`${msg}\n\n${USAGE}`)
  process.exit(2)
}

if (values.help) {
  process.stdout.write(USAGE)
  process.exit(0)
}

const env: NodeJS.ProcessEnv = { ...process.env }
if (values.npmmirror) {
  env.ELECTRON_MIRROR = NPM_MIRROR_ELECTRON
  env.ELECTRON_BUILDER_BINARIES_MIRROR = NPM_MIRROR_BINARIES
}
if (values.mirror?.trim()) env.ELECTRON_MIRROR = values.mirror.trim()
if (values['binaries-mirror']?.trim()) {
  env.ELECTRON_BUILDER_BINARIES_MIRROR = values['binaries-mirror'].trim()
}

function run(command: string, args: string[], commandEnv = env): void {
  const proc = spawnSync(command, args, { stdio: 'inherit', env: commandEnv })
  if (proc.status !== 0) process.exit(proc.status ?? 1)
}

function isRunning(): boolean {
  const proc = spawnSync('pgrep', ['-f', `${APP_NAME}.app`], { stdio: 'ignore' })
  return proc.status === 0
}

const arch = os.arch()
const appDirCandidates = arch === 'arm64' ? ['dist/mac-arm64', 'dist/mac'] : ['dist/mac-x64', 'dist/mac']

const wasRunning = isRunning()
if (wasRunning) run('bash', ['close-app.sh'])

if (values.clean) {
  console.log('Cleaning electron caches...')
  rmSync(path.join(os.homedir(), 'Library/Caches/electron'), { force: true, recursive: true })
  rmSync(path.join(os.homedir(), 'Library/Caches/electron-builder'), { force: true, recursive: true })
}

console.log('Installing dependencies...')
run('bun', ['install'])

if (values.full) {
  console.log('Typechecking...')
  run('bun', ['run', 'typecheck'])
}

console.log('Building renderer...')
run('bunx', ['vite', 'build', '--config', 'renderer/vite.config.ts'])

console.log('Packaging...')
run('bunx', ['electron-builder', '--mac', '--dir'])

console.log(`Installing to ${DEST}...`)
const appDir = appDirCandidates.find((candidate) => existsSync(path.join(candidate, `${APP_NAME}.app`)))
if (!appDir) {
  console.error(`Error: packaged app not found for ${arch}`)
  process.exit(1)
}

mkdirSync(DEST, { recursive: true })
rmSync(path.join(DEST, `${APP_NAME}.app`), { force: true, recursive: true })
cpSync(path.join(appDir, `${APP_NAME}.app`), path.join(DEST, `${APP_NAME}.app`), { recursive: true })

console.log(`Installed: ${path.join(DEST, `${APP_NAME}.app`)}`)

console.log('Cleaning build artifacts...')
rmSync('dist', { force: true, recursive: true })
rmSync('dist-renderer', { force: true, recursive: true })

if (wasRunning) {
  console.log(`Restarting ${APP_NAME}...`)
  run('open', [path.join(DEST, `${APP_NAME}.app`)], process.env)
}
