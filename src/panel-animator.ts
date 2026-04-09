import type { BrowserWindow } from 'electron/main'

const ANIM_DURATION = 100 // ms
const ANIM_INTERVAL = 16 // ~60fps
const easeOut = (t: number) => 1 - (1 - t) * (1 - t)
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
  from: number,
  to: number,
  easing: (t: number) => number,
  onComplete?: () => void,
): void {
  stopAnimation()
  win.setOpacity(from)
  const start = Date.now()
  animTimer = setInterval(() => {
    if (win.isDestroyed()) {
      stopAnimation()
      return
    }
    const t = Math.min((Date.now() - start) / ANIM_DURATION, 1)
    win.setOpacity(from + (to - from) * easing(t))
    if (t >= 1) {
      stopAnimation()
      onComplete?.()
    }
  }, ANIM_INTERVAL)
}

export function fadeIn(win: BrowserWindow): void {
  animateOpacity(win, 0, 1, easeOut)
}

export function fadeOut(win: BrowserWindow, onComplete?: () => void): void {
  animateOpacity(win, 1, 0, easeIn, onComplete)
}
