'use client'

import { Trash2 } from 'lucide-react'

interface Props {
  message: string
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmModal({ message, onConfirm, onCancel }: Props) {
  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 px-6"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center text-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
            <Trash2 size={22} className="text-rose-500" />
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed">{message}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 h-[42px] rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-sm font-medium"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 h-[42px] rounded-xl bg-rose-500 text-white text-sm font-semibold"
          >
            Hapus
          </button>
        </div>
      </div>
    </div>
  )
}
