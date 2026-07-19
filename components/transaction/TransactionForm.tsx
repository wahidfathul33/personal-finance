'use client'

import { useState, useTransition, useEffect } from 'react'
import { X, Loader2 } from 'lucide-react'
import { motion, AnimatePresence, useDragControls, type PanInfo } from 'framer-motion'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import TransactionFormExpenseIncomeFields from './TransactionFormExpenseIncomeFields'
import TransactionFormTransferFields from './TransactionFormTransferFields'
import TransactionFormSplitFields from './TransactionFormSplitFields'
import {
  addTransaction,
  addSplitBill,
  addTransfer,
  updateTransaction,
} from '@/actions/transactions'
import { addSaving } from '@/actions/savings'
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, todayISO, getCategoryIcon } from '@/lib/constants'
import { usePersons } from '@/lib/usePersons'
import type {TransactionType, TransactionWithCategory } from '@/lib/types'

type Mode = 'expense' | 'income' | 'split' | 'transfer'

interface Props {
  defaultMode?: Mode
  editTransaction?: TransactionWithCategory
  onClose: () => void
  onSuccess?: () => void
}

export default function TransactionForm({ defaultMode = 'expense', editTransaction, onClose, onSuccess }: Props) {
  const isEdit = !!editTransaction

  const initialMode: Mode = isEdit
    ? editTransaction.type === 'transfer' ? 'transfer'
      : editTransaction.type === 'income' ? 'income'
      : 'expense'
    : defaultMode

  const [mode, setMode] = useState<Mode>(initialMode)
  const [isPending, startTransition] = useTransition()

  // Swipe-down-to-dismiss: drag starts only from the handle, so form inputs
  // and the scrollable body are never hijacked by the gesture.
  const dragControls = useDragControls()
  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.y > 120 || info.velocity.y > 800) onClose()
  }

  const persons = usePersons()

  const [date, setDate] = useState(editTransaction?.date ?? todayISO())
  const [amount, setAmount] = useState(
    editTransaction ? String(Math.abs(editTransaction.amount)) : ''
  )
  const [note, setNote] = useState(editTransaction?.note?.replace(/\[recurring:[^\]]+\]/g, '').trim() ?? '')
  const [categoryId, setCategoryId] = useState(editTransaction?.category_id ?? '')

  const [personId, setPersonId] = useState<string>(editTransaction?.person_id ?? '')

  // Split — per-person amounts keyed by person_id
  const [splitAmounts, setSplitAmounts] = useState<Record<string, string>>({})
  const [splitType, setSplitType] = useState<'equal' | 'custom'>('equal')

  // Transfer
  const [fromPersonId, setFromPersonId] = useState<string>('')
  const [toPersonId, setToPersonId] = useState<string>('')

  // Expense source
  const [savingSource, setSavingSource] = useState<'saldo' | 'tabungan'>('saldo')

  useEffect(() => {
    if (persons.length === 0) return
    if (!personId) setPersonId(persons[0].id)
    if (!fromPersonId) setFromPersonId(persons[0].id)
    if (!toPersonId) setToPersonId(persons.length > 1 ? persons[1].id : persons[0].id)
    if (Object.keys(splitAmounts).length === 0) {
      const init: Record<string, string> = {}
      persons.forEach((p) => { init[p.id] = '' })
      setSplitAmounts(init)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [persons])

  const categories = mode === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES
  const totalAmount = parseFloat(amount) || 0

  function handleSplitEqualChange(val: string) {
    setAmount(val)
    const n = parseFloat(val) || 0
    if (n > 0 && persons.length > 0) {
      const perPerson = Math.round(n / persons.length)
      const newAmounts: Record<string, string> = {}
      persons.forEach((p, i) => {
        newAmounts[p.id] = String(i === persons.length - 1 ? n - perPerson * (persons.length - 1) : perPerson)
      })
      setSplitAmounts(newAmounts)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!amount || !totalAmount) return

    startTransition(async () => {
      try {
        if (isEdit && editTransaction) {
          const signedAmount = mode === 'expense' ? -Math.abs(totalAmount) : Math.abs(totalAmount)
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
            source: mode === 'expense' && savingSource === 'tabungan' ? 'savings' : 'balance',
          })
          if (mode === 'expense' && savingSource === 'tabungan') {
            await addSaving({
              person_id: personId,
              amount: -Math.abs(totalAmount),
              date,
              note: note || `Pengeluaran${categoryId ? ` - ${categoryId}` : ''}`,
            })
          }
        } else if (mode === 'split') {
          const splits = persons.map((p) => ({
            person_id: p.id,
            amount: parseFloat(splitAmounts[p.id] || '0') || 0,
          })).filter((s) => s.amount > 0)
          await addSplitBill({ date, category_id: categoryId, note, splits })
        } else if (mode === 'transfer') {
          await addTransfer({
            date,
            from_person_id: fromPersonId,
            to_person_id: toPersonId,
            amount: totalAmount,
            note,
          })
        }
        onSuccess?.();
        onClose()
      } catch (err) {
        alert('Gagal menyimpan transaksi')
        console.error(err)
      }
    })
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-[60] flex items-end"
        data-swipe-ignore
      >
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          drag="y"
          dragListener={false}
          dragControls={dragControls}
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={{ top: 0, bottom: 0.9 }}
          onDragEnd={handleDragEnd}
          role="dialog"
          aria-modal="true"
          aria-label={isEdit ? 'Edit Transaksi' : 'Tambah Transaksi'}
          className="bg-white dark:bg-gray-900 w-full max-w-lg mx-auto h-[90vh] flex flex-col rounded-t-3xl shadow-2xl z-[80] overflow-hidden"
        >
          {/* Drag handle — draggable zone for swipe-down dismiss */}
          <div
            className="flex justify-center pt-3 pb-1 flex-shrink-0 touch-none cursor-grab active:cursor-grabbing"
            onPointerDown={(e) => dragControls.start(e)}
          >
            <div className="w-10 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-4 pb-3 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {isEdit ? 'Edit Transaksi' : 'Tambah Transaksi'}
            </h2>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Mode Tabs */}
          <div className="flex gap-1 p-3 bg-gray-50 dark:bg-gray-800 flex-shrink-0">
            {(
              [
                { key: 'expense', label: '− Pengeluaran' },
                { key: 'income', label: '+ Pemasukan' },
                ...(!isEdit ? [
                  { key: 'split' as Mode, label: '⚡ Split' },
                  { key: 'transfer' as Mode, label: '↔ Transfer' },
                ] : []),
              ] as { key: Mode; label: string }[]
            ).map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => { if (!isEdit) { setMode(key); setCategoryId(''); setSavingSource('saldo') } }}
                className={`flex-1 text-xs py-2 rounded-lg font-medium transition-all ${
                  mode === key
                    ? 'bg-base-600 text-white shadow-md'
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
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">Rp</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={amount ? amount.replace(/\B(?=(\d{3})+(?!\d))/g, '.') : ''}
                  onChange={(e) =>
                    mode === 'split' ? handleSplitEqualChange(e.target.value.replace(/\D/g, '')) : setAmount(e.target.value.replace(/\D/g, ''))
                  }
                  placeholder="0"
                  required
                  className="w-full pl-10 pr-3 py-3 border border-gray-200 dark:border-gray-700 rounded-xl text-lg font-semibold bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-base-500"
                  autoFocus
                />
              </div>
            </div>

            {/* Person selector + expense source (expense/income) */}
            {(mode === 'expense' || mode === 'income') && (
              <TransactionFormExpenseIncomeFields
                persons={persons}
                personId={personId}
                setPersonId={setPersonId}
                mode={mode}
                savingSource={savingSource}
                setSavingSource={setSavingSource}
              />
            )}

            {/* Transfer persons */}
            {mode === 'transfer' && (
              <TransactionFormTransferFields
                persons={persons}
                fromPersonId={fromPersonId}
                setFromPersonId={setFromPersonId}
                toPersonId={toPersonId}
                setToPersonId={setToPersonId}
              />
            )}

            {/* Split details */}
            {mode === 'split' && (
              <TransactionFormSplitFields
                persons={persons}
                splitAmounts={splitAmounts}
                setSplitAmounts={setSplitAmounts}
                splitType={splitType}
                setSplitType={setSplitType}
                totalAmount={totalAmount}
              />
            )}

            {/* Category */}
            {mode !== 'transfer' && (
              <div>
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">Kategori</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategoryId(cat.id)}
                      className={`flex flex-col items-center gap-0.5 py-2 rounded-xl border text-xs transition-all ${
                        categoryId === cat.id
                          ? 'bg-base-50 dark:bg-base-900/40 border-base-400 text-base-700 dark:text-base-300 shadow-sm'
                          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      {(() => { const Icon = getCategoryIcon(cat.icon); return <Icon size={18} />; })()}
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
                className="w-full border border-gray-200 dark:border-gray-700 rounded-xl h-[40px] px-3 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-base-500"
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
                className="w-full border border-gray-200 dark:border-gray-700 rounded-xl h-[40px] px-3 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-base-500"
              />
            </div>
          </form>

          {/* Sticky Save Button */}
          <div className="px-4 pt-3 pb-20 bg-white dark:bg-gray-900 flex-shrink-0">
            <div className="flex gap-2">
              <button
                type="submit"
                form="txform"
                disabled={isPending || !amount}
                className="flex-1 btn-base h-[48px] rounded-xl font-semibold text-sm flex items-center justify-center gap-2 bg-base-600 text-white hover:bg-base-700 disabled:opacity-50 transition-colors"
              >
                {isPending ? (
                  <>
                    <Loader2 className="animate-spin h-4 w-4" />
                    Menyimpan...
                  </>
                ) : isEdit ? 'Simpan Perubahan' : 'Simpan Transaksi'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 h-[48px] rounded-xl font-semibold text-sm border border-gray-200 dark:border-gray-700 transition-colors hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                Batal
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
