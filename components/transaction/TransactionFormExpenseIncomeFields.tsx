'use client'

import { PERSON_COLORS } from '@/lib/constants'
import type { Person } from '@/lib/types'

interface Props {
  persons: Person[]
  personId: string
  setPersonId: (id: string) => void
  mode: 'expense' | 'income'
  savingSource: 'saldo' | 'tabungan'
  setSavingSource: (src: 'saldo' | 'tabungan') => void
}

export default function TransactionFormExpenseIncomeFields({
  persons,
  personId,
  setPersonId,
  mode,
  savingSource,
  setSavingSource,
}: Props) {
  return (
    <>
      {/* Person selector */}
      <div>
        <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">Siapa</label>
        <div className="flex flex-wrap gap-2">
          {persons.map((p) => {
            const colors = PERSON_COLORS[p.color] ?? PERSON_COLORS.indigo
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setPersonId(p.id)}
                className={`flex-1 min-w-[80px] py-2 rounded-xl text-sm font-medium border transition-colors ${
                  personId === p.id
                    ? colors.button
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                {p.name}
              </button>
            )
          })}
        </div>
      </div>

      {/* Expense source: Saldo or Tabungan */}
      {mode === 'expense' && (
        <div>
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">Sumber Dana</label>
          <div className="flex gap-2">
            {(['saldo', 'tabungan'] as const).map((src) => (
              <button
                key={src}
                type="button"
                onClick={() => setSavingSource(src)}
                className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-colors ${
                  savingSource === src
                    ? src === 'tabungan'
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                {src === 'saldo' ? '💳 Saldo' : '🏦 Tabungan'}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
