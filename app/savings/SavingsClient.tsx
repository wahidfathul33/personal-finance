'use client'

import { useState, useTransition, useEffect, useMemo } from 'react'
import { addSaving, deleteSaving, updateSaving } from '@/actions/savings'
import type { Saving, Person } from '@/lib/types'
import { formatCurrency, formatDate, PERSON_COLORS, todayISO, currentMonth, currentYear, MONTHS } from '@/lib/constants'
import { usePersons } from '@/lib/usePersons'
import { Plus, Trash2, Pencil, X, Check, Wallet, ChevronsUpDown, ChevronDown } from 'lucide-react'
import ConfirmModal from '@/components/ConfirmModal'

interface Props {
  items: Saving[]
  className?: string
}

function EditInline({
  saving,
  persons,
  onDone,
  onCancel,
}: {
  saving: Saving
  persons: Person[]
  onDone: (updated: Saving) => void
  onCancel: () => void
}) {
  const [isPending, startTransition] = useTransition()
  const [personId, setPersonId] = useState<string>(saving.person_id)
  const [amount, setAmount] = useState(String(Math.abs(saving.amount)))
  const [date, setDate] = useState(saving.date)
  const [note, setNote] = useState(saving.note ?? '')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!amount) return

    startTransition(async () => {
      await updateSaving(saving.id, {
        person_id: personId,
        amount: parseFloat(amount),
        date,
        note: note || null,
      })
      const p = persons.find((x) => x.id === personId)
      onDone({
        ...saving,
        person_id: personId,
        person: p ? { name: p.name, color: p.color } : saving.person,
        amount: parseFloat(amount),
        date,
        note: note || null,
      })
    })
  }

  return (
    <form onSubmit={handleSubmit} className="bg-base-subtle rounded-2xl border border-base-subtle p-3 space-y-2">
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
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700'
              }`}
            >
              {p.name}
            </button>
          )
        })}
      </div>

      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">Rp</span>
        <input
          type="number"
          inputMode="numeric"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0"
          required
          className="w-full pl-10 pr-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-base font-semibold bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[var(--base-500)]"
        />
      </div>

      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="w-full h-10 border border-gray-200 dark:border-gray-700 rounded-xl px-3 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none"
      />
      <input
        type="text"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Catatan (opsional)"
        className="w-full border border-gray-200 dark:border-gray-700 rounded-xl py-2 px-3 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none"
      />

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isPending}
          className="flex-1 btn-base py-2 rounded-xl text-sm font-medium"
        >
          <Check size={14} className="inline mr-1" />
          Simpan
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 py-2 rounded-xl text-sm font-medium"
        >
          <X size={14} className="inline mr-1" />
          Batal
        </button>
      </div>
    </form>
  )
}

export default function SavingsClient({ items: initialItems, className }: Props) {
  const [items, setItems] = useState(initialItems)
  const persons = usePersons()
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [month, setMonth] = useState(currentMonth())
  const [year, setYear] = useState(currentYear())

  const now = new Date()
  const YEAR_OPTIONS = Array.from({ length: 5 }, (_, i) => now.getFullYear() - i)

  const filteredItems = useMemo(() => {
    return items.filter((s) => {
      const d = new Date(s.date)
      return d.getFullYear() === year && d.getMonth() + 1 === month
    })
  }, [items, month, year])

  const filteredTotal = useMemo(() =>
    filteredItems.reduce((sum, s) => sum + s.amount, 0)
  , [filteredItems])

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
    <div className={`flex flex-col px-4 ${className ?? ''}`}>
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
      <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl px-4 py-3 flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{MONTHS[month - 1]} {year}</span>
        <span className={`text-sm font-bold ${
          filteredTotal >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
        }`}>{filteredTotal >= 0 ? '+' : ''}{formatCurrency(filteredTotal)}</span>
      </div>

      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Riwayat</p>
        <button
          onClick={() => setShowForm(!showForm)}
          className="w-7 h-7 btn-base rounded-full flex items-center justify-center"
        >
          <Plus size={14} className="text-white" />
        </button>
      </div>

      {/* Scrollable list */}
      <div className="flex-1 min-h-0 overflow-y-auto space-y-2 pb-4">
        {showForm && (
          <form onSubmit={handleAdd} className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-3 space-y-2">
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

          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">Rp</span>
            <input
              type="number"
              inputMode="numeric"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              required
              className="w-full pl-10 pr-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-base font-semibold bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[var(--base-500)]"
            />
          </div>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full h-10 border border-gray-200 dark:border-gray-700 rounded-xl px-3 text-sm bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 focus:outline-none"
          />
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Catatan (opsional)"
            className="w-full border border-gray-200 dark:border-gray-700 rounded-xl py-2 px-3 text-sm bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 focus:outline-none"
          />
          <div className="flex gap-2">
            <button type="submit" disabled={isPending} className="flex-1 btn-base py-2 rounded-xl text-sm font-medium">
              Simpan
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 py-2 rounded-xl text-sm font-medium">
              Batal
            </button>
          </div>
          </form>
        )}

        {items.length === 0 && (
          <p className="text-center text-gray-400 text-sm py-6">Belum ada tabungan</p>
        )}

        {filteredItems.length === 0 && items.length > 0 && (
          <p className="text-center text-gray-400 text-sm py-6">Tidak ada tabungan di bulan ini</p>
        )}

      {filteredItems.map((s) => {
        const isEditing = editingId === s.id
        const color = s.person?.color ?? 'indigo'
        const badgeClass = PERSON_COLORS[color]?.badge ?? PERSON_COLORS.indigo.badge

        if (isEditing) {
          return (
            <EditInline
              key={s.id}
              saving={s}
              persons={persons}
              onDone={(updated) => {
                setItems((prev) => prev.map((x) => x.id === updated.id ? updated : x))
                setEditingId(null)
              }}
              onCancel={() => setEditingId(null)}
            />
          )
        }

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
                  {s.amount >= 0 ? '+' : ''}{formatCurrency(s.amount)}
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
                  onClick={() => { setEditingId(s.id); setExpandedId(null) }}
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
  </>
  )
}
