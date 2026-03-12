'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, ArrowLeftRight, Split } from 'lucide-react'
import TransactionForm from '@/components/TransactionForm'

type Mode = 'expense' | 'income' | 'split' | 'transfer'

interface Props {
  onSuccess?: () => void
}

export default function QuickActions({ onSuccess }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<Mode>('expense')

  function openWith(m: Mode) {
    setMode(m)
    setOpen(true)
  }

  function handleSuccess() {
    if (onSuccess) onSuccess()
    else router.refresh()
  }

  return (
    <>
      <div className="grid grid-cols-4 gap-2 px-4">
        <button
          onClick={() => openWith('expense')}
          className="flex flex-col items-center gap-1.5 bg-rose-50 dark:bg-rose-900/40 rounded-2xl py-3 px-1 hover:bg-rose-100 dark:hover:bg-rose-800/40 active:scale-95 transition-all"
        >
          <div className="w-9 h-9 rounded-full bg-rose-500 dark:bg-rose-800 flex items-center justify-center">
            <Plus size={18} className="text-white" />
          </div>
          <span className="text-xs font-medium text-rose-700 dark:text-rose-300">Keluar</span>
        </button>

        <button
          onClick={() => openWith('income')}
          className="flex flex-col items-center gap-1.5 bg-emerald-50 dark:bg-emerald-900/40 rounded-2xl py-3 px-1 hover:bg-emerald-100 dark:hover:bg-emerald-800/40 active:scale-95 transition-all"
        >
          <div className="w-9 h-9 rounded-full bg-emerald-500 dark:bg-emerald-800 flex items-center justify-center">
            <Plus size={18} className="text-white" />
          </div>
          <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">Masuk</span>
        </button>

        <button
          onClick={() => openWith('split')}
          className="flex flex-col items-center gap-1.5 bg-purple-50 dark:bg-purple-900/40 rounded-2xl py-3 px-1 hover:bg-purple-100 dark:hover:bg-purple-800/40 active:scale-95 transition-all"
        >
          <div className="w-9 h-9 rounded-full bg-purple-500 dark:bg-purple-800 flex items-center justify-center">
            <Split size={16} className="text-white" />
          </div>
          <span className="text-xs font-medium text-purple-700 dark:text-purple-300">Split</span>
        </button>

        <button
          onClick={() => openWith('transfer')}
          className="flex flex-col items-center gap-1.5 bg-blue-50 dark:bg-blue-900/40 rounded-2xl py-3 px-1 hover:bg-blue-100 dark:hover:bg-blue-800/40 active:scale-95 transition-all"
        >
          <div className="w-9 h-9 rounded-full bg-blue-500 dark:bg-blue-800 flex items-center justify-center">
            <ArrowLeftRight size={16} className="text-white" />
          </div>
          <span className="text-xs font-medium text-blue-700 dark:text-blue-300">Transfer</span>
        </button>
      </div>

      {open && (
        <TransactionForm
          defaultMode={mode}
          onClose={() => setOpen(false)}
          onSuccess={() => {
            setOpen(false)
            handleSuccess()
          }}
        />
      )}
    </>
  )
}
