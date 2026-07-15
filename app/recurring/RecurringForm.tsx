'use client'

import { useState, useTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { addRecurringTemplate, updateRecurringTemplate } from '@/actions/recurring'
import type { RecurringTemplate, AddRecurringTemplateInput, TransactionType, Person } from '@/lib/types'
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, PERSON_COLORS, getCategoryIcon } from '@/lib/constants'
import { usePersons } from '@/lib/usePersons'
import { ArrowLeft, Wallet, Building2, Loader2, X } from 'lucide-react'
import Link from 'next/link'

interface Props {
  template?: RecurringTemplate
  onClose?: () => void
}

export default function RecurringForm({ template, onClose }: Props) {
  const router = useRouter()
  const isEdit = !!template
  const [isPending, startTransition] = useTransition()
  const persons = usePersons()

  const [name, setName] = useState(template?.name ?? '')
  const [type, setType] = useState<TransactionType>(template?.type ?? 'expense')
  const [categoryId, setCategoryId] = useState(template?.category_id ?? '')
  const [personId, setPersonId] = useState<string>(template?.person_id ?? '')
  const [amount, setAmount] = useState(String(template?.amount ?? ''))
  const [dayOfMonth, setDayOfMonth] = useState(String(template?.day_of_month ?? '1'))
  const [note, setNote] = useState(template?.note ?? '')
  const [source, setSource] = useState<'balance' | 'savings'>(template?.source ?? 'balance')

  useEffect(() => {
    if (persons.length > 0 && !personId) setPersonId(persons[0].id)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [persons])

  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name || !amount) return

    const input: AddRecurringTemplateInput = {
      name,
      type,
      category_id: categoryId,
      person_id: personId || null,
      amount: parseFloat(amount),
      day_of_month: parseInt(dayOfMonth),
      note,
      source,
    }

    startTransition(async () => {
      try {
        if (isEdit) await updateRecurringTemplate(template!.id, input)
        else await addRecurringTemplate(input)
        if (onClose) onClose()
        else router.push('/recurring')
      } catch {
        alert('Gagal menyimpan')
      }
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-end justify-center" onClick={(e) => { if (e.target === e.currentTarget) onClose?.() }}>
      <div className="bg-white dark:bg-gray-900 w-full max-w-lg mx-auto max-h-[90vh] flex flex-col rounded-t-3xl shadow-2xl z-[80]">
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 pb-3 flex-shrink-0">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{isEdit ? 'Edit Template' : 'Template Baru'}</h3>
          <button
            onClick={() => onClose ? onClose() : router.push('/recurring')}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable form */}
        <form id="recurring-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-4 space-y-4 pb-20">
          {/* Name */}
          <div>
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">Nama</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="cth: Spotify, Internet, Gaji..."
              required
              className="w-full border border-gray-200 dark:border-gray-700 rounded-xl py-2.5 px-3 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-base-500"
            />
          </div>

          {/* Type */}
          <div>
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">Tipe</label>
            <div className="flex gap-2">
              {(['expense', 'income'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => { setType(t); setCategoryId('') }}
                  className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-colors ${
                    type === t
                      ? t === 'expense' ? 'bg-rose-500 text-white border-rose-500' : 'bg-emerald-500 text-white border-emerald-500'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700'
                  }`}
                >
                  {t === 'expense' ? '− Pengeluaran' : '+ Pemasukan'}
                </button>
              ))}
            </div>
          </div>

          {/* Source */}
          {type !== 'transfer' && (
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">
                {type === 'expense' ? 'Dari' : 'Ke'}
              </label>
              <div className="flex gap-2">
                {(['balance', 'savings'] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSource(s)}
                    className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-colors ${
                      source === s
                        ? 'bg-base-600 text-white border-base-600'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    {s === 'balance' ? <><Wallet size={14} className="inline" /> Saldo</> : <><Building2 size={14} className="inline" /> Tabungan</>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Amount */}
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

          {/* Day of Month */}
          <div>
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">Tanggal setiap bulan</label>
            <input
              type="number"
              min="1"
              max="31"
              value={dayOfMonth}
              onChange={(e) => setDayOfMonth(e.target.value)}
              className="w-full border border-gray-200 dark:border-gray-700 rounded-xl py-2.5 px-3 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-base-500"
            />
          </div>

          {/* Person */}
          {persons.length > 0 && (
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">Orang</label>
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
            </div>
          )}

          {/* Category */}
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

          {/* Note */}
          <div>
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">Catatan</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Opsional..."
              className="w-full border border-gray-200 dark:border-gray-700 rounded-xl py-2.5 px-3 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-base-500"
            />
          </div>
        </form>

        {/* Sticky Save Button */}
        <div className="px-4 pt-3 pb-20 bg-white dark:bg-gray-900 flex-shrink-0 border-t border-gray-100 dark:border-gray-800">
          <div className="flex gap-2">
            <button
              type="submit"
              form="recurring-form"
              disabled={isPending || !name || !amount}
              className="flex-1 btn-base h-[48px] rounded-xl font-semibold text-sm flex items-center justify-center gap-2 bg-base-600 text-white hover:bg-base-700 disabled:opacity-50 transition-colors"
            >
              {isPending ? (
                <>
                  <Loader2 className="animate-spin h-4 w-4" />
                  Menyimpan...
                </>
              ) : isEdit ? 'Simpan Perubahan' : 'Tambah Template'}
            </button>
            <button
              type="button"
              onClick={onClose ? () => onClose() : () => router.push('/recurring')}
              className="flex-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 h-[48px] rounded-xl font-semibold text-sm border border-gray-200 dark:border-gray-700 transition-colors hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              Batal
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
