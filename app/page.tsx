import { getAllBalances, getMonthlyStats } from '@/actions/balances'
import { getTransactions } from '@/actions/transactions'
import { generateRecurringTransactions } from '@/actions/recurring'
import TransactionItem from '@/components/TransactionItem'
import QuickActions from '@/components/QuickActions'
import ThemeToggle from '@/components/ThemeToggle'
import Link from 'next/link'
import { Settings } from 'lucide-react'
import { formatCurrency, currentMonth, currentYear, PERSON_COLORS } from '@/lib/constants'

export const dynamic = 'force-dynamic'

const MONTH_NAMES = [
  '', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
]

export default async function HomePage() {
  const month = currentMonth()
  const year = currentYear()

  await generateRecurringTransactions()

  const [balances, stats, recentTx] = await Promise.all([
    getAllBalances(month, year),
    getMonthlyStats(month, year),
    getTransactions({ month, year }),
  ])

  const recent = recentTx.slice(0, 5)

  return (
    <div>
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 px-4 pt-12 pb-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-indigo-200 text-xs font-medium">{MONTH_NAMES[month]} {year}</p>
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

        {/* Balance Cards */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          {balances.people.map((p) => (
            <div key={p.id} className="bg-white/10 rounded-2xl p-3">
              <p className="text-indigo-200 text-xs mb-1">{p.name}</p>
              <p className={`text-lg font-bold ${p.amount >= 0 ? 'text-white' : 'text-rose-300'}`}>
                {formatCurrency(p.amount)}
              </p>
            </div>
          ))}
        </div>

        {/* Total */}
        <div className="bg-white/10 rounded-2xl p-3">
          <p className="text-indigo-200 text-xs mb-1">Total Bersama</p>
          <p className={`text-xl font-bold ${balances.total >= 0 ? 'text-white' : 'text-rose-300'}`}>
            {formatCurrency(balances.total)}
          </p>
        </div>
      </div>

      {/* Monthly Stats */}
      <div className="px-4 py-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-3 border border-gray-100 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Pemasukan</p>
            <p className="text-base font-bold text-emerald-600 dark:text-emerald-400">
              +{formatCurrency(stats.income)}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-3 border border-gray-100 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Pengeluaran</p>
            <p className="text-base font-bold text-rose-600 dark:text-rose-400">
              -{formatCurrency(stats.expense)}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-4 mb-4">
        <QuickActions />
      </div>

      {/* Recent Transactions */}
      <div className="px-4 pb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Transaksi Terbaru</h2>
          <Link href="/transactions" className="text-xs text-indigo-500 font-medium">
            Lihat semua
          </Link>
        </div>
        {recent.length === 0 ? (
          <p className="text-center py-8 text-gray-400 text-sm">Belum ada transaksi bulan ini</p>
        ) : (
          <div className="space-y-2">
            {recent.map((tx) => (
              <TransactionItem key={tx.id} transaction={tx} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
