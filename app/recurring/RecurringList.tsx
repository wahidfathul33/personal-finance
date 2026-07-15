'use client'

import { useState, useTransition, useMemo } from 'react'
import { toggleRecurringTemplate, deleteRecurringTemplate } from '@/actions/recurring'
import type { RecurringTemplate } from '@/lib/types'
import { formatCurrency, PERSON_COLORS, getCategoryById, getCategoryIcon, getCategoryColors } from '@/lib/constants'
import { Trash2, ToggleLeft, ToggleRight, ChevronDown, SlidersHorizontal, Wallet, Building2, CheckCircle2, XCircle, Pencil } from 'lucide-react'
import Link from 'next/link'
import ConfirmModal from '@/components/ui/ConfirmModal'
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
  const [expandedId, setExpandedId] = useState<string | null>(null)

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
        {(['all', 'expense', 'income'] as FilterType[]).map((v) => (
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
            {v === 'all' ? 'Semua Tipe' : v === 'expense' ? '− Pengeluaran' : '+ Pemasukan'}
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
            {v === 'all' ? 'Semua Sumber' : v === 'balance' ? <><Wallet size={12} className="inline" /> Saldo</> : <><Building2 size={12} className="inline" /> Tabungan</>}
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
            {v === 'all' ? 'Semua Status' : v === 'active' ? <><CheckCircle2 size={12} className="inline" /> Aktif</> : <><XCircle size={12} className="inline" /> Nonaktif</>}
          </button>
        ))}
      </div>
    </div>
    </div>
    </div>  {/* end collapsible */}

    <div className="px-4 space-y-2 pb-8">
      {filtered.length === 0 && (
        <p className="text-center py-8 text-gray-400 text-sm">Tidak ada template yang sesuai filter</p>
      )}
      {filtered.map((t) => {
        const personColor = t.person?.color ?? 'indigo'
        const badgeClass = PERSON_COLORS[personColor]?.badge ?? PERSON_COLORS.indigo.badge
        const cat = t.category_id ? getCategoryById(t.category_id) : undefined
        const isExpanded = expandedId === t.id

        return (
          <div
            key={t.id}
            className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden transition-opacity ${
              !t.active ? 'opacity-50' : ''
            }`}
          >
            <button
              className="w-full flex items-center gap-3 p-3 text-left"
              onClick={() => setExpandedId(isExpanded ? null : t.id)}
            >
              <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                cat ? `${getCategoryColors(cat.id).bg} ${getCategoryColors(cat.id).text}` : 'bg-gray-100 dark:bg-gray-700'
              }`}>
                {cat ? (() => { const Icon = getCategoryIcon(cat.icon); return <Icon size={18} />; })() : (
                  <span className="text-xs font-bold text-gray-400">{t.day_of_month}</span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">
                    {t.name}
                  </span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${TYPE_COLORS[t.type]}`}>
                    {t.type === 'expense' ? 'Pengeluaran' : t.type === 'income' ? 'Pemasukan' : 'Transfer'}
                  </span>
                  {t.person && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${badgeClass}`}>
                      {t.person.name}
                    </span>
                  )}
                  {!t.active && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium bg-gray-100 dark:bg-gray-700 text-gray-400">
                      nonaktif
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    Tgl {t.day_of_month}
                  </span>
                  {t.type !== 'transfer' && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                      {t.source === 'savings' ? <><Building2 size={10} className="inline" /> Tabungan</> : <><Wallet size={10} className="inline" /> Saldo</>}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1 flex-shrink-0">
                <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                  {formatCurrency(t.amount)}
                </span>
                <ChevronDown
                  size={14}
                  className={`text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                />
              </div>
            </button>

            {isExpanded && (
              <div className="flex border-t border-gray-100 dark:border-gray-700">
                <Link
                  href={`/recurring?edit=${t.id}`}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 text-xs icon-btn-base transition-colors"
                >
                  <Pencil size={13} />
                  Edit
                </Link>
                <div className="w-px bg-gray-100 dark:bg-gray-700" />
                <button
                  onClick={() => handleToggle(t.id, t.active)}
                  disabled={isPending}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  {t.active ? <ToggleRight size={13} /> : <ToggleLeft size={13} />}
                  {t.active ? 'Nonaktif' : 'Aktifkan'}
                </button>
                <div className="w-px bg-gray-100 dark:border-gray-700" />
                <button
                  onClick={() => setConfirmId(t.id)}
                  disabled={isPending}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 text-xs text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
                >
                  <Trash2 size={13} />
                  Hapus
                </button>
              </div>
            )}
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
