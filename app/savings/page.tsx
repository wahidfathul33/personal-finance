import { getSavingsSummary } from '@/actions/savings'
import { getPersons } from '@/actions/persons'
import PageHeader from '@/components/PageHeader'
import SavingsClient from './SavingsClient'
import { formatCurrency, PERSON_COLORS } from '@/lib/constants'
import type { Saving } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function SavingsPage() {
  let summary = { byPerson: {} as Record<string, number>, total: 0, items: [] as Saving[] }
  let persons: { id: string; name: string; color: string; sort_order: number; created_at: string }[] = []

  try {
    ;[summary, persons] = await Promise.all([getSavingsSummary(), getPersons()])
  } catch {}

  return (
    <div className="flex flex-col h-[calc(100dvh-80px)]">
      <PageHeader title="Tabungan" subtitle="Rekap tabungan bersama" />

      {/* Summary Cards */}
      <div
        className="grid grid-cols-2 gap-3 ps-4 pe-4 mb-3"
      >
        {persons.map((p) => {
          const colors = PERSON_COLORS[p.color] ?? PERSON_COLORS.indigo
          return (
            <div key={p.id} className={`${colors.card.bg} rounded-2xl p-3`}>
              <p className={`text-xs mb-1 ${colors.card.label}`}>{p.name}</p>
              <p className={`text-lg font-bold ${colors.card.value}`}>
                {formatCurrency(summary.byPerson[p.name] ?? 0)}
              </p>
            </div>
          )
        })}
      </div>
      <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-4 ms-4 me-4 mb-3">
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mb-1">Total</p>
          <p className="text-lg font-bold text-emerald-700 dark:text-emerald-300">
            {formatCurrency(summary.total)}
          </p>
      </div>

      <SavingsClient items={summary.items} className="flex-1 min-h-0" />
    </div>
  )
}
