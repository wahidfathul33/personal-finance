import { getTransactions } from '@/actions/transactions'
import { generateRecurringTransactions } from '@/actions/recurring'
import TransactionItem, { TransactionItemSkeleton } from '@/components/transaction/TransactionItem'
import { currentMonth, currentYear } from '@/lib/constants'

export async function RecentSection() {
  const month = currentMonth()
  const year = currentYear()

  await generateRecurringTransactions()
  const recentTx = await getTransactions({ month, year, limit: 5 })

  if (recentTx.length === 0) {
    return <p className="text-center py-8 text-gray-400 text-sm">Belum ada transaksi bulan ini</p>
  }

  return (
    <div className="space-y-2">
      {recentTx.map((tx) => (
        <TransactionItem key={tx.id} transaction={tx} />
      ))}
    </div>
  )
}

export function RecentSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <TransactionItemSkeleton key={i} />
      ))}
    </div>
  )
}
