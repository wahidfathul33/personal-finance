'use client'

import type { Dispatch, SetStateAction } from 'react'
import { PERSON_COLORS } from '@/lib/constants'
import type { Person } from '@/lib/types'

interface Props {
  persons: Person[]
  splitAmounts: Record<string, string>
  setSplitAmounts: Dispatch<SetStateAction<Record<string, string>>>
  splitType: 'equal' | 'custom'
  setSplitType: (val: 'equal' | 'custom') => void
  totalAmount: number
}

export default function TransactionFormSplitFields({
  persons,
  splitAmounts,
  setSplitAmounts,
  splitType,
  setSplitType,
  totalAmount,
}: Props) {
  return (
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
            {t === 'equal' ? 'Rata' : 'Custom'}
          </button>
        ))}
      </div>
      <div className="space-y-2">
        {persons.map((p) => (
          <div key={p.id} className="flex items-center gap-2">
            <span className={`text-xs px-2 py-1 rounded-full font-medium w-20 text-center ${
              PERSON_COLORS[p.color]?.badge ?? PERSON_COLORS.indigo.badge
            }`}>{p.name}</span>
            <input
              type="text"
              inputMode="numeric"
              value={splitAmounts[p.id] ? (splitAmounts[p.id] ?? '').replace(/\B(?=(\d{3})+(?!\d))/g, '.') : ''}
              onChange={(e) => {
                setSplitType('custom')
                setSplitAmounts((prev) => ({ ...prev, [p.id]: e.target.value.replace(/\D/g, '') }))
              }}
              readOnly={splitType === 'equal'}
              placeholder="0"
              className="flex-1 border border-gray-200 dark:border-gray-700 rounded-xl py-2 px-3 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 read-only:bg-gray-50 dark:read-only:bg-gray-700"
            />
          </div>
        ))}
      </div>
      {splitType === 'equal' && totalAmount > 0 && (
        <p className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2">
          {persons.length > 0
            ? persons.map((p) => `${p.name}: Rp ${(splitAmounts[p.id] ? parseInt(splitAmounts[p.id]).toLocaleString('id-ID') : '0')}`).join(' · ')
            : ''}
        </p>
      )}
    </div>
  )
}
