'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { getTransactions } from '@/actions/transactions'
import { getPersons } from '@/actions/persons'
import TransactionItem, { TransactionItemSkeleton } from '@/components/TransactionItem'
import TransactionForm from '@/components/TransactionForm'
import PageHeader from '@/components/PageHeader'
import Link from 'next/link'
import type { TransactionWithCategory } from '@/lib/types'
import type { Person } from '@/lib/types'
import { currentMonth, currentYear, PERSON_COLORS, formatCurrency, MONTHS } from '@/lib/constants'
import { Plus, CalendarDays, SlidersHorizontal, ChevronsUpDown } from 'lucide-react'

const TYPE_OPTIONS = [
  { value: 'all', label: 'Semua' },
  { value: 'expense', label: 'Keluar' },
  { value: 'income', label: 'Masuk' },
  { value: 'transfer', label: 'Transfer' },
]

const PAGE_SIZE = 20
const now = new Date()
const YEAR_OPTIONS = Array.from({ length: 5 }, (_, i) => now.getFullYear() - i)

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<TransactionWithCategory[]>([])
  const [persons, setPersons] = useState<Person[]>([])
  const [personFilter, setPersonFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [month, setMonth] = useState(currentMonth())
  const [year, setYear] = useState(currentYear())
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const [offset, setOffset] = useState(0)
  const [showFilters, setShowFilters] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [statsData, setStatsData] = useState<{ income: number; expense: number; count: number } | null>(null)
  const sentinelRef = useRef<HTMLDivElement>(null)

  const filters = useMemo(() => ({
    month,
    year,
    person_id: personFilter === 'all' ? undefined : personFilter,
    type: typeFilter === 'all' ? undefined : (typeFilter as TransactionWithCategory['type']),
  }), [month, year, personFilter, typeFilter])

  const loadPersons = useCallback(async () => {
    const data = await getPersons()
    setPersons(data)
  }, [])

  const loadStats = useCallback(async () => {
    setStatsData(null)
    const data = await getTransactions({ ...filters })
    const income = data.filter(tx => tx.type === 'income').reduce((s, tx) => s + tx.amount, 0)
    const expense = data.filter(tx => tx.type === 'expense').reduce((s, tx) => s + tx.amount, 0)
    setStatsData({ income, expense, count: data.length })
  }, [filters])

  const loadTransactions = useCallback(async () => {
    setLoading(true)
    setOffset(0)
    const data = await getTransactions({ ...filters, limit: PAGE_SIZE, offset: 0 })
    setTransactions(data)
    setHasMore(data.length === PAGE_SIZE)
    setOffset(data.length)
    setLoading(false)
  }, [filters])

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return
    setLoadingMore(true)
    const data = await getTransactions({ ...filters, limit: PAGE_SIZE, offset })
    setTransactions(prev => {
      const seen = new Set(prev.map(t => t.id))
      return [...prev, ...data.filter(t => !seen.has(t.id))]
    })
    setHasMore(data.length === PAGE_SIZE)
    setOffset(prev => prev + data.length)
    setLoadingMore(false)
  }, [filters, offset, loadingMore, hasMore])

  useEffect(() => { loadPersons() }, [loadPersons])
  useEffect(() => { loadTransactions() }, [loadTransactions])
  useEffect(() => { loadStats() }, [loadStats])

  // Infinite scroll via IntersectionObserver
  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) loadMore() },
      { threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [loadMore])

  const hasActiveFilters = personFilter !== 'all' || typeFilter !== 'all'

  return (
    <div className="flex flex-col h-[calc(100dvh-80px)]">
      <PageHeader
        title="Transaksi"
        subtitle={`${MONTHS[month - 1]} ${year}`}
        right={
          <>
            <Link
              href="/recurring"
              className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <CalendarDays size={17} />
            </Link>
            <button
              onClick={() => setShowForm(true)}
              className="w-9 h-9 flex items-center justify-center rounded-full btn-base"
            >
              <Plus size={18} />
            </button>
          </>
        }
      />

      {/* Month / Year / Filter Row */}
      <div className="px-4 mb-3 flex items-center gap-2">
        <div className="relative flex-1">
          <select
            value={month}
            onChange={e => setMonth(Number(e.target.value))}
            className="w-full bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100 text-sm font-medium rounded-xl pl-3 pr-8 py-2.5 border-0 outline-none appearance-none cursor-pointer"
          >
            {MONTHS.map((name, i) => (
              <option key={i + 1} value={i + 1}>{name}</option>
            ))}
          </select>
          <ChevronsUpDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>

        <div className="relative w-28">
          <select
            value={year}
            onChange={e => setYear(Number(e.target.value))}
            className="w-full bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100 text-sm font-medium rounded-xl pl-3 pr-8 py-2.5 border-0 outline-none appearance-none cursor-pointer"
          >
            {YEAR_OPTIONS.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <ChevronsUpDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>

        <button
          onClick={() => setShowFilters(v => !v)}
          className={`w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-xl transition-colors ${
            showFilters || hasActiveFilters
              ? 'filter-active'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
          }`}
        >
          <SlidersHorizontal size={17} />
        </button>
      </div>

      {/* Collapsible Filters */}
      {showFilters && (
        <div className="space-y-2 mb-3">
          {/* Person Filter */}
          <div className="px-4">
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setPersonFilter('all')}
                className={`py-2 rounded-2xl text-sm font-medium transition-colors ${
                  personFilter === 'all'
                    ? 'filter-active'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
                }`}
              >
                Semua
              </button>
              {persons.map((p) => {
                const isSelected = personFilter === p.id
                const colors = PERSON_COLORS[p.color] ?? PERSON_COLORS.indigo
                return (
                  <button
                    key={p.id}
                    onClick={() => setPersonFilter(isSelected ? 'all' : p.id)}
                    className={`py-2 rounded-2xl text-sm font-medium transition-colors ${
                      isSelected
                        ? colors.button
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
                    }`}
                  >
                    {p.name}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Type Filter */}
          <div className="px-4">
            <div className="grid grid-cols-4 gap-2">
              {TYPE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setTypeFilter(opt.value)}
                  className={`py-2 rounded-2xl text-sm font-medium transition-colors ${
                    typeFilter === opt.value
                      ? 'filter-active'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="px-4 mb-3 grid grid-cols-[1fr_1fr_0.7fr] gap-2">
        <div className="bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl p-4">
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mb-1">Masuk</p>
          {statsData === null
            ? <div className="h-5 w-20 rounded-full bg-emerald-200 dark:bg-emerald-900/50 shimmer-dark" />
            : <p className="font-bold text-emerald-700 dark:text-emerald-300">{formatCurrency(statsData.income)}</p>
          }
        </div>
        <div className="bg-rose-50 dark:bg-rose-950/40 rounded-2xl p-4">
          <p className="text-xs text-rose-600 dark:text-rose-400 font-medium mb-1">Keluar</p>
          {statsData === null
            ? <div className="h-5 w-20 rounded-full bg-rose-200 dark:bg-rose-900/50 shimmer-dark" />
            : <p className="font-bold text-rose-700 dark:text-rose-300">{formatCurrency(Math.abs(statsData.expense))}</p>
          }
        </div>
        <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">Transaksi</p>
          {statsData === null
            ? <div className="h-5 w-8 rounded-full bg-gray-300 dark:bg-gray-600 shimmer-dark" />
            : <p className="font-bold text-gray-700 dark:text-gray-200">{statsData.count}</p>
          }
        </div>
      </div>

      {/* List */}
      <div className="flex-1 min-h-0 overflow-y-auto">
      {loading ? (
        <div className="px-4 space-y-2 pt-1">
          {Array.from({ length: 6 }).map((_, i) => (
            <TransactionItemSkeleton key={i} />
          ))}
        </div>
      ) : transactions.length === 0 ? (
        <div className="text-center py-10 text-gray-400 text-sm">Tidak ada transaksi</div>
      ) : (
        <div className="px-4 space-y-2 pb-4">
          {transactions.map((tx) => (
            <TransactionItem key={tx.id} transaction={tx} onSuccess={() => { loadTransactions(); loadStats() }} />
          ))}
          {hasMore && (
            <div ref={sentinelRef} className="py-4 text-center text-sm text-gray-400">
              {loadingMore ? 'Memuat...' : ''}
            </div>
          )}
        </div>
      )}
      </div>

      {showForm && (
        <TransactionForm
          onClose={() => setShowForm(false)}
          onSuccess={() => {
            setShowForm(false)
            loadTransactions()
            loadStats()
          }}
        />
      )}
    </div>
  )
}
