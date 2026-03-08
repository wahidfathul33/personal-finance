'use client'

import { useState, useTransition } from 'react'
import { addSaving, deleteSaving, updateSaving } from '@/actions/savings'
import type { Saving, PersonId } from '@/lib/types'
import { formatCurrency, formatDate, PEOPLE, todayISO } from '@/lib/constants'
import { Plus, Trash2, Pencil, X, Check, Wallet } from 'lucide-react'

const PERSON_COLORS: Record<string, string> = {
  mas: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  fita: 'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300',
}

interface Props {
  items: Saving[]
}

function EditInline({
  saving,
  onDone,
  onCancel,
}: {
  saving: Saving
  onDone: (updated: Saving) => void
  onCancel: () => void
}) {
  const [isPending, startTransition] = useTransition()
  const [personId, setPersonId] = useState<PersonId>(saving.person_id)
  const [amount, setAmount] = useState(String(saving.amount))
  const [date, setDate] = useState(saving.date)
  const [note, setNote] = useState(saving.note ?? '')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!amount) return
    const updated: Saving = {
      ...saving,
      person_id: personId,
      amount: parseFloat(amount),
      date,
      note: note || null,
    }
    startTransition(async () => {
      await updateSaving(saving.id, {
        person_id: personId,
        amount: parseFloat(amount),
        date,
        note: note || null,
      })
      onDone(updated)
    })
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-200 dark:border-indigo-800 p-3 space-y-2"
    >
      {/* Person */}
      <div className="flex gap-2">
        {PEOPLE.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setPersonId(p.id)}
            className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-colors ${
              personId === p.id
                ? p.id === 'mas'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-pink-500 text-white border-pink-500'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700'
            }`}
          >
            {p.name}
          </button>
        ))}
      </div>

      {/* Amount */}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">Rp</span>
        <input
          type="number"
          inputMode="numeric"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0"
          required
          className="w-full pl-10 pr-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-base font-semibold bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Date */}
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="w-full h-10 border border-gray-200 dark:border-gray-700 rounded-xl px-3 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none"
      />

      {/* Note */}
      <input
        type="text"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Catatan (opsional)"
        className="w-full border border-gray-200 dark:border-gray-700 rounded-xl py-2.5 px-3 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none"
      />

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isPending}
          className="flex-1 flex items-center justify-center gap-1.5 bg-indigo-600 text-white py-2.5 rounded-xl font-semibold text-sm disabled:opacity-50"
        >
          <Check size={14} />
          {isPending ? 'Menyimpan...' : 'Simpan'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 flex items-center justify-center gap-1.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 py-2.5 rounded-xl font-semibold text-sm"
        >
          <X size={14} />
          Batal
        </button>
      </div>
    </form>
  )
}

export default function SavingsClient({ items: initial }: Props) {
  const [items, setItems] = useState(initial)
  const [isPending, startTransition] = useTransition()
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  // Add form state
  const [personId, setPersonId] = useState<PersonId>('mas')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(todayISO())
  const [note, setNote] = useState('')

  function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!amount) return

    const newItem: Saving = {
      id: crypto.randomUUID(),
      person_id: personId,
      amount: parseFloat(amount),
      date,
      note: note || null,
      created_at: new Date().toISOString(),
    }

    startTransition(async () => {
      await addSaving({ person_id: personId, amount: parseFloat(amount), date, note })
      setItems((prev) => [newItem, ...prev])
      setAmount('')
      setNote('')
      setShowForm(false)
    })
  }

  function handleDelete(id: string) {
    if (!confirm('Hapus catatan tabungan ini?')) return
    startTransition(async () => {
      await deleteSaving(id)
      setItems((prev) => prev.filter((s) => s.id !== id))
    })
  }

  return (
    <div className="px-4 space-y-4 pb-8">
      {/* Add button */}
      <button
        onClick={() => { setShowForm(!showForm); setEditingId(null) }}
        className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-3 rounded-xl font-semibold text-sm"
      >
        <Plus size={16} />
        Catat Tabungan
      </button>

      {/* Add form */}
      {showForm && (
        <form onSubmit={handleAdd} className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 space-y-3">
          {/* Person */}
          <div className="flex gap-2">
            {PEOPLE.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPersonId(p.id)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-colors ${
                  personId === p.id
                    ? p.id === 'mas'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-pink-500 text-white border-pink-500'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-600'
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>

          {/* Amount */}
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">Rp</span>
            <input
              type="number"
              inputMode="numeric"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              required
              className="w-full pl-10 pr-3 py-3 border border-gray-200 dark:border-gray-700 rounded-xl text-lg font-semibold bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Date */}
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full h-10 border border-gray-200 dark:border-gray-700 rounded-xl px-3 text-sm bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 focus:outline-none"
          />

          {/* Note */}
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Catatan (opsional)"
            className="w-full border border-gray-200 dark:border-gray-700 rounded-xl py-2.5 px-3 text-sm bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none"
          />

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 bg-indigo-600 text-white py-2.5 rounded-xl font-semibold text-sm disabled:opacity-50"
            >
              Simpan
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 py-2.5 rounded-xl font-semibold text-sm"
            >
              Batal
            </button>
          </div>
        </form>
      )}

      {/* List */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
          Riwayat
        </p>
        {items.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-8">Belum ada catatan tabungan</p>
        ) : (
          <div className="flex flex-col gap-2">
            {items.map((s) =>
              editingId === s.id ? (
                <EditInline
                  key={s.id}
                  saving={s}
                  onDone={(updated) => {
                    setItems((prev) => prev.map((x) => (x.id === updated.id ? updated : x)))
                    setEditingId(null)
                  }}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <div
                  key={s.id}
                  className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-3 flex items-center gap-3"
                >
                  <div className="w-9 h-9 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0">
                    <Wallet size={18} className="text-indigo-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {formatCurrency(s.amount)}
                      </span>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                          PERSON_COLORS[s.person_id]
                        }`}
                      >
                        {s.person_id === 'mas' ? 'Mas' : 'Fita'}
                      </span>
                    </div>
                    <div className="flex gap-2 items-center">
                      <span className="text-xs text-gray-400 dark:text-gray-500">{formatDate(s.date)}</span>
                      {s.note && (
                        <span className="text-xs text-gray-400 dark:text-gray-500 truncate">{s.note}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => { setEditingId(s.id); setShowForm(false) }}
                      disabled={isPending}
                      className="w-7 h-7 flex items-center justify-center text-gray-300 dark:text-gray-600 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(s.id)}
                      disabled={isPending}
                      className="w-7 h-7 flex items-center justify-center text-gray-300 dark:text-gray-600 hover:text-rose-500 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  )
}
