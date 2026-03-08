'use client'

import { useState, useTransition } from 'react'
import { toggleRecurringTemplate, deleteRecurringTemplate } from '@/actions/recurring'
import type { RecurringTemplate } from '@/lib/types'
import { formatCurrency } from '@/lib/constants'
import { Trash2, ToggleLeft, ToggleRight, Edit } from 'lucide-react'
import Link from 'next/link'

const SPLIT_TYPE_LABELS: Record<string, string> = {
  equal: '50/50',
  custom: 'Custom',
  full_mas: 'Full Mas',
  full_fita: 'Full Fita',
  none: '-',
}

const TYPE_COLORS: Record<string, string> = {
  income: 'text-emerald-600 bg-emerald-50',
  expense: 'text-rose-600 bg-rose-50',
  transfer: 'text-blue-600 bg-blue-50',
}

interface Props {
  templates: RecurringTemplate[]
}

export default function RecurringList({ templates: initial }: Props) {
  const [templates, setTemplates] = useState(initial)
  const [isPending, startTransition] = useTransition()

  function handleToggle(id: string, active: boolean) {
    startTransition(async () => {
      await toggleRecurringTemplate(id, !active)
      setTemplates((prev) =>
        prev.map((t) => (t.id === id ? { ...t, active: !active } : t))
      )
    })
  }

  function handleDelete(id: string) {
    if (!confirm('Hapus template ini?')) return
    startTransition(async () => {
      await deleteRecurringTemplate(id)
      setTemplates((prev) => prev.filter((t) => t.id !== id))
    })
  }

  if (templates.length === 0) {
    return (
      <div className="text-center py-16 px-4">
        <p className="text-4xl mb-3">🔄</p>
        <p className="text-gray-500 text-sm">Belum ada template berulang</p>
        <Link
          href="/recurring/new"
          className="inline-block mt-4 bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-xl"
        >
          Tambah Template
        </Link>
      </div>
    )
  }

  return (
    <div className="px-4 flex flex-col gap-3 pb-8">
      {templates.map((t) => (
        <div
          key={t.id}
          className={`bg-white rounded-2xl border border-gray-100 p-4 ${
            !t.active ? 'opacity-50' : ''
          }`}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="font-semibold text-gray-900 text-sm">{t.name}</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    TYPE_COLORS[t.type]
                  }`}
                >
                  {t.type === 'income' ? 'Masuk' : t.type === 'expense' ? 'Keluar' : 'Transfer'}
                </span>
              </div>
              <p className="text-base font-bold text-gray-800">
                {formatCurrency(t.amount)}
              </p>
              <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                <span className="text-xs text-gray-400">
                  Setiap tgl {t.day_of_month}
                </span>
                {t.person_id ? (
                  <span className="text-xs text-gray-400">
                    {t.person_id === 'mas' ? 'Mas' : 'Fita'}
                  </span>
                ) : (
                  <span className="text-xs text-gray-400">
                    Split: {SPLIT_TYPE_LABELS[t.split_type]}
                  </span>
                )}
                {t.category?.name && (
                  <span className="text-xs text-gray-400">
                    {t.category.icon} {t.category.name}
                  </span>
                )}
              </div>
              {t.note && (
                <p className="text-xs text-gray-400 mt-1 line-clamp-1">{t.note}</p>
              )}
            </div>

            <div className="flex flex-col items-end gap-2">
              <button
                onClick={() => handleToggle(t.id, t.active)}
                disabled={isPending}
                className="text-gray-400 hover:text-indigo-600 transition-colors"
              >
                {t.active ? (
                  <ToggleRight size={24} className="text-indigo-600" />
                ) : (
                  <ToggleLeft size={24} />
                )}
              </button>
              <div className="flex gap-2">
                <Link
                  href={`/recurring/${t.id}/edit`}
                  className="text-gray-400 hover:text-indigo-600 transition-colors"
                >
                  <Edit size={15} />
                </Link>
                <button
                  onClick={() => handleDelete(t.id)}
                  disabled={isPending}
                  className="text-gray-400 hover:text-rose-500 transition-colors"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
