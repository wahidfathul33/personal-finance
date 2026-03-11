import { getAllBalances } from '@/actions/balances'
import { formatCurrency, currentMonth, currentYear } from '@/lib/constants'

export async function BalancesSection() {
  const month = currentMonth()
  const year = currentYear()
  const balances = await getAllBalances(month, year)

  return (
    <>
      <div className="grid grid-cols-2 gap-3 mb-3">
        {balances.people.map((p) => (
          <div key={p.id} className="bg-white/10 rounded-2xl p-3">
            <p className="text-base-200 text-xs mb-1">{p.name}</p>
            <p className={`text-lg font-bold ${p.amount >= 0 ? 'text-white' : 'text-rose-300'}`}>
              {formatCurrency(p.amount)}
            </p>
          </div>
        ))}
      </div>
      <div className="bg-white/10 rounded-2xl p-3">
        <p className="text-base-200 text-xs mb-1">Total Bersama</p>
        <p className={`text-xl font-bold ${balances.total >= 0 ? 'text-white' : 'text-rose-300'}`}>
          {formatCurrency(balances.total)}
        </p>
      </div>
    </>
  )
}

export function BalancesSkeleton() {
  return (
    <>
      <div className="grid grid-cols-2 gap-3 mb-3">
        {[0, 1].map((i) => (
          <div key={i} className="bg-white/10 rounded-2xl p-3">
            <div className="h-3 w-16 rounded-full mb-2 shimmer" />
            <div className="h-6 w-24 rounded-full shimmer" />
          </div>
        ))}
      </div>
      <div className="bg-white/10 rounded-2xl p-3">
        <div className="h-3 w-28 rounded-full mb-2 shimmer" />
        <div className="h-7 w-36 rounded-full shimmer" />
      </div>
    </>
  )
}
