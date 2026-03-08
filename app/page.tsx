import { Suspense } from 'react'
import { BalancesSection, BalancesSkeleton } from './_home/BalancesSection'
import { StatsSection, StatsSkeleton } from './_home/StatsSection'
import { RecentSection, RecentSkeleton } from './_home/RecentSection'
import QuickActions from '@/components/QuickActions'
import ThemeToggle from '@/components/ThemeToggle'
import Link from 'next/link'
import { Settings } from 'lucide-react'
import { currentMonth, currentYear, MONTHS } from '@/lib/constants'

export const dynamic = 'force-dynamic'

export default function HomePage() {
  const month = currentMonth()
  const year = currentYear()

  return (
    <div className="flex flex-col min-h-[calc(100dvh-80px)]">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 px-4 pt-12 pb-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-indigo-200 text-xs font-medium">{MONTHS[month - 1]} {year}</p>
            <h1 className="text-white text-xl font-bold mt-0.5">Keuangan Kita</h1>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              href="/settings"
              className="w-9 h-9 flex items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
            >
              <Settings size={17} />
            </Link>
          </div>
        </div>

        <Suspense fallback={<BalancesSkeleton />}>
          <BalancesSection />
        </Suspense>
      </div>

      {/* Monthly Stats */}
      <div className="px-4 py-3">
        <Suspense fallback={<StatsSkeleton />}>
          <StatsSection />
        </Suspense>
      </div>

      {/* Quick Actions */}
      <div className="px-4 mb-4">
        <QuickActions />
      </div>

      {/* Recent Transactions */}
      <div className="px-4 pb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Transaksi Terbaru</h2>
          <Link href="/transactions" className="text-xs text-indigo-500 font-medium">
            Lihat semua
          </Link>
        </div>
        <Suspense fallback={<RecentSkeleton />}>
          <RecentSection />
        </Suspense>
      </div>
    </div>
  )
}

