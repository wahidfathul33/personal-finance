'use client'

interface Props {
  message: string
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmModal({ message, onConfirm, onCancel }: Props) {
  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 px-6"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-xs bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-lg ring-1 ring-black/10 dark:ring-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-sm text-gray-700 dark:text-gray-200 text-center mb-4 leading-relaxed">{message}</p>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 h-9 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-200 text-sm font-medium"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 h-9 rounded-xl bg-rose-500 text-white text-sm font-semibold"
          >
            Hapus
          </button>
        </div>
      </div>
    </div>
  )
}
