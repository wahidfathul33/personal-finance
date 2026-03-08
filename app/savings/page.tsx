import { getSavingsSummary } from '@/actions/savings'
import PageHeader from '@/components/PageHeader'
import SavingsClient from './SavingsClient'
import { formatCurrency } from '@/lib/constants'
import type { Saving } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function SavingsPage() {
  let summary = { mas: 0, fita: 0, total: 0, items: [] as Saving[] }
  try {
    summary = await getSavingsSummary()
  } catch {}

  return (
    <div>
      <PageHeader title="Tabungan" subtitle="Rekap tabungan bersama" />

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3 px-4 mb-5">
        <div className="bg-blue-50 rounded-2xl p-3 text-center">
          <p className="text-[10px] text-blue-500 font-medium mb-0.5">Mas</p>
          <p className="text-sm font-bold text-blue-700">
            {formatCurrency(summary.mas)}
          </p>
        </div>
        <div className="bg-pink-50 rounded-2xl p-3 text-center">
          <p className="text-[10px] text-pink-500 font-medium mb-0.5">Fita</p>
          <p className="text-sm font-bold text-pink-700">
            {formatCurrency(summary.fita)}
          </p>
        </div>
        <div className="bg-indigo-50 rounded-2xl p-3 text-center">
          <p className="text-[10px] text-indigo-500 font-medium mb-0.5">Total</p>
          <p className="text-sm font-bold text-indigo-700">
            {formatCurrency(summary.total)}
          </p>
        </div>
      </div>

      <SavingsClient items={summary.items} />
    </div>
  )
}
