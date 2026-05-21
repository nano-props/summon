export const SHORTCUT_ACCELERATORS = [
  'Option+Space',
  'Option+Tab',
  'Command+Shift+Space',
  'Control+Space',
  'Command+Space',
] as const
export type ShortcutAccelerator = (typeof SHORTCUT_ACCELERATORS)[number]
