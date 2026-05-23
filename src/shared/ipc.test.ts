import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { IPC_CHANNELS, RENDERER_CHANNELS } from '#/src/shared/ipc.ts'

function channelValues(objectName: string): string[] {
  const preload = readFileSync(path.join(import.meta.dirname, '..', 'preload.js'), 'utf8')
  const match = new RegExp(`const ${objectName} = \\{([\\s\\S]*?)\\}`).exec(preload)
  if (!match) throw new Error(`${objectName} not found in preload.js`)
  return [...match[1].matchAll(/:\s*'([^']+)'/g)].map(([, value]) => value)
}

describe('ipc channels', () => {
  it('keeps preload channel strings aligned with shared constants', () => {
    expect(channelValues('IPC_CHANNELS')).toEqual(Object.values(IPC_CHANNELS))
    expect(channelValues('RENDERER_CHANNELS')).toEqual(Object.values(RENDERER_CHANNELS))
  })
})
