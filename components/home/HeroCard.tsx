'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useHideAmounts } from '@/lib/HideAmountsContext'
import { formatCurrency, PERSON_COLORS } from '@/lib/constants'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface PersonBalance {
  id: string
  name: string
  color: string
  amount: number
}

interface HeroCardProps {
  amount: number
  prevTotal?: number
  people?: PersonBalance[]
  className?: string
}

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 11) return 'Selamat pagi'
  if (hour < 15) return 'Selamat siang'
  if (hour < 18) return 'Selamat sore'
  return 'Selamat malam'
}

function resolveAvatarBg(color?: string): string {
  if (!color) return 'bg-base-500'
  const palette = PERSON_COLORS[color]
  if (palette) {
    return palette.button.split(' ').find(c => c.startsWith('bg-')) ?? 'bg-base-500'
  }
  return color
}

function resolveBarBg(color?: string): string {
  if (!color) return 'bg-base-500'
  const palette = PERSON_COLORS[color]
  if (palette) {
    return palette.button.split(' ').find(c => c.startsWith('bg-')) ?? 'bg-base-500'
  }
  return color
}

export default function HeroCard({
  amount,
  prevTotal = 0,
  people = [],
  className,
}: HeroCardProps) {
  const { hidden } = useHideAmounts()

  const diff = amount - prevTotal
  const pctChange = prevTotal > 0 ? Math.round((diff / prevTotal) * 100) : 0
  const isUp = diff > 0
  const isNeutral = diff === 0 || prevTotal === 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn('relative', className)}
    >
      {/* Greeting */}
      <p className="text-white/80 text-xs font-medium">{getGreeting()}, Keluarga Cemara 👋</p>
      <h1 className="text-white text-3xl font-bold mt-0.5">Keuangan Kita</h1>

      {/* Balance */}
      <div className="mt-4">
        <p className="text-white/60 text-xs font-medium tracking-wide uppercase">Saldo Total</p>
        <p className="text-white text-4xl font-bold tracking-tight mt-1" style={{ color: '#ffffff' }}>
          {hidden ? '••••••' : formatCurrency(amount)}
        </p>
      </div>

      {/* Trend Chip */}
      {!isNeutral && !hidden && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className={cn(
            'inline-flex items-center gap-1.5 mt-2 px-3 py-1.5 rounded-full text-xs font-medium',
            isUp
              ? 'bg-emerald-400/20 text-emerald-200'
              : 'bg-rose-400/20 text-rose-200'
          )}
        >
          {isUp ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
          <span>
            {isUp ? '▲' : '▼'} {formatCurrency(Math.abs(diff))} {isUp ? 'naik' : 'turun'} {Math.abs(pctChange)}% dibanding bulan lalu
          </span>
        </motion.div>
      )}

      {/* Person Cards */}
      {people.length > 0 && (
        <div className={cn(
          'grid gap-2.5 mt-5',
          people.length === 1 ? 'grid-cols-1' : 'grid-cols-2'
        )}>
          {people.map((person, i) => {
            const avatarBg = resolveAvatarBg(person.color)
            const barBg = resolveBarBg(person.color)
            const personPct = amount > 0 ? Math.round((person.amount / amount) * 100) : 0

            return (
              <motion.div
                key={person.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.1 }}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-3"
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm shrink-0',
                    avatarBg
                  )}>
                    {person.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-white text-sm font-semibold truncate">{person.name}</p>
                      <span className="text-white/60 text-[11px] font-medium ml-2 shrink-0">{personPct}%</span>
                    </div>
                    <p className="text-white font-bold text-base mt-0.5" style={{ color: '#ffffff' }}>
                      {hidden ? '••••••' : formatCurrency(person.amount)}
                    </p>
                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden mt-1.5">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${personPct}%` }}
                        transition={{ duration: 0.6, delay: 0.2 + i * 0.1 }}
                        className={cn('h-full rounded-full', barBg)}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </motion.div>
  )
}
