import type { BrowserWindow } from 'electron/main'

const SHOW_DURATION = 140
const HIDE_DURATION = 90
const ANIM_INTERVAL = 16 // ~60fps
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3)
const easeIn = (t: number) => t * t

let animTimer: ReturnType<typeof setInterval> | null = null

export function stopAnimation(): void {
  if (animTimer) {
    clearInterval(animTimer)
    animTimer = null
  }
}

function animateOpacity(
  win: BrowserWindow,
  fromOpacity: number,
  toOpacity: number,
  duration: number,
  easing: (t: number) => number,
  onComplete?: () => void,
): void {
  stopAnimation()
  win.setOpacity(fromOpacity)
  const start = Date.now()
  animTimer = setInterval(() => {
    if (win.isDestroyed()) {
      stopAnimation()
      return
    }
    const t = Math.min((Date.now() - start) / duration, 1)
    const eased = easing(t)
    win.setOpacity(fromOpacity + (toOpacity - fromOpacity) * eased)
    if (t >= 1) {
      stopAnimation()
      onComplete?.()
    }
  }, ANIM_INTERVAL)
}

export function fadeIn(win: BrowserWindow): void {
  animateOpacity(win, 0, 1, SHOW_DURATION, easeOut)
}

export function fadeOut(win: BrowserWindow, onComplete?: () => void): void {
  animateOpacity(win, win.getOpacity(), 0, HIDE_DURATION, easeIn, onComplete)
}
