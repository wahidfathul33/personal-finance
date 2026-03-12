import { getMonthlyStats } from '@/actions/balances'
import { formatCurrency, currentMonth, currentYear } from '@/lib/constants'

export async function StatsSection() {
  const month = currentMonth()
  const year = currentYear()
  const stats = await getMonthlyStats(month, year)

  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-3 border border-gray-100 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Pemasukan</p>
        <p className="font-bold text-emerald-600 dark:text-emerald-400">
          +{formatCurrency(stats.income)}
        </p>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-3 border border-gray-100 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Pengeluaran</p>
        <p className="font-bold text-rose-600 dark:text-rose-400">
          -{formatCurrency(stats.expense)}
        </p>
      </div>
    </div>
  )
}

export function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3">
      {[0, 1].map((i) => (
        <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-3 border border-gray-100 dark:border-gray-700">
          <div className="h-3 w-20 rounded-full mb-2 bg-gray-200 dark:bg-gray-700 shimmer-dark" />
          <div className="h-5 w-28 rounded-full bg-gray-200 dark:bg-gray-700 shimmer-dark" />
        </div>
      ))}
    </div>
  )
}
