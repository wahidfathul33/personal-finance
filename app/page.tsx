import { Suspense } from 'react'
import { RecentSection, RecentSkeleton } from './_home/RecentSection'
import HideToggle from '@/components/ui/HideToggle'
import Link from 'next/link'
import { Settings, Wallet } from 'lucide-react'
import { currentMonth, currentYear, MONTHS } from '@/lib/constants'
import HeroCard from '@/components/home/HeroCard'
import StatChip from '@/components/home/StatChip'
import { getAllBalances, getMonthlyStatsWithComparison } from '@/actions/balances'
import FABWrapper from '@/components/layout/FABWrapper'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const month = currentMonth()
  const year = currentYear()

  const [balances, stats] = await Promise.all([
    getAllBalances(month, year),
    getMonthlyStatsWithComparison(month, year),
  ])

  const incomeAmount = stats.income
  const expenseAmount = stats.expense

  const incomePct = `${Math.abs(stats.incomePct)}%`
  const expensePct = `${Math.abs(stats.expensePct)}%`

  // Per-person stat formatting
  const incomePersons = stats.perPerson
    .filter(p => p.income > 0)
    .map(p => {
      const pctVal = p.incomePct
      return {
        name: p.name,
        color: p.color,
        amount: p.income,
        change: { value: `${Math.abs(pctVal)}%`, isPositive: pctVal >= 0, isUp: pctVal > 0 },
      }
    })
  const expensePersons = stats.perPerson
    .filter(p => p.expense > 0)
    .map(p => {
      const pctVal = p.expensePct
      return {
        name: p.name,
        color: p.color,
        amount: p.expense,
        change: { value: `${Math.abs(pctVal)}%`, isPositive: pctVal <= 0, isUp: pctVal > 0 },
      }
    })

  return (
    <div className="flex flex-col min-h-[calc(100dvh-80px)]">
      {/* Gradient Hero Section */}
      <div className="relative overflow-hidden rounded-b-[36px]" style={{ paddingTop: 'calc(env(safe-area-inset-top) + 1.5rem)', paddingBottom: '1.5rem', boxShadow: '0 20px 50px rgba(37,99,235,.18)' }}>
        {/* Layer 1: Mesh Gradient */}
        <div className="absolute inset-0 hero-mesh-gradient" />

        {/* Layer 2: Radial Glows */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-10 -right-10 w-56 h-56 rounded-full hero-glow-breathe-delayed" style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.10) 0%, transparent 70%)' }} />
          <div className="absolute bottom-0 -left-16 w-48 h-48 rounded-full" style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)' }} />
        </div>

        {/* Layer 3: Icon Silhouette */}
        <Wallet
          className="absolute -bottom-10 -right-10 w-56 h-56 text-white opacity-[0.05] hero-blob-float-slow pointer-events-none"
          strokeWidth={0.75}
          aria-hidden="true"
        />

        {/* Layer 6: Floating Particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[15%] left-[20%] w-1 h-1 rounded-full bg-white/5 hero-particle-drift" />
          <div className="absolute top-[45%] right-[15%] w-1.5 h-1.5 rounded-full bg-white/5 hero-particle-drift-delayed" />
          <div className="absolute top-[70%] left-[60%] w-1 h-1 rounded-full bg-white/5 hero-particle-drift-slow" />
          <div className="absolute top-[25%] right-[35%] w-0.5 h-0.5 rounded-full bg-white/5 hero-particle-drift" />
          <div className="absolute top-[60%] left-[30%] w-1 h-1 rounded-full bg-white/5 hero-particle-drift-delayed" />
          <div className="absolute top-[80%] right-[45%] w-0.5 h-0.5 rounded-full bg-white/5 hero-particle-drift-slow" />
        </div>

        {/* Layer 7: Noise Texture */}
        <div className="absolute inset-0 hero-noise-overlay pointer-events-none" />

        {/* Layer 8: Content */}
        <div className="relative z-10 px-4">
        {/* Top Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-white/80">
            <span className="text-xs font-medium">{MONTHS[month - 1]} {year}</span>
          </div>
          <div className="flex items-center gap-2">
            <HideToggle className="bg-white/15 text-white hover:bg-white/25" />
            <Link
              href="/settings"
              className="w-9 h-9 flex items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25 transition-colors"
            >
              <Settings size={17} />
            </Link>
          </div>
        </div>

        {/* Hero Card - Greeting + Balance + People */}
        <HeroCard
          amount={balances.total}
          prevTotal={balances.prevTotal}
          people={balances.people.map(p => ({
            id: p.id,
            name: p.name,
            amount: p.amount,
            color: p.color
          }))}
        />
        </div>
      </div>

      {/* Income & Expense Stats */}
      <div className="px-4 py-4">
        <div className="grid grid-cols-2 gap-3">
          <StatChip
            label="Pemasukan"
            value={incomeAmount}
            change={{ value: incomePct, isPositive: stats.incomePct >= 0, isUp: stats.incomePct > 0 }}
            variant="income"
            persons={incomePersons}
          />
          <StatChip
            label="Pengeluaran"
            value={expenseAmount}
            change={{ value: expensePct, isPositive: stats.expensePct <= 0, isUp: stats.expensePct > 0 }}
            variant="expense"
            persons={expensePersons}
          />
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="px-4 pb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Transaksi Terbaru</h2>
          <Link href="/transactions" className="text-xs text-base font-medium">
            Lihat semua
          </Link>
        </div>
        <Suspense fallback={<RecentSkeleton />}>
          <RecentSection />
        </Suspense>
      </div>

      <FABWrapper />
    </div>
  )
}

