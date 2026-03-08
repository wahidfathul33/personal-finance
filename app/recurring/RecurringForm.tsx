'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { addRecurringTemplate, updateRecurringTemplate } from '@/actions/recurring'
import type { RecurringTemplate, AddRecurringTemplateInput, PersonId, TransactionType, SplitType } from '@/lib/types'
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, PEOPLE } from '@/lib/constants'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

const SPLIT_OPTIONS: { value: SplitType; label: string }[] = [
  { value: 'equal', label: '50/50 (Bersama)' },
  { value: 'full_mas', label: 'Full → Mas' },
  { value: 'full_fita', label: 'Full → Fita' },
  { value: 'custom', label: 'Custom %' },
]

interface Props {
  template?: RecurringTemplate
}

export default function RecurringForm({ template }: Props) {
  const router = useRouter()
  const isEdit = !!template
  const [isPending, startTransition] = useTransition()

  const [name, setName] = useState(template?.name ?? '')
  const [type, setType] = useState<TransactionType>(template?.type ?? 'expense')
  const [categoryId, setCategoryId] = useState(template?.category_id ?? '')
  const [personId, setPersonId] = useState<PersonId | ''>(template?.person_id ?? '')
  const [amount, setAmount] = useState(String(template?.amount ?? ''))
  const [dayOfMonth, setDayOfMonth] = useState(String(template?.day_of_month ?? '1'))
  const [splitType, setSplitType] = useState<SplitType>(template?.split_type ?? 'equal')
  const [splitRatioMas, setSplitRatioMas] = useState(String(template?.split_ratio_mas ?? '50'))
  const [splitRatioFita, setSplitRatioFita] = useState(String(template?.split_ratio_fita ?? '50'))
  const [note, setNote] = useState(template?.note ?? '')

  const usePersonSelector = splitType === 'full_mas' || splitType === 'full_fita'
  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name || !amount) return

    const input: AddRecurringTemplateInput = {
      name,
      type,
      category_id: categoryId,
      person_id: usePersonSelector ? (splitType === 'full_mas' ? 'mas' : 'fita') : null,
      amount: parseFloat(amount),
      day_of_month: parseInt(dayOfMonth),
      split_type: splitType,
      split_ratio_mas: parseFloat(splitRatioMas),
      split_ratio_fita: parseFloat(splitRatioFita),
      note,
    }

    startTransition(async () => {
      try {
        if (isEdit) {
          await updateRecurringTemplate(template!.id, input)
        } else {
          await addRecurringTemplate(input)
        }
        router.push('/recurring')
      } catch {
        alert('Gagal menyimpan')
      }
    })
  }

  return (
    <div>
      <div className="flex items-center gap-3 px-4 pt-10 pb-4">
        <Link href="/recurring" className="text-gray-600">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-xl font-bold text-gray-900">
          {isEdit ? 'Edit Template' : 'Template Baru'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="px-4 space-y-4 pb-8">
        {/* Name */}
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">Nama</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="cth: Spotify, Internet, Gaji..."
            required
            className="w-full border border-gray-200 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Type */}
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">Tipe</label>
          <div className="flex gap-2">
            {(['expense', 'income'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => { setType(t); setCategoryId('') }}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-colors ${
                  type === t
                    ? t === 'expense'
                      ? 'bg-rose-500 text-white border-rose-500'
                      : 'bg-emerald-500 text-white border-emerald-500'
                    : 'bg-white text-gray-700 border-gray-200'
                }`}
              >
                {t === 'expense' ? '− Pengeluaran' : '+ Pemasukan'}
              </button>
            ))}
          </div>
        </div>

        {/* Amount */}
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">Nominal</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">Rp</span>
            <input
              type="number"
              inputMode="numeric"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              required
              className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Day of Month */}
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">Tanggal setiap bulan</label>
          <input
            type="number"
            min="1"
            max="31"
            value={dayOfMonth}
            onChange={(e) => setDayOfMonth(e.target.value)}
            className="w-full border border-gray-200 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Split Type */}
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">Pembagian</label>
          <div className="grid grid-cols-2 gap-2">
            {SPLIT_OPTIONS.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => setSplitType(value)}
                className={`py-2.5 rounded-xl text-sm font-medium border transition-colors ${
                  splitType === value
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-gray-700 border-gray-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          {splitType === 'custom' && (
            <div className="flex gap-2 mt-2">
              <div className="flex-1">
                <label className="text-xs text-gray-500 mb-1 block">Mas %</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={splitRatioMas}
                  onChange={(e) => {
                    setSplitRatioMas(e.target.value)
                    setSplitRatioFita(String(100 - parseFloat(e.target.value || '0')))
                  }}
                  className="w-full border border-gray-200 rounded-xl py-2 px-3 text-sm focus:outline-none"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs text-gray-500 mb-1 block">Fita %</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={splitRatioFita}
                  onChange={(e) => {
                    setSplitRatioFita(e.target.value)
                    setSplitRatioMas(String(100 - parseFloat(e.target.value || '0')))
                  }}
                  className="w-full border border-gray-200 rounded-xl py-2 px-3 text-sm focus:outline-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Category */}
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">Kategori</label>
          <div className="grid grid-cols-4 gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategoryId(cat.id)}
                className={`flex flex-col items-center gap-0.5 py-2 rounded-xl border text-xs transition-colors ${
                  categoryId === cat.id
                    ? 'bg-indigo-50 border-indigo-400 text-indigo-700'
                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span className="text-base">{cat.icon}</span>
                <span className="leading-tight text-center">{cat.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Note */}
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">Catatan</label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Opsional..."
            className="w-full border border-gray-200 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-semibold text-sm disabled:opacity-50"
        >
          {isPending ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Tambah Template'}
        </button>
      </form>
    </div>
  )
}
