'use client'

import { useEffect, useState } from 'react'

/**
 * Tracks scroll direction and returns `true` while the user is scrolling down
 * (past `minY`), `false` when scrolling up or near the top.
 *
 * - Passive scroll listener, rAF-throttled → no jank, no forced reflow.
 * - `threshold` filters out sub-pixel / rubber-band noise (iOS Safari).
 */
export function useScrollCompact(threshold = 8, minY = 64): boolean {
  const [compact, setCompact] = useState(false)

  useEffect(() => {
    let lastY = window.scrollY
    let ticking = false

    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        const y = window.scrollY
        const dy = y - lastY
        if (Math.abs(dy) > threshold) {
          // Rubber-band overscroll at the bottom reports dy > 0 — clamp via minY
          setCompact(y > minY && dy > 0)
          lastY = y
        }
        ticking = false
      })
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [threshold, minY])

  return compact
}
