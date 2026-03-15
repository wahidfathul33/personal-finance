'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Copy, Trash2, ChevronDown, Pencil } from 'lucide-react'
import type { TransactionWithCategory } from '@/lib/types'
import { formatCurrency, formatDate, PERSON_COLORS } from '@/lib/constants'
import { duplicateTransaction, deleteTransaction } from '@/actions/transactions'
import TransactionForm from './TransactionForm'
import ConfirmModal from '@/components/ui/ConfirmModal'

interface Props {
  transaction: TransactionWithCategory
  showPerson?: boolean
  onSuccess?: () => void
}

export default function TransactionItem({ transaction, showPerson = true, onSuccess }: Props) {
  const router = useRouter()
  const [expanded, setExpanded] = useState(false)
  const [loading, setLoading] = useState(false)
  const [deleted, setDeleted] = useState(false)
  const [editing, setEditing] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const isPositive = transaction.amount >= 0
  const amountColor = isPositive ? 'text-emerald-600' : 'text-rose-500'

  const color = transaction.person?.color ?? 'indigo'
  const badgeClass = PERSON_COLORS[color]?.badge ?? PERSON_COLORS.indigo.badge

  async function handleDuplicate() {
    setLoading(true)
    try {
      await duplicateTransaction(transaction)
      setExpanded(false)
      if (onSuccess) onSuccess()
      else router.refresh()
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    setLoading(true)
    try {
      await deleteTransaction(transaction.id)
      setDeleted(true)
      if (onSuccess) onSuccess()
      else router.refresh()
    } finally {
      setLoading(false)
    }
  }

  if (deleted) return null

  return (
    <>
    {showConfirm && (
      <ConfirmModal
        message="Hapus transaksi ini?"
        onConfirm={() => { setShowConfirm(false); handleDelete() }}
        onCancel={() => setShowConfirm(false)}
      />
    )}
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
      <button
        className="w-full flex items-center gap-3 p-3 text-left"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0 text-lg">
          {transaction.category?.icon ?? '📌'}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">
              {transaction.category?.name ?? transaction.category_id ?? 'Lainnya'}
            </span>
            {showPerson && transaction.person && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${badgeClass}`}>
                {transaction.person.name}
              </span>
            )}
            {transaction.group_id && transaction.type !== 'transfer' && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300 font-medium">
                split
              </span>
            )}
            {transaction.type === 'transfer' && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 font-medium">
                transfer
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 dark:text-gray-500">{formatDate(transaction.date)}</span>
            {transaction.note && (
              <span className="text-xs text-gray-400 dark:text-gray-500 truncate">
                {transaction.note.replace(/\[recurring:[^\]]+\]/g, '').trim()}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          <span className={`text-sm font-semibold ${amountColor}`}>
            {isPositive ? '+' : ''}{formatCurrency(transaction.amount)}
          </span>
          <ChevronDown
            size={14}
            className={`text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
          />
        </div>
      </button>

      {expanded && (
        <div className="flex border-t border-gray-100 dark:border-gray-700">
          <button
            onClick={() => { setEditing(true); setExpanded(false) }}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 text-xs icon-btn-base transition-colors"
          >
            <Pencil size={13} />
            Edit
          </button>
          <div className="w-px bg-gray-100 dark:bg-gray-700" />
          <button
            onClick={handleDuplicate}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <Copy size={13} />
            Duplikat
          </button>
          <div className="w-px bg-gray-100 dark:bg-gray-700" />
          <button
            onClick={() => setShowConfirm(true)}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 text-xs text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
          >
            <Trash2 size={13} />
            Hapus
          </button>
        </div>
      )}

      {editing && (
        <TransactionForm
          editTransaction={transaction}
          onClose={() => setEditing(false)}
          onSuccess={() => {
            setEditing(false)
            if (onSuccess) onSuccess()
            else router.refresh()
          }}
        />
      )}
    </div>
    </>
  )
}

export function TransactionItemSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-3 flex items-center gap-3">
      <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0 shimmer-dark" />
      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex items-center gap-2">
          <div className="h-3.5 w-24 rounded-full bg-gray-200 dark:bg-gray-700 shimmer-dark" />
          <div className="h-3 w-12 rounded-full bg-gray-100 dark:bg-gray-700/60 shimmer-dark" />
        </div>
        <div className="h-3 w-16 rounded-full bg-gray-100 dark:bg-gray-700/60 shimmer-dark" />
      </div>
      <div className="h-4 w-16 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0 shimmer-dark" />
    </div>
  )
}
