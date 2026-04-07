import { useEffect, useRef, useCallback } from 'react'
import { useStore } from './store'
import type { WindowCardHandle } from './WindowCard'
import type { WindowDTO } from './types'

export function useKeyboardNav(
  searchRef: React.RefObject<HTMLInputElement | null>,
  filteredRef: React.RefObject<WindowDTO[]>,
) {
  const cardRefs = useRef(new Map<string, WindowCardHandle>())

  const handleCardRef = useCallback((id: string, handle: WindowCardHandle | null) => {
    if (handle) cardRefs.current.set(id, handle)
    else cardRefs.current.delete(id)
  }, [])

  useEffect(() => {
    const onFocus = () => {
      useStore.getState().setSelectedIndex(-1)
      searchRef.current?.focus()
    }
    const onKeyDown = (e: KeyboardEvent) => {
      const inAliasInput = (e.target as HTMLElement).tagName === 'INPUT' && e.target !== searchRef.current

      // Tab: cycle through alias inputs (works from anywhere)
      if (e.key === 'Tab') {
        e.preventDefault()
        const list = filteredRef.current!
        if (list.length === 0) return
        const { selectedIndex, setSelectedIndex } = useStore.getState()
        const refs = cardRefs.current

        let current = selectedIndex
        if (inAliasInput) {
          const idx = list.findIndex((w) => refs.get(w.id)?.isInputFocused())
          if (idx >= 0) current = idx
        }

        // In alias → move to next/prev; otherwise → enter edit mode on current (or first/last)
        const next = inAliasInput
          ? current + (e.shiftKey ? -1 : 1)
          : (current >= 0 ? current : (e.shiftKey ? list.length - 1 : 0))

        if (next >= 0 && next < list.length) {
          setSelectedIndex(next)
          refs.get(list[next].id)?.focusInput()
        } else {
          // Past either end → back to search
          setSelectedIndex(-1)
          searchRef.current?.focus()
        }
        return
      }

      // Other keys: don't intercept when alias input is focused
      if (inAliasInput) return

      if (e.key === 'Escape') {
        window.summonAPI.hidePanel()
        return
      }
      const { selectedIndex, setSelectedIndex, activateWindow } = useStore.getState()
      const list = filteredRef.current!
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex(Math.min(selectedIndex + 1, list.length - 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        const next = selectedIndex - 1
        setSelectedIndex(Math.max(next, -1))
        if (next < 0) searchRef.current?.focus()
      } else if (e.key === 'Enter') {
        if (selectedIndex >= 0 && selectedIndex < list.length) {
          activateWindow(list[selectedIndex].id)
        }
      }
    }
    window.addEventListener('focus', onFocus)
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('focus', onFocus)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [searchRef, filteredRef])

  return handleCardRef
}
