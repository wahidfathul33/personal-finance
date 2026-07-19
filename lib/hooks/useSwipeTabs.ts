'use client'

import { useEffect, useRef } from 'react'

export type SwipeDirection = 1 | -1 // 1 = next tab, -1 = previous tab

interface UseSwipeTabsOptions {
  /** Disable entirely (e.g. current route is not a tab). */
  enabled: boolean
  onSwipe: (direction: SwipeDirection) => void
}

/**
 * Elements a horizontal swipe must never start from: form controls,
 * dialogs/sheets, horizontally scrollable areas, and components with their
 * own horizontal gestures (marked with `data-swipe-ignore`).
 */
const IGNORE_SELECTOR =
  'input, textarea, select, [role="dialog"], [data-swipe-ignore], .overflow-x-auto, .overflow-x-scroll'

const INTENT_LOCK_PX = 10 // movement before we commit to an axis
const HORIZONTAL_RATIO = 1.5 // dx must dominate dy by this factor
const TRIGGER_PX = 60 // minimum horizontal travel to navigate

/**
 * Document-level horizontal swipe → tab navigation.
 * Touch-only, passive listeners, and locks to the vertical axis early so it
 * never fights with normal page scrolling.
 */
export function useSwipeTabs({ enabled, onSwipe }: UseSwipeTabsOptions) {
  const onSwipeRef = useRef(onSwipe)
  onSwipeRef.current = onSwipe

  useEffect(() => {
    if (!enabled) return

    let startX = 0
    let startY = 0
    let tracking = false
    let horizontal: boolean | null = null

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) {
        tracking = false
        return
      }
      const target = e.target as Element | null
      if (target?.closest?.(IGNORE_SELECTOR)) return
      startX = e.touches[0].clientX
      startY = e.touches[0].clientY
      tracking = true
      horizontal = null
    }

    const onTouchMove = (e: TouchEvent) => {
      if (!tracking || horizontal !== null) return
      const dx = Math.abs(e.touches[0].clientX - startX)
      const dy = Math.abs(e.touches[0].clientY - startY)
      if (dx < INTENT_LOCK_PX && dy < INTENT_LOCK_PX) return
      horizontal = dx > dy * HORIZONTAL_RATIO
      if (!horizontal) tracking = false // vertical scroll — bail out
    }

    const onTouchEnd = (e: TouchEvent) => {
      if (!tracking) return
      tracking = false
      if (!horizontal) return
      const dx = e.changedTouches[0].clientX - startX
      const dy = e.changedTouches[0].clientY - startY
      if (Math.abs(dx) >= TRIGGER_PX && Math.abs(dx) > Math.abs(dy) * HORIZONTAL_RATIO) {
        onSwipeRef.current(dx < 0 ? 1 : -1)
      }
    }

    const onTouchCancel = () => {
      tracking = false
    }

    document.addEventListener('touchstart', onTouchStart, { passive: true })
    document.addEventListener('touchmove', onTouchMove, { passive: true })
    document.addEventListener('touchend', onTouchEnd, { passive: true })
    document.addEventListener('touchcancel', onTouchCancel, { passive: true })
    return () => {
      document.removeEventListener('touchstart', onTouchStart)
      document.removeEventListener('touchmove', onTouchMove)
      document.removeEventListener('touchend', onTouchEnd)
      document.removeEventListener('touchcancel', onTouchCancel)
    }
  }, [enabled])
}
