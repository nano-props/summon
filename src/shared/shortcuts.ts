export const SHORTCUT_ACCELERATORS = [
  'Option+Space',
  'Option+Tab',
  'Command+Shift+Space',
  'Command+Option+Space',
  'Control+Option+Space',
] as const
export type ShortcutAccelerator = (typeof SHORTCUT_ACCELERATORS)[number]
