import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { IPC_CHANNELS, RENDERER_CHANNELS } from '#/src/shared/ipc.ts'

function channelEntries(objectName: string): Record<string, string> {
  const preload = readFileSync(path.join(import.meta.dirname, '..', 'preload.js'), 'utf8')
  const match = new RegExp(`const ${objectName} = \\{([\\s\\S]*?)\\}`).exec(preload)
  if (!match) throw new Error(`${objectName} not found in preload.js`)
  return Object.fromEntries([...match[1].matchAll(/(\w+):\s*'([^']+)'/g)].map(([, key, value]) => [key, value]))
}

describe('ipc channels', () => {
  it('keeps preload channel strings aligned with shared constants', () => {
    expect(channelEntries('IPC_CHANNELS')).toEqual(IPC_CHANNELS)
    expect(channelEntries('RENDERER_CHANNELS')).toEqual(RENDERER_CHANNELS)
  })
})
