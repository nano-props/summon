const pressedAt = new Map<string, number>()
const releaseTimers = new Map<string, number>()

function getItem(id: string) {
  const el = document.querySelector<HTMLElement>(`[data-id="${CSS.escape(id)}"]`)
  return el
}

export function pressItem(id: string) {
  const timer = releaseTimers.get(id)
  if (timer) {
    window.clearTimeout(timer)
    releaseTimers.delete(id)
  }
  pressedAt.set(id, performance.now())
  getItem(id)?.classList.add('item-pressed')
}

export function releaseItem(id: string) {
  if (!pressedAt.has(id)) return
  const existing = releaseTimers.get(id)
  if (existing) {
    window.clearTimeout(existing)
    releaseTimers.delete(id)
  }
  const elapsed = performance.now() - (pressedAt.get(id) ?? 0)
  const delay = Math.max(0, 120 - elapsed)
  const timer = window.setTimeout(() => {
    getItem(id)?.classList.remove('item-pressed')
    pressedAt.delete(id)
    releaseTimers.delete(id)
  }, delay)
  releaseTimers.set(id, timer)
}

export function flashItem(id: string) {
  pressItem(id)
  window.setTimeout(() => releaseItem(id), 120)
}
