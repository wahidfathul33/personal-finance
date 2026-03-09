'use client'

import { useState, useTransition } from 'react'
import { toggleRecurringTemplate, deleteRecurringTemplate } from '@/actions/recurring'
import type { RecurringTemplate } from '@/lib/types'
import { formatCurrency, PERSON_COLORS } from '@/lib/constants'
import { Trash2, ToggleLeft, ToggleRight, Edit } from 'lucide-react'
import Link from 'next/link'
import ConfirmModal from '@/components/ConfirmModal'

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
  const [confirmId, setConfirmId] = useState<string | null>(null)

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
    <div className="px-4 space-y-3 pb-8">
      {templates.map((t) => {
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
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    Tgl {t.day_of_month}{t.category_id ? ` · ${t.category_id}` : ''}
                  </span>
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
