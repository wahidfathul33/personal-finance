import { getAllBalances, getMonthlyStats } from '@/actions/balances'
import { getRecentTransactions } from '@/actions/transactions'
import { generateRecurringTransactions } from '@/actions/recurring'
import { formatCurrency, MONTHS, currentMonth, currentYear } from '@/lib/constants'
import QuickActions from '@/components/QuickActions'
import TransactionItem from '@/components/TransactionItem'
import ThemeToggle from '@/components/ThemeToggle'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import type { TransactionWithCategory } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  // Auto-generate recurring transactions on dashboard load
  try {
    await generateRecurringTransactions()
  } catch {}

  let balances = { mas: 0, fita: 0, total: 0 }
  let stats = { income: 0, expense: 0 }
  let recent: TransactionWithCategory[] = []

  try {
    ;[balances, stats, recent] = await Promise.all([
      getAllBalances(),
      getMonthlyStats(),
      getRecentTransactions(8),
    ])
  } catch {
    // Tables may not exist yet — show empty state
  }

  const month = currentMonth()
  const year = currentYear()
  const monthLabel = `${MONTHS[month - 1]} ${year}`

  return (
    <div className="flex flex-col gap-5 pb-4">
      {/* Header */}
      <div className="bg-indigo-600 px-4 pt-12 pb-6">
        <div className="flex items-center justify-between mb-1">
          <p className="text-indigo-200 text-xs font-medium">{monthLabel}</p>
          <ThemeToggle className="w-9 h-9 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors" />
        </div>
        <h1 className="text-white text-2xl font-bold mb-5">
          {formatCurrency(balances.total)}
        </h1>

        {/* Balance cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/10 rounded-2xl p-3">
            <p className="text-indigo-200 text-xs mb-1">Mas</p>
            <p className={`text-lg font-bold ${balances.mas >= 0 ? 'text-white' : 'text-rose-300'}`}>
              {formatCurrency(balances.mas)}
            </p>
          </div>
          <div className="bg-white/10 rounded-2xl p-3">
            <p className="text-indigo-200 text-xs mb-1">Fita</p>
            <p className={`text-lg font-bold ${balances.fita >= 0 ? 'text-white' : 'text-rose-300'}`}>
              {formatCurrency(balances.fita)}
            </p>
          </div>
        </div>
      </div>

      {/* Monthly Stats */}
      <div className="grid grid-cols-2 gap-3 px-4">
        <div className="bg-emerald-50 rounded-2xl p-4">
          <p className="text-xs text-emerald-600 font-medium mb-1">Pemasukan</p>
          <p className="text-base font-bold text-emerald-700">
            {formatCurrency(stats.income)}
          </p>
        </div>
        <div className="bg-rose-50 rounded-2xl p-4">
          <p className="text-xs text-rose-600 font-medium mb-1">Pengeluaran</p>
          <p className="text-base font-bold text-rose-600">
            {formatCurrency(stats.expense)}
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 mb-2">
          Aksi Cepat
        </p>
        <QuickActions />
      </div>

      {/* Recent Transactions */}
      <div>
        <div className="flex items-center justify-between px-4 mb-2">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Transaksi Terkini
          </p>
          <Link
            href="/transactions"
            className="flex items-center gap-0.5 text-xs text-indigo-600 font-medium"
          >
            Lihat semua <ChevronRight size={12} />
          </Link>
        </div>
        <div className="px-4 flex flex-col gap-2">
          {recent.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">
              Belum ada transaksi
            </div>
          ) : (
            recent.map((t) => (
              <TransactionItem key={t.id} transaction={t} showPerson />
            ))
          )}
        </div>
      </div>
    </div>
  )
}
