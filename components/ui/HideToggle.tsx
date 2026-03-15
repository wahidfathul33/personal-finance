'use client'

import { Eye, EyeOff } from 'lucide-react'
import { useHideAmounts } from '@/lib/HideAmountsContext'

interface Props {
  className?: string
}

export default function HideToggle({ className }: Props) {
  const { hidden, toggle } = useHideAmounts()
  return (
    <button
      onClick={toggle}
      className={`w-9 h-9 flex items-center justify-center rounded-full transition-colors ${
        className ?? 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
      }`}
    >
      {hidden ? <EyeOff size={17} /> : <Eye size={17} />}
    </button>
  )
}
