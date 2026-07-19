'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Home, ListOrdered, BarChart2, PiggyBank, Building2 } from 'lucide-react'
import { motion, useReducedMotion, type Transition } from 'framer-motion'
import { useCallback, useState } from 'react'
import { cn } from '@/lib/utils'
import { useScrollCompact } from '@/lib/hooks/useScrollCompact'
import { useSwipeTabs, type SwipeDirection } from '@/lib/hooks/useSwipeTabs'

const NAV_ITEMS = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/transactions', label: 'Transaksi', icon: ListOrdered },
  { href: '/analysis', label: 'Analisis', icon: BarChart2 },
  { href: '/savings', label: 'Tabungan', icon: PiggyBank },
  { href: '/assets', label: 'Aset', icon: Building2 },
] as const

const spring: Transition = { type: 'spring', stiffness: 380, damping: 32 }

export default function BottomNav() {
  const pathname = usePathname()
  const router = useRouter()
  const scrolledDown = useScrollCompact()
  const [hovered, setHovered] = useState(false)

  const activeIndex = NAV_ITEMS.findIndex(item => item.href === pathname)

  const handleSwipe = useCallback(
    (direction: SwipeDirection) => {
      const current = NAV_ITEMS.findIndex(item => item.href === window.location.pathname)
      if (current === -1) return
      const next = current + direction
      if (next < 0 || next >= NAV_ITEMS.length) return
      router.push(NAV_ITEMS[next].href)
    },
    [router]
  )

  useSwipeTabs({ enabled: activeIndex !== -1, onSwipe: handleSwipe })

  const reduceMotion = useReducedMotion()
  const transition: Transition = reduceMotion ? { duration: 0 } : spring

  if (pathname === '/auth') return null

  // Hover always expands (desktop); scroll-down shrinks otherwise
  const compact = scrolledDown && !hovered

  return (
    <div
      className="fixed inset-x-0 z-[60] flex justify-center px-4 pointer-events-none"
      style={{ bottom: 'calc(0.75rem + env(safe-area-inset-bottom))' }}
    >
      <motion.nav
        aria-label="Navigasi utama"
        data-swipe-ignore
        className="liquid-glass pointer-events-auto w-full max-w-lg rounded-[1.75rem] will-change-transform origin-bottom"
        animate={{ scale: compact ? 0.9 : 1, y: compact ? 4 : 0 }}
        whileHover={reduceMotion ? undefined : { scale: 1.02 }}
        transition={transition}
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
      >
        <div className="flex items-stretch justify-around h-14 px-0.5">
          {NAV_ITEMS.map(({ href, label, icon: Icon }, index) => {
            const isActive = index === activeIndex
            return (
              <Link
                key={href}
                href={href}
                aria-label={label}
                aria-current={isActive ? 'page' : undefined}
                className="group relative flex flex-1 min-w-[44px] flex-col items-center justify-center gap-0.5 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-base-500 focus-visible:ring-offset-1"
              >
                {isActive && (
                  <motion.span
                    layoutId="nav-pill"
                    aria-hidden
                    className="absolute inset-y-0.5 inset-x-px rounded-full bg-base-500/25 dark:bg-base-400/25 shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]"
                    transition={transition}
                  />
                )}
                <motion.span
                  className={cn(
                    'relative z-10 transition-colors duration-200',
                    isActive
                      ? 'text-base-600 dark:text-base-300'
                      : 'text-gray-500 dark:text-gray-400'
                  )}
                  animate={{ scale: compact ? 0.92 : 1, y: compact ? 7 : 0 }}
                  whileHover={reduceMotion ? undefined : { scale: 1.15 }}
                  whileTap={{ scale: 0.85 }}
                  transition={transition}
                >
                  <Icon size={22} strokeWidth={isActive ? 2.2 : 1.8} aria-hidden />
                </motion.span>
                <motion.span
                  className={cn(
                    'relative z-10 text-[10px] font-medium transition-colors duration-200',
                    isActive
                      ? 'text-base-600 dark:text-base-300'
                      : 'text-gray-500 dark:text-gray-400'
                  )}
                  animate={{ opacity: compact ? 0 : 1, scale: compact ? 0.75 : 1 }}
                  transition={transition}
                >
                  {label}
                </motion.span>
              </Link>
            )
          })}
        </div>
      </motion.nav>
    </div>
  )
}
