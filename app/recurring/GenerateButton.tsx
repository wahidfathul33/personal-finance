'use client'

import { useTransition } from 'react'
import { generateRecurringTransactions } from '@/actions/recurring'
import { RefreshCw } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/Toast'

export default function GenerateButton() {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const { toast } = useToast()

  function handleGenerate() {
    startTransition(async () => {
      try {
        await generateRecurringTransactions()
        toast('Transaksi berhasil di-generate')
        router.refresh()
      } catch {
        toast('Gagal generate transaksi', 'error')
      }
    })
  }

  return (
    <button
      onClick={handleGenerate}
      disabled={isPending}
      title="Generate transaksi bulan ini"
      className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
    >
      <RefreshCw size={15} className={isPending ? 'animate-spin' : ''} />
    </button>
  )
}
