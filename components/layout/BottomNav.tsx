'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, ListOrdered, Wallet, Gem, BarChart2 } from 'lucide-react'

const NAV_ITEMS = [
  { href: '/', label: 'Home', icon: LayoutDashboard },
  { href: '/transactions', label: 'Transaksi', icon: ListOrdered },
  { href: '/analysis', label: 'Analisis', icon: BarChart2 },
  { href: '/savings', label: 'Tabungan', icon: Wallet },
  { href: '/assets', label: 'Aset', icon: Gem },
]

export default function BottomNav() {
  const pathname = usePathname()

  if (pathname === '/auth') return null

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-lg bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 z-[70]">
      <div className="flex items-center justify-around h-16 pb-safe">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-0.5 flex-1 py-2 transition-colors ${
                isActive
                  ? ''
                  : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
              }`}
            style={isActive ? { color: 'var(--base-text)' } : undefined}
            >
              <Icon size={20} strokeWidth={isActive ? 2.2 : 1.8} />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
