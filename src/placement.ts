export type Placement = 'bottom' | 'bottom-start' | 'bottom-end'

export const PANEL_GAP = 4
export const SCREEN_PADDING = 8

export function calcPlacementX(
  placement: Placement,
  tray: { x: number; width: number },
  winWidth: number,
): number {
  switch (placement) {
    case 'bottom-start':
      return Math.round(tray.x)
    case 'bottom-end':
      return Math.round(tray.x + tray.width - winWidth)
    case 'bottom':
    default:
      return Math.round(tray.x + tray.width / 2 - winWidth / 2)
  }
}
