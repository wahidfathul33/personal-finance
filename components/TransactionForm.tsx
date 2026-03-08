'use client'

import { useState, useTransition } from 'react'
import { X, ArrowLeftRight } from 'lucide-react'
import {
  addTransaction,
  addSplitBill,
  addTransfer,
  updateTransaction,
} from '@/actions/transactions'
import {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  PEOPLE,
  todayISO,
} from '@/lib/constants'
import type { PersonId, TransactionType, TransactionWithCategory } from '@/lib/types'

type Mode = 'expense' | 'income' | 'split' | 'transfer'

interface Props {
  defaultMode?: Mode
  editTransaction?: TransactionWithCategory
  onClose: () => void
}

export default function TransactionForm({ defaultMode = 'expense', editTransaction, onClose }: Props) {
  const isEdit = !!editTransaction

  // Derive initial mode from editTransaction type
  const initialMode: Mode = isEdit
    ? editTransaction.type === 'transfer' ? 'transfer'
      : editTransaction.type === 'income' ? 'income'
      : 'expense'
    : defaultMode

  const [mode, setMode] = useState<Mode>(initialMode)
  const [isPending, startTransition] = useTransition()

  // Shared fields – pre-fill from editTransaction if editing
  const [date, setDate] = useState(editTransaction?.date ?? todayISO())
  const [amount, setAmount] = useState(
    editTransaction ? String(Math.abs(editTransaction.amount)) : ''
  )
  const [note, setNote] = useState(editTransaction?.note?.replace(/\[recurring:[^\]]+\]/g, '').trim() ?? '')
  const [categoryId, setCategoryId] = useState(editTransaction?.category_id ?? '')

  // Expense / Income
  const [personId, setPersonId] = useState<PersonId>(
    (editTransaction?.person_id as PersonId) ?? 'mas'
  )

  // Split
  const [splitType, setSplitType] = useState<'equal' | 'custom'>('equal')
  const [masAmount, setMasAmount] = useState('')
  const [fitaAmount, setFitaAmount] = useState('')

  // Transfer
  const [fromPerson, setFromPerson] = useState<PersonId>('mas')
  const [toPerson, setToPerson] = useState<PersonId>('fita')

  const categories = mode === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES

  const totalAmount = parseFloat(amount) || 0

  function handleSplitEqualChange(val: string) {
    setAmount(val)
    const n = parseFloat(val) || 0
    const half = Math.round(n / 2)
    setMasAmount(String(half))
    setFitaAmount(String(n - half))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!amount || !totalAmount) return

    startTransition(async () => {
      try {
        if (isEdit && editTransaction) {
          // Edit mode — update the single transaction row
          const signedAmount =
            mode === 'expense' ? -Math.abs(totalAmount) : Math.abs(totalAmount)
          await updateTransaction(editTransaction.id, {
            date,
            amount: signedAmount,
            note: note || null,
            category_id: categoryId || null,
            person_id: personId,
            type: mode,
          })
        } else if (mode === 'expense' || mode === 'income') {
          await addTransaction({
            date,
            person_id: personId,
            type: mode as TransactionType,
            category_id: categoryId,
            amount: totalAmount,
            note,
          })
        } else if (mode === 'split') {
          await addSplitBill({
            date,
            category_id: categoryId,
            total_amount: totalAmount,
            note,
            split_type: splitType,
            mas_amount: parseFloat(masAmount) || undefined,
            fita_amount: parseFloat(fitaAmount) || undefined,
          })
        } else if (mode === 'transfer') {
          await addTransfer({
            date,
            from_person: fromPerson,
            to_person: toPerson,
            amount: totalAmount,
            note,
          })
        }
        onClose()
      } catch (err) {
        alert('Gagal menyimpan transaksi')
        console.error(err)
      }
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-end">
      <div className="bg-white dark:bg-gray-900 rounded-t-2xl w-full max-w-lg mx-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2 sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 z-10 flex-shrink-0">
          <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
            {isEdit ? 'Edit Transaksi' : 'Tambah Transaksi'}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300"
          >
            <X size={18} />
          </button>
        </div>

        {/* Mode Tabs — hidden in edit mode for split/transfer (complex rows) */}
        <div className="flex gap-1 p-3 bg-gray-50 dark:bg-gray-800 flex-shrink-0">
          {(
            [
              { key: 'expense', label: '− Pengeluaran' },
              { key: 'income', label: '+ Pemasukan' },
              ...(!isEdit ? [{ key: 'split' as Mode, label: '⚡ Split' }, { key: 'transfer' as Mode, label: '↔ Transfer' }] : []),
            ] as { key: Mode; label: string }[]
          ).map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => { if (!isEdit) { setMode(key); setCategoryId('') } }}
              className={`flex-1 text-xs py-1.5 rounded-lg font-medium transition-colors ${
                mode === key
                  ? 'bg-indigo-600 text-white'
                  : isEdit
                    ? 'bg-white dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-default'
                    : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <form id="txform" onSubmit={handleSubmit} className="p-4 space-y-4 overflow-y-auto flex-1">
          {/* Amount */}
          <div>
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">
              {mode === 'split' ? 'Total Nominal' : 'Nominal'}
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">
                Rp
              </span>
              <input
                type="number"
                inputMode="numeric"
                value={mode === 'split' ? amount : amount}
                onChange={(e) =>
                  mode === 'split'
                    ? handleSplitEqualChange(e.target.value)
                    : setAmount(e.target.value)
                }
                placeholder="0"
                required
                className="w-full pl-10 pr-3 py-3 border border-gray-200 dark:border-gray-700 rounded-xl text-lg font-semibold bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Person selector (expense/income) */}
          {(mode === 'expense' || mode === 'income') && (
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">Siapa</label>
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
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Transfer persons */}
          {mode === 'transfer' && (
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">Dari</label>
                <select
                  value={fromPerson}
                  onChange={(e) => setFromPerson(e.target.value as PersonId)}
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-xl py-2.5 px-3 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {PEOPLE.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                onClick={() => {
                  const tmp = fromPerson
                  setFromPerson(toPerson)
                  setToPerson(tmp)
                }}
                className="mt-5 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex-shrink-0"
              >
                <ArrowLeftRight size={14} />
              </button>
              <div className="flex-1">
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">Ke</label>
                <select
                  value={toPerson}
                  onChange={(e) => setToPerson(e.target.value as PersonId)}
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-xl py-2.5 px-3 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {PEOPLE.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Split details */}
          {mode === 'split' && (
            <div className="space-y-3">
              <div className="flex gap-2">
                {(['equal', 'custom'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setSplitType(t)}
                    className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-colors ${
                      splitType === t
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    {t === 'equal' ? '50 / 50' : 'Custom'}
                  </button>
                ))}
              </div>
              {splitType === 'custom' && (
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">Mas</label>
                    <input
                      type="number"
                      inputMode="numeric"
                      value={masAmount}
                      onChange={(e) => setMasAmount(e.target.value)}
                      placeholder="0"
                      className="w-full border border-gray-200 dark:border-gray-700 rounded-xl py-2 px-3 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">Fita</label>
                    <input
                      type="number"
                      inputMode="numeric"
                      value={fitaAmount}
                      onChange={(e) => setFitaAmount(e.target.value)}
                      placeholder="0"
                      className="w-full border border-gray-200 dark:border-gray-700 rounded-xl py-2 px-3 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              )}
              {splitType === 'equal' && totalAmount > 0 && (
                <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2">
                  Mas: Rp {Math.round(totalAmount / 2).toLocaleString('id-ID')} &nbsp;·&nbsp; Fita: Rp {(totalAmount - Math.round(totalAmount / 2)).toLocaleString('id-ID')}
                </div>
              )}
            </div>
          )}

          {/* Category (not for transfer) */}
          {mode !== 'transfer' && (
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">Kategori</label>
              <div className="grid grid-cols-4 gap-1.5">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategoryId(cat.id)}
                    className={`flex flex-col items-center gap-0.5 py-2 rounded-xl border text-xs transition-colors ${
                      categoryId === cat.id
                        ? 'bg-indigo-50 dark:bg-indigo-900/40 border-indigo-400 text-indigo-700 dark:text-indigo-300'
                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <span className="text-base">{cat.icon}</span>
                    <span className="leading-tight text-center">{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Date */}
          <div>
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">Tanggal</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full border border-gray-200 dark:border-gray-700 rounded-xl py-2.5 px-3 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Note */}
          <div>
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">Catatan (opsional)</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Tambah catatan..."
              className="w-full border border-gray-200 dark:border-gray-700 rounded-xl py-2.5 px-3 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </form>

        {/* Sticky Save Button */}
        <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 flex-shrink-0">
          <button
            type="submit"
            form="txform"
            disabled={isPending || !amount}
            className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-semibold text-sm hover:bg-indigo-700 active:bg-indigo-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isPending ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Menyimpan...
              </>
            ) : isEdit ? (
              'Simpan Perubahan'
            ) : (
              'Simpan Transaksi'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
