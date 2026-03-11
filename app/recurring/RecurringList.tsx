'use client'

import { useState, useTransition, useMemo } from 'react'
import { toggleRecurringTemplate, deleteRecurringTemplate } from '@/actions/recurring'
import type { RecurringTemplate } from '@/lib/types'
import { formatCurrency, PERSON_COLORS } from '@/lib/constants'
import { Trash2, ToggleLeft, ToggleRight, Edit, ChevronDown, SlidersHorizontal } from 'lucide-react'
import Link from 'next/link'
import ConfirmModal from '@/components/ConfirmModal'
import { usePersons } from '@/lib/usePersons'

const TYPE_COLORS: Record<string, string> = {
  income: 'text-emerald-600 bg-emerald-50',
  expense: 'text-rose-600 bg-rose-50',
  transfer: 'text-blue-600 bg-blue-50',
}

type FilterType = 'all' | 'income' | 'expense' | 'transfer'
type FilterSource = 'all' | 'balance' | 'savings'
type FilterActive = 'all' | 'active' | 'inactive'

interface Props {
  templates: RecurringTemplate[]
}

export default function RecurringList({ templates: initial }: Props) {
  const [templates, setTemplates] = useState(initial)
  const [isPending, startTransition] = useTransition()
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const persons = usePersons()

  const [filterType, setFilterType] = useState<FilterType>('all')
  const [filterSource, setFilterSource] = useState<FilterSource>('all')
  const [filterPerson, setFilterPerson] = useState<string>('all')
  const [filterActive, setFilterActive] = useState<FilterActive>('all')
  const [filterOpen, setFilterOpen] = useState(false)

  const activeFilterCount = [
    filterType !== 'all',
    filterSource !== 'all',
    filterPerson !== 'all',
    filterActive !== 'all',
  ].filter(Boolean).length

  const filtered = useMemo(() => {
    return templates.filter((t) => {
      if (filterType !== 'all' && t.type !== filterType) return false
      if (filterSource !== 'all' && t.source !== filterSource) return false
      if (filterPerson !== 'all' && t.person_id !== filterPerson) return false
      if (filterActive === 'active' && !t.active) return false
      if (filterActive === 'inactive' && t.active) return false
      return true
    })
  }, [templates, filterType, filterSource, filterPerson, filterActive])

  function handleToggle(id: string, active: boolean) {
    startTransition(async () => {
      await toggleRecurringTemplate(id, !active)
      setTemplates((prev) =>
        prev.map((t) => (t.id === id ? { ...t, active: !active } : t))
      )
    })
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      await deleteRecurringTemplate(id)
      setTemplates((prev) => prev.filter((t) => t.id !== id))
    })
  }

  if (templates.length === 0) {
    return (
      <div className="text-center py-10 text-gray-400 text-sm">
        Belum ada template transaksi rutin
      </div>
    )
  }

  return (
    <>
    {/* Filter toggle header */}
    <div className="px-4 pb-2">
      <button
        type="button"
        onClick={() => setFilterOpen((v) => !v)}
        className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
      >
        <SlidersHorizontal size={15} />
        <span>Filter</span>
        {activeFilterCount > 0 && (
          <span className="bg-indigo-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
            {activeFilterCount}
          </span>
        )}
        <ChevronDown
          size={15}
          className={`transition-transform duration-200 ${filterOpen ? 'rotate-180' : ''}`}
        />
      </button>
    </div>

    {/* Collapsible filters */}
    <div
      style={{
        display: 'grid',
        gridTemplateRows: filterOpen ? '1fr' : '0fr',
        transition: 'grid-template-rows 0.25s ease',
      }}
    >
    <div style={{ overflow: 'hidden' }}>
    <div className="px-4 pb-4 space-y-2">
      {/* Tipe */}
      <div className="flex gap-1.5 flex-wrap">
        {(['all', 'expense', 'income', 'transfer'] as FilterType[]).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setFilterType(v)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
              filterType === v
                ? 'filter-active'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700'
            }`}
          >
            {v === 'all' ? 'Semua Tipe' : v === 'expense' ? '− Pengeluaran' : v === 'income' ? '+ Pemasukan' : '⇄ Transfer'}
          </button>
        ))}
      </div>

      {/* Source */}
      <div className="flex gap-1.5 flex-wrap">
        {(['all', 'balance', 'savings'] as FilterSource[]).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setFilterSource(v)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
              filterSource === v
                ? 'filter-active'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700'
            }`}
          >
            {v === 'all' ? 'Semua Sumber' : v === 'balance' ? '💰 Saldo' : '🏦 Tabungan'}
          </button>
        ))}
      </div>

      {/* Person */}
      {persons.length > 1 && (
        <div className="flex gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => setFilterPerson('all')}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
              filterPerson === 'all'
                ? 'filter-active'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700'
            }`}
          >
            Semua Orang
          </button>
          {persons.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setFilterPerson(p.id)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                filterPerson === p.id
                  ? 'filter-active'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700'
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>
      )}

      {/* Status aktif */}
      <div className="flex gap-1.5 flex-wrap">
        {(['all', 'active', 'inactive'] as FilterActive[]).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setFilterActive(v)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
              filterActive === v
                ? 'filter-active'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700'
            }`}
          >
            {v === 'all' ? 'Semua Status' : v === 'active' ? '✓ Aktif' : '✗ Nonaktif'}
          </button>
        ))}
      </div>
    </div>
    </div>
    </div>  {/* end collapsible */}

    <div className="px-4 space-y-3 pb-8">
      {filtered.length === 0 && (
        <p className="text-center py-8 text-gray-400 text-sm">Tidak ada template yang sesuai filter</p>
      )}
      {filtered.map((t) => {
        const personColor = t.person?.color ?? 'indigo'
        const badgeClass = PERSON_COLORS[personColor]?.badge ?? PERSON_COLORS.indigo.badge

        return (
          <div
            key={t.id}
            className={`bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-3 transition-opacity ${
              !t.active ? 'opacity-50' : ''
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">{t.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${TYPE_COLORS[t.type]}`}>
                    {t.type === 'expense' ? 'Pengeluaran' : t.type === 'income' ? 'Pemasukan' : 'Transfer'}
                  </span>
                  {t.person && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${badgeClass}`}>
                      {t.person.name}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    Tgl {t.day_of_month}{t.category_id ? ` · ${t.category_id}` : ''}
                  </span>
                  {t.type !== 'transfer' && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                      {t.source === 'savings' ? '🏦 Tabungan' : '💰 Saldo'}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                <span className="text-sm font-bold text-gray-800 dark:text-gray-100">
                  {formatCurrency(t.amount)}
                </span>
                <div className="flex items-center gap-1">
                  <Link
                    href={`/recurring/${t.id}/edit`}
                    className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-indigo-500"
                  >
                    <Edit size={13} />
                  </Link>
                  <button
                    onClick={() => handleToggle(t.id, t.active)}
                    disabled={isPending}
                    className={`w-7 h-7 flex items-center justify-center rounded-full transition-colors ${
                      t.active
                        ? 'hover:bg-gray-100 dark:hover:bg-gray-700 text-indigo-500'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400'
                    }`}
                  >
                    {t.active ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                  </button>
                  <button
                    onClick={() => setConfirmId(t.id)}
                    disabled={isPending}
                    className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-rose-50 dark:hover:bg-rose-900/20 text-gray-400 hover:text-rose-500"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
    {confirmId && (
      <ConfirmModal
        message="Hapus template ini?"
        onConfirm={() => { handleDelete(confirmId); setConfirmId(null) }}
        onCancel={() => setConfirmId(null)}
      />
    )}
  </>
  )
}
