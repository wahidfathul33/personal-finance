import { getSavingsSummary } from '@/actions/savings'
import { getPersons } from '@/actions/persons'
import PageHeader from '@/components/layout/PageHeader'
import SavingsClient from './SavingsClient'
import type { Saving } from '@/lib/types'
import HideToggle from '@/components/ui/HideToggle'

export const dynamic = 'force-dynamic'

export default async function SavingsPage() {
  let summary = { byPerson: {} as Record<string, number>, total: 0, items: [] as Saving[] }
  let persons: { id: string; name: string; color: string; sort_order: number; created_at: string }[] = []

  try {
    ;[summary, persons] = await Promise.all([getSavingsSummary(), getPersons()])
  } catch {}

  return (
    <div>
      <PageHeader title="Tabungan" subtitle="Rekap tabungan bersama" right={<HideToggle />} />

      <SavingsClient items={summary.items} />
    </div>
  )
}
