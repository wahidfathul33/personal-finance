'use client'

import { useState, useTransition, useCallback, useEffect } from 'react'
import { Plus, Filter, CalendarClock } from 'lucide-react'
import Link from 'next/link'
import { getTransactions } from '@/actions/transactions'
import TransactionItem from '@/components/TransactionItem'
import TransactionForm from '@/components/TransactionForm'
import PageHeader from '@/components/PageHeader'
import type { TransactionWithCategory, TransactionFilters } from '@/lib/types'
import { MONTHS, currentMonth, currentYear } from '@/lib/constants'

const YEARS = [2024, 2025, 2026, 2027]

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<TransactionWithCategory[]>([])
  const [showForm, setShowForm] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [isPending, startTransition] = useTransition()

  const [filters, setFilters] = useState<TransactionFilters>({
    month: currentMonth(),
    year: currentYear(),
    person_id: 'all',
    type: 'all',
    category_id: 'all',
  })

  const loadTransactions = useCallback((f: TransactionFilters) => {
    startTransition(async () => {
      try {
        const data = await getTransactions(f)
        setTransactions(data)
      } catch {
        setTransactions([])
      }
    })
  }, [])

  useEffect(() => {
    loadTransactions(filters)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function updateFilter<K extends keyof TransactionFilters>(key: K, value: TransactionFilters[K]) {
    const next = { ...filters, [key]: value }
    setFilters(next)
    loadTransactions(next)
  }

  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0)
  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, t) => acc + Math.abs(t.amount), 0)

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900">
      <PageHeader
        title="Transaksi"
        subtitle={`${MONTHS[(filters.month ?? 1) - 1]} ${filters.year}`}
        right={
          <div className="flex items-center gap-2">
            <Link
              href="/recurring"
              className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Transaksi Berulang"
            >
              <CalendarClock size={16} />
            </Link>
            <button
              onClick={() => setShowForm(true)}
              className="w-9 h-9 bg-indigo-600 rounded-full flex items-center justify-center"
            >
              <Plus size={18} className="text-white" />
            </button>
          </div>
        }
      />

      {/* Month / Year selector */}
      <div className="flex items-center gap-2 px-4 mb-3">
        <select
          value={filters.month}
          onChange={(e) => updateFilter('month', parseInt(e.target.value))}
          className="flex-1 h-10 border border-gray-200 dark:border-gray-700 rounded-xl px-3 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none"
        >
          {MONTHS.map((m, i) => (
            <option key={i} value={i + 1}>{m}</option>
          ))}
        </select>
        <select
          value={filters.year}
          onChange={(e) => updateFilter('year', parseInt(e.target.value))}
          className="h-10 border border-gray-200 dark:border-gray-700 rounded-xl px-3 text-sm w-24 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none"
        >
          {YEARS.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-colors ${
            showFilters ? 'bg-indigo-600 border-indigo-600' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
          }`}
        >
          <Filter size={16} className={showFilters ? 'text-white' : 'text-gray-600'} />
        </button>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="px-4 mb-3 space-y-2">
          {/* Person */}
          <div className="flex gap-2">
            {(['all', 'mas', 'fita'] as const).map((p) => (
              <button
                key={p}
                onClick={() => updateFilter('person_id', p)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  filters.person_id === p
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300'
                }`}
              >
                {p === 'all' ? 'Semua' : p === 'mas' ? 'Mas' : 'Fita'}
              </button>
            ))}
          </div>

          {/* Type */}
          <div className="flex gap-2">
            {(['all', 'income', 'expense', 'transfer'] as const).map((t) => (
              <button
                key={t}
                onClick={() => updateFilter('type', t)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  filters.type === t
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300'
                }`}
              >
                {t === 'all' ? 'Semua' : t === 'income' ? 'Masuk' : t === 'expense' ? 'Keluar' : 'Transfer'}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Summary bar */}
      <div className="flex gap-3 px-4 mb-3">
        <div className="flex-1 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl px-3 py-2">
          <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Masuk</p>
          <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
            {totalIncome.toLocaleString('id-ID')}
          </p>
        </div>
        <div className="flex-1 bg-rose-50 dark:bg-rose-900/20 rounded-xl px-3 py-2">
          <p className="text-[10px] text-rose-600 dark:text-rose-400 font-medium">Keluar</p>
          <p className="text-sm font-bold text-rose-600 dark:text-rose-400">
            {totalExpense.toLocaleString('id-ID')}
          </p>
        </div>
        <div className="flex-1 bg-gray-50 dark:bg-gray-800 rounded-xl px-3 py-2">
          <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">Transaksi</p>
          <p className="text-sm font-bold text-gray-700 dark:text-gray-200">{transactions.length}</p>
        </div>
      </div>

      {/* Transaction list */}
      <div className="flex-1 px-4 flex flex-col gap-2">
        {isPending ? (
          <div className="text-center py-12 text-gray-400 dark:text-gray-500 text-sm">Memuat...</div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-12 text-gray-400 dark:text-gray-500 text-sm">
            Tidak ada transaksi
          </div>
        ) : (
          transactions.map((t) => (
            <TransactionItem
              key={t.id}
              transaction={t}
              showPerson
              onSuccess={() => loadTransactions(filters)}
            />
          ))
        )}
      </div>

      {showForm && (
        <TransactionForm
          onClose={() => {
            setShowForm(false)
            loadTransactions(filters)
          }}
        />
      )}
    </div>
  )
}
