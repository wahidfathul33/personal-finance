'use client'

import { useState, useTransition, useEffect, useMemo } from 'react'
import { addSaving, deleteSaving, updateSaving } from '@/actions/savings'
import type { Saving, Person } from '@/lib/types'
import { formatCurrency, formatDate, PERSON_COLORS, todayISO, currentMonth, currentYear, MONTHS, YEAR_OPTIONS } from '@/lib/constants'
import { usePersons } from '@/lib/usePersons'
import { Plus, Trash2, Pencil, X, Check, Wallet, ChevronsUpDown, ChevronDown, TrendingUp, TrendingDown } from 'lucide-react'
import ConfirmModal from '@/components/ui/ConfirmModal'
import BottomDrawer from '@/components/ui/BottomDrawer'
import { useHideAmounts } from '@/lib/HideAmountsContext'
import HeroGradient from '@/components/ui/HeroGradient'

interface Props {
  items: Saving[]
  className?: string
}

export default function SavingsClient({ items: initialItems, className }: Props) {
  const [items, setItems] = useState(initialItems)
  const persons = usePersons()
  const { hidden } = useHideAmounts()
  const fmt = (v: number, signed = false) => {
    if (hidden) return '••••••'
    const prefix = signed && v > 0 ? '+' : ''
    return prefix + formatCurrency(v)
  }
  const [showForm, setShowForm] = useState(false)
  const [editingSaving, setEditingSaving] = useState<Saving | null>(null)
  const [editPersonId, setEditPersonId] = useState<string>('')
  const [editAmount, setEditAmount] = useState('')
  const [editDate, setEditDate] = useState('')
  const [editNote, setEditNote] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [month, setMonth] = useState(currentMonth())
  const [year, setYear] = useState(currentYear())

  const now = new Date()

  const filteredItems = useMemo(() => {
    return items.filter((s) => {
      const d = new Date(s.date)
      return d.getFullYear() === year && d.getMonth() + 1 === month
    })
  }, [items, month, year])

  const filteredTotal = useMemo(() =>
    filteredItems.reduce((sum, s) => sum + s.amount, 0)
  , [filteredItems])

  const prevMonthTotal = useMemo(() => {
    const prevMonth = month === 1 ? 12 : month - 1
    const prevYear = month === 1 ? year - 1 : year
    return items
      .filter((s) => {
        const d = new Date(s.date)
        return d.getFullYear() === prevYear && d.getMonth() + 1 === prevMonth
      })
      .reduce((sum, s) => sum + s.amount, 0)
  }, [items, month, year])

  const monthPct = useMemo(() => {
    if (prevMonthTotal === 0) return filteredTotal > 0 ? 100 : 0
    return Math.round(((filteredTotal - prevMonthTotal) / prevMonthTotal) * 100)
  }, [filteredTotal, prevMonthTotal])

  const allTimeTotal = useMemo(() =>
    items.reduce((sum, s) => sum + s.amount, 0)
  , [items])

  const perPersonTotals = useMemo(() => {
    const map: Record<string, { name: string; color: string; total: number }> = {}
    for (const s of items) {
      const key = s.person_id
      if (!map[key]) map[key] = { name: s.person?.name ?? '—', color: s.person?.color ?? 'indigo', total: 0 }
      map[key].total += s.amount
    }
    return Object.values(map)
  }, [items])

  const [personId, setPersonId] = useState<string>('')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(todayISO())
  const [note, setNote] = useState('')

  useEffect(() => {
    if (persons.length > 0 && !personId) setPersonId(persons[0].id)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [persons])

  function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!amount || !personId) return
    startTransition(async () => {
      await addSaving({ person_id: personId, amount: parseFloat(amount), date, note })
      const p = persons.find((x) => x.id === personId)
      setItems((prev) => [
        {
          id: crypto.randomUUID(),
          person_id: personId,
          person: p ? { name: p.name, color: p.color } : undefined,
          amount: parseFloat(amount),
          date,
          note: note || null,
          created_at: new Date().toISOString(),
        },
        ...prev,
      ])
      setAmount('')
      setNote('')
      setShowForm(false)
    })
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      await deleteSaving(id)
      setItems((prev) => prev.filter((s) => s.id !== id))
    })
  }

  return (
    <>
    <div className={`px-4 ${className ?? ''}`}>
      {/* Hero Card */}
      <HeroGradient variant="savings" className="p-4 mb-3">
        <p className="text-white/70 text-xs font-medium mb-1">Total Tabungan</p>
        <p className="text-3xl font-bold text-white tracking-tight amount">{fmt(allTimeTotal)}</p>
        {perPersonTotals.length > 0 && (
          <div className={`grid gap-2 mt-3 text-xs ${perPersonTotals.length <= 1 ? 'grid-cols-1' : perPersonTotals.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
            {perPersonTotals.map((p) => (
              <div key={p.name} className="bg-white/10 rounded-xl p-2">
                <p className="text-white/70 mb-0.5">{p.name}</p>
                <p className="font-semibold text-sm">{fmt(p.total)}</p>
                {allTimeTotal > 0 && <p className="text-white/60 text-[10px]">{Math.round((p.total / allTimeTotal) * 100)}%</p>}
              </div>
            ))}
          </div>
        )}
      </HeroGradient>

      {/* Month / Year Filter */}
      <div className="flex items-center gap-2 mb-3">
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
      </div>

      {/* Month total */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl px-4 py-3 flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{MONTHS[month - 1]} {year}</span>
        <div className="flex items-center gap-1.5">
          <span className={`text-sm font-bold ${
            filteredTotal >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
          }`}>{fmt(filteredTotal)}</span>
          {monthPct > 0 && <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-0.5"><TrendingUp size={12} />{monthPct}%</span>}
          {monthPct < 0 && <span className="text-xs font-medium text-rose-600 dark:text-rose-400 inline-flex items-center gap-0.5"><TrendingDown size={12} />{Math.abs(monthPct)}%</span>}
        </div>
      </div>

      <div className="flex items-center justify-between mb-3 mt-3">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Riwayat</p>
      </div>

      {/* List */}
      <div className="space-y-2 pb-8">

        {items.length === 0 && (
          <p className="text-center text-gray-400 text-sm py-6">Belum ada tabungan</p>
        )}

        {filteredItems.length === 0 && items.length > 0 && (
          <p className="text-center text-gray-400 text-sm py-6">Tidak ada tabungan di bulan ini</p>
        )}

      {filteredItems.map((s) => {
        const color = s.person?.color ?? 'indigo'
        const badgeClass = PERSON_COLORS[color]?.badge ?? PERSON_COLORS.indigo.badge
        const isExpanded = expandedId === s.id

        return (
          <div key={s.id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
            <button
              className="w-full flex items-center gap-3 p-3 text-left"
              onClick={() => setExpandedId(isExpanded ? null : s.id)}
            >
              <div className="w-10 h-10 rounded-full bg-base-subtle flex items-center justify-center flex-shrink-0">
                <Wallet size={18} className="icon-btn-base" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${badgeClass}`}>
                    {s.person?.name ?? '—'}
                  </span>
                  {s.note && (
                    <span className="text-xs text-gray-500 dark:text-gray-400 truncate">{s.note}</span>
                  )}
                </div>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{formatDate(s.date)}</p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <p className={`text-sm font-bold ${
                  s.amount >= 0
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-rose-600 dark:text-rose-400'
                }`}>
                  {fmt(s.amount, true)}
                </p>
                <ChevronDown
                  size={14}
                  className={`text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                />
              </div>
            </button>

            {isExpanded && (
              <div className="flex border-t border-gray-100 dark:border-gray-700">
                <button
                  onClick={() => { setEditingSaving(s); setEditPersonId(s.person_id); setEditAmount(String(Math.abs(s.amount))); setEditDate(s.date); setEditNote(s.note ?? ''); setExpandedId(null) }}
                  disabled={isPending}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 text-xs icon-btn-base transition-colors"
                >
                  <Pencil size={13} />
                  Edit
                </button>
                <div className="w-px bg-gray-100 dark:bg-gray-700" />
                <button
                  onClick={() => setConfirmId(s.id)}
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
    </div>
    {confirmId && (
      <ConfirmModal
        message="Hapus tabungan ini?"
        onConfirm={() => { handleDelete(confirmId); setConfirmId(null) }}
        onCancel={() => setConfirmId(null)}
      />
    )}

    {/* Edit Drawer */}
    <BottomDrawer open={!!editingSaving} onClose={() => setEditingSaving(null)} title="Edit Tabungan">
      {editingSaving && (
        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (!editAmount || !editPersonId) return
            startTransition(async () => {
              await updateSaving(editingSaving.id, {
                person_id: editPersonId,
                amount: parseFloat(editAmount),
                date: editDate,
                note: editNote || null,
              })
              const p = persons.find((x) => x.id === editPersonId)
              setItems((prev) => prev.map((x) => x.id === editingSaving.id ? {
                ...x,
                person_id: editPersonId,
                person: p ? { name: p.name, color: p.color } : x.person,
                amount: parseFloat(editAmount),
                date: editDate,
                note: editNote || null,
              } : x))
              setEditingSaving(null)
            })
          }}
          className="space-y-4"
        >
          <div>
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">Person</label>
            <div className="flex flex-wrap gap-2">
              {persons.map((p) => {
                const colors = PERSON_COLORS[p.color] ?? PERSON_COLORS.indigo
                return (
                  <button key={p.id} type="button" onClick={() => setEditPersonId(p.id)}
                    className={`flex-1 min-w-[70px] py-2 rounded-xl text-sm font-medium border transition-colors ${
                      editPersonId === p.id ? colors.button : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-600'
                    }`}>
                    {p.name}
                  </button>
                )
              })}
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">Nominal</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">Rp</span>
              <input type="text" inputMode="numeric"
                value={editAmount ? editAmount.replace(/\B(?=(\d{3})+(?!\d))/g, '.') : ''}
                onChange={(e) => setEditAmount(e.target.value.replace(/\D/g, ''))}
                placeholder="0" required
                className="w-full pl-10 pr-3 py-3 border border-gray-200 dark:border-gray-700 rounded-xl text-lg font-semibold bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-base-500" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">Tanggal</label>
            <input type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)}
              className="w-full border border-gray-200 dark:border-gray-700 rounded-xl py-2.5 px-3 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-base-500 appearance-none" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">Catatan</label>
            <input type="text" value={editNote} onChange={(e) => setEditNote(e.target.value)} placeholder="Opsional..."
              className="w-full border border-gray-200 dark:border-gray-700 rounded-xl py-2.5 px-3 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-base-500" />
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={isPending || !editAmount || !editPersonId} className="flex-1 btn-base h-[48px] rounded-xl font-semibold text-sm">Simpan</button>
            <button type="button" onClick={() => setEditingSaving(null)} className="flex-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 h-[48px] rounded-xl font-semibold text-sm border border-gray-200 dark:border-gray-700">Batal</button>
          </div>
        </form>
      )}
    </BottomDrawer>

    {/* FAB */}
    {!showForm && !editingSaving && (
      <button
        onClick={() => setShowForm(true)}
        className="fixed bottom-20 right-4 z-[90] w-14 h-14 rounded-full btn-base shadow-lg flex items-center justify-center active:scale-95 transition-transform"
      >
        <Plus size={24} className="text-white" />
      </button>
    )}

    {/* Bottom Drawer */}
    <BottomDrawer open={showForm} onClose={() => setShowForm(false)} title="Tabungan Baru">
      <form onSubmit={handleAdd} className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {persons.map((p) => {
            const colors = PERSON_COLORS[p.color] ?? PERSON_COLORS.indigo
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setPersonId(p.id)}
                className={`flex-1 min-w-[70px] py-2 rounded-xl text-sm font-medium border transition-colors ${
                  personId === p.id
                    ? colors.button
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-600'
                }`}
              >
                {p.name}
              </button>
            )
          })}
        </div>

        <div>
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">Nominal</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">Rp</span>
            <input
              type="text"
              inputMode="numeric"
              value={amount ? amount.replace(/\B(?=(\d{3})+(?!\d))/g, '.') : ''}
              onChange={(e) => setAmount(e.target.value.replace(/\D/g, ''))}
              placeholder="0"
              required
              className="w-full pl-10 pr-3 py-3 border border-gray-200 dark:border-gray-700 rounded-xl text-lg font-semibold bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-base-500"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">Tanggal</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full border border-gray-200 dark:border-gray-700 rounded-xl py-2.5 px-3 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-base-500 appearance-none"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">Catatan</label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Opsional..."
            className="w-full border border-gray-200 dark:border-gray-700 rounded-xl py-2.5 px-3 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-base-500"
          />
        </div>

        <div className="flex gap-2">
          <button type="submit" disabled={isPending || !amount || !personId} className="flex-1 btn-base h-[48px] rounded-xl font-semibold text-sm">
            Simpan
          </button>
          <button type="button" onClick={() => setShowForm(false)} className="flex-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 h-[48px] rounded-xl font-semibold text-sm border border-gray-200 dark:border-gray-700">
            Batal
          </button>
        </div>
      </form>
    </BottomDrawer>
  </>
  )
}
