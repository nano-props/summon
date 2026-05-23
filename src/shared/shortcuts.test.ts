import { describe, expect, it } from 'vitest'
import { SHORTCUT_ACCELERATORS } from '#/src/shared/shortcuts.ts'

describe('SHORTCUT_ACCELERATORS', () => {
  it('keeps the supported accelerator list stable and unique', () => {
    expect(SHORTCUT_ACCELERATORS).toEqual([
      'Option+Space',
      'Option+Tab',
      'Command+Shift+Space',
      'Control+Space',
      'Command+Space',
    ])
    expect(new Set(SHORTCUT_ACCELERATORS).size).toBe(SHORTCUT_ACCELERATORS.length)
  })
})
