'use client'

import { ArrowLeftRight } from 'lucide-react'
import type { Person } from '@/lib/types'

interface Props {
  persons: Person[]
  fromPersonId: string
  setFromPersonId: (id: string) => void
  toPersonId: string
  setToPersonId: (id: string) => void
}

export default function TransactionFormTransferFields({
  persons,
  fromPersonId,
  setFromPersonId,
  toPersonId,
  setToPersonId,
}: Props) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1">
        <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">Dari</label>
        <select
          value={fromPersonId}
          onChange={(e) => setFromPersonId(e.target.value)}
          className="w-full border border-gray-200 dark:border-gray-700 rounded-xl h-[40px] px-3 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {persons.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>
      <button
        type="button"
        onClick={() => {
          const tmp = fromPersonId
          setFromPersonId(toPersonId)
          setToPersonId(tmp)
        }}
        className="mt-5 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 hover:text-indigo-600 transition-colors flex-shrink-0"
      >
        <ArrowLeftRight size={14} />
      </button>
      <div className="flex-1">
        <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">Ke</label>
        <select
          value={toPersonId}
          onChange={(e) => setToPersonId(e.target.value)}
          className="w-full border border-gray-200 dark:border-gray-700 rounded-xl h-[40px] px-3 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {persons.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>
    </div>
  )
}
