import { useEffect } from 'react'
import { flashItem } from '#/renderer/src/flash-item.ts'
import { useStore } from '#/renderer/src/store.ts'
import type { WindowDTO } from '#/renderer/src/types.ts'

// ⌘1–⌘9  →  index 0-8
const SHORTCUT_KEYS = '123456789'
const WINDOW_ROW_SELECTOR = '[data-window-row]'
const INTERACTIVE_SELECTOR = [
  WINDOW_ROW_SELECTOR,
  'button',
  'a[href]',
  'input',
  'select',
  'textarea',
  '[contenteditable="true"]',
  '[role="button"]',
].join(',')

function closest(target: EventTarget | null, selector: string) {
  return target instanceof HTMLElement ? target.closest(selector) : null
}

function moveIndex(selectedIndex: number, length: number, delta: number) {
  if (length === 0) return -1
  if (selectedIndex < 0) return delta > 0 ? 0 : length - 1
  return (selectedIndex + delta + length) % length
}

async function newTerminal(): Promise<void> {
  try {
    const result = await window.summonAPI.newTerminal()
    if (!result?.ok) console.error('New terminal failed:', result?.error ?? 'unknown error')
  } catch (error) {
    console.error('New terminal failed:', error)
  }
}

async function hidePanel(): Promise<void> {
  try {
    const result = await window.summonAPI.hidePanel()
    if (!result?.ok) console.error('Hide panel failed')
  } catch (error) {
    console.error('Hide panel failed:', error)
  }
}

async function activateWindow(targetWindow: WindowDTO): Promise<void> {
  try {
    const result = await window.summonAPI.activateWindow(targetWindow.id, targetWindow.terminalId)
    if (!result?.ok) console.error('Activate failed:', result?.error ?? 'unknown error')
  } catch (error) {
    console.error('Activate failed:', error)
  }
}

export function useKeyboardNav(windowsRef: React.RefObject<WindowDTO[]>) {
  useEffect(() => {
    const onFocus = () => {
      const list = windowsRef.current!
      useStore.getState().setSelectedIndex(list.length > 0 ? 0 : -1)
      window.requestAnimationFrame(() => {
        document.querySelector<HTMLElement>(WINDOW_ROW_SELECTOR)?.focus({ preventScroll: true })
      })
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.defaultPrevented) return

      // ⌘+digit quick activate
      if (e.metaKey && !e.ctrlKey && !e.altKey) {
        const key = e.key.toLowerCase()
        if (SHORTCUT_KEYS.includes(key)) {
          const list = windowsRef.current!
          const idx = SHORTCUT_KEYS.indexOf(key)
          if (idx >= 0 && idx < list.length) {
            e.preventDefault()
            flashItem(list[idx].key)
            void activateWindow(list[idx])
          }
          return
        }
        if (key === 'n') {
          e.preventDefault()
          void newTerminal()
          return
        }
      }

      if (e.key === 'Escape') {
        void hidePanel()
        return
      }

      if (closest(e.target, INTERACTIVE_SELECTOR) && !closest(e.target, WINDOW_ROW_SELECTOR)) return

      const { selectedIndex, setSelectedIndex } = useStore.getState()
      const list = windowsRef.current!
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex(moveIndex(selectedIndex, list.length, 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex(moveIndex(selectedIndex, list.length, -1))
      } else if (e.key === 'Tab') {
        e.preventDefault()
        setSelectedIndex(moveIndex(selectedIndex, list.length, e.shiftKey ? -1 : 1))
      } else if (e.key === 'Home') {
        e.preventDefault()
        if (list.length > 0) setSelectedIndex(0)
      } else if (e.key === 'End') {
        e.preventDefault()
        if (list.length > 0) setSelectedIndex(list.length - 1)
      } else if (e.key === 'Enter' || e.key === ' ') {
        if (closest(e.target, WINDOW_ROW_SELECTOR)) return
        if (selectedIndex >= 0 && selectedIndex < list.length) {
          e.preventDefault()
          flashItem(list[selectedIndex].key)
          void activateWindow(list[selectedIndex])
        }
      }
    }
    window.addEventListener('focus', onFocus)
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('focus', onFocus)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [windowsRef])
}
