'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, ListOrdered, BarChart2, PiggyBank, Building2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/transactions', label: 'Transaksi', icon: ListOrdered },
  { href: '/analysis', label: 'Analisis', icon: BarChart2 },
  { href: '/savings', label: 'Tabungan', icon: PiggyBank },
  { href: '/assets', label: 'Aset', icon: Building2 },
]

export default function BottomNav() {
  const pathname = usePathname()
  const [activeIndex, setActiveIndex] = useState(0)

  if (pathname === '/auth') return null

  useEffect(() => {
    const index = NAV_ITEMS.findIndex(item => item.href === pathname)
    if (index !== -1) {
      setActiveIndex(index)
    }
  }, [pathname])

  return (
    <nav className="fixed bottom-3 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-lg bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-lg shadow-black/10 border border-gray-200/50 dark:border-base-700/50 z-[60]">
      <div className="flex items-center justify-around h-14 px-2 relative">
        {NAV_ITEMS.map(({ href, label, icon: Icon }, index) => {
          const isActive = index === activeIndex
          return (
            <Link
              key={href}
              href={href}
              className="relative flex flex-col items-center justify-center gap-0.5 pt-2.5 pb-2 px-6 min-w-[72px] transition-all duration-200"
              onClick={() => setActiveIndex(index)}
            >
              {isActive && (
                <motion.div
                  layoutId="nav-pill"
                  className="absolute inset-x-0.5 top-1 bottom-1 bg-base-500/10 dark:bg-base-400/15 rounded-xl"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}
              <motion.div
                className={cn(
                  'relative z-10 transition-colors duration-200',
                  isActive ? 'text-base-600 dark:text-base-400' : 'text-gray-400 dark:text-gray-500'
                )}
                whileTap={{ scale: 0.9 }}
              >
                <Icon size={22} strokeWidth={isActive ? 2.2 : 1.8} />
              </motion.div>
              <span className={cn(
                'relative z-10 text-[10px] font-medium transition-colors',
                isActive ? 'text-base-600 dark:text-base-400' : 'text-gray-400 dark:text-gray-500'
              )}>
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
