import { getAssetsSummary } from '@/actions/assets'
import { getPiutang } from '@/actions/piutang'
import { getPersons } from '@/actions/persons'
import PageHeader from '@/components/layout/PageHeader'
import AssetsClient from './AssetsClient'
import type { Piutang, Person } from '@/lib/types'
import HideToggle from '@/components/ui/HideToggle'

export const dynamic = 'force-dynamic'

export default async function AssetsPage() {
  let summary = { assets: [], goldAssets: [], lmAssets: [], jewelryAssets: [], depositAssets: [], totalGrams: 0, totalLmGrams: 0, totalJewelryGrams: 0, pricePerGram: 0, jewelryPricePerGram: 0, totalGoldValue: 0, totalDepositValue: 0, goldPrice: null } as Awaited<ReturnType<typeof getAssetsSummary>>
  let piutangList: Piutang[] = []
  let persons: Person[] = []
  try {
    summary = await getAssetsSummary()
  } catch {}
  try {
    piutangList = await getPiutang()
  } catch {}
  try {
    persons = await getPersons()
  } catch {}

  return (
    <div>
      <PageHeader title="Aset" subtitle="Emas & Kekayaan" right={<HideToggle />} />
      <AssetsClient summary={summary} piutangList={piutangList} persons={persons} />
    </div>
  )
}
