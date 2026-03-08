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
    <div>
      <PageHeader title="Tabungan" subtitle="Rekap tabungan bersama" />

      {/* Summary Cards */}
      <div
        className="grid gap-3 px-4 mb-5"
        style={{ gridTemplateColumns: `repeat(${Math.min(persons.length + 1, 4)}, minmax(0, 1fr))` }}
      >
        {persons.map((p) => {
          const colors = PERSON_COLORS[p.color] ?? PERSON_COLORS.indigo
          return (
            <div key={p.id} className={`${colors.card.bg} rounded-2xl p-3 text-center`}>
              <p className={`text-[10px] font-medium mb-0.5 ${colors.card.label}`}>{p.name}</p>
              <p className={`text-sm font-bold ${colors.card.value}`}>
                {formatCurrency(summary.byPerson[p.name] ?? 0)}
              </p>
            </div>
          )
        })}
        <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl p-3 text-center">
          <p className="text-[10px] text-indigo-500 dark:text-indigo-400 font-medium mb-0.5">Total</p>
          <p className="text-sm font-bold text-indigo-700 dark:text-indigo-300">
            {formatCurrency(summary.total)}
          </p>
        </div>
      </div>

      <SavingsClient items={summary.items} />
    </div>
  )
}
