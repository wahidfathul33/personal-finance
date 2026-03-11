import { getAssetsSummary } from '@/actions/assets'
import PageHeader from '@/components/PageHeader'
import AssetsClient from './AssetsClient'

export const dynamic = 'force-dynamic'

export default async function AssetsPage() {
  let summary = { assets: [], goldAssets: [], lmAssets: [], jewelryAssets: [], depositAssets: [], totalGrams: 0, totalLmGrams: 0, totalJewelryGrams: 0, pricePerGram: 0, jewelryPricePerGram: 0, totalGoldValue: 0, totalDepositValue: 0, goldPrice: null } as Awaited<ReturnType<typeof getAssetsSummary>>
  try {
    summary = await getAssetsSummary()
  } catch {}

  return (
    <div>
      <PageHeader title="Aset" subtitle="Emas & Kekayaan" />
      <AssetsClient summary={summary} />
    </div>
  )
}
