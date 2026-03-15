import { getAssetsSummary } from '@/actions/assets'
import { getPiutang } from '@/actions/piutang'
import PageHeader from '@/components/layout/PageHeader'
import AssetsClient from './AssetsClient'
import type { Piutang } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function AssetsPage() {
  let summary = { assets: [], goldAssets: [], lmAssets: [], jewelryAssets: [], depositAssets: [], totalGrams: 0, totalLmGrams: 0, totalJewelryGrams: 0, pricePerGram: 0, jewelryPricePerGram: 0, totalGoldValue: 0, totalDepositValue: 0, goldPrice: null } as Awaited<ReturnType<typeof getAssetsSummary>>
  let piutangList: Piutang[] = []
  try {
    summary = await getAssetsSummary()
  } catch {}
  try {
    piutangList = await getPiutang()
  } catch {}

  return (
    <div>
      <PageHeader title="Aset" subtitle="Emas & Kekayaan" />
      <AssetsClient summary={summary} piutangList={piutangList} />
    </div>
  )
}
