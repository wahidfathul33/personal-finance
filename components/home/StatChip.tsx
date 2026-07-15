'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { PERSON_COLORS, formatCurrency } from '@/lib/constants'
import { useHideAmounts } from '@/lib/HideAmountsContext'
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from 'lucide-react'

interface PersonStat {
  name: string
  color: string
  amount: number
  change?: { value: string; isPositive: boolean; isUp: boolean }
}

interface StatChipProps {
  label: string
  value: number
  variant?: 'default' | 'income' | 'expense'
  change?: { value: string; isPositive: boolean; isUp: boolean }
  persons?: PersonStat[]
  className?: string
}

const VARIANT_CONFIG = {
  default: {
    card: 'bg-white dark:bg-base-800 border border-gray-100 dark:border-base-700',
    iconBg: 'bg-base-100 dark:bg-base-800',
    iconText: 'text-base-600 dark:text-base-400',
    label: 'text-gray-500 dark:text-gray-400',
    amount: 'text-gray-900 dark:text-white',
    dotBg: 'bg-base-600',
    trend: 'text-gray-500 dark:text-gray-400',
  },
  income: {
    card: 'bg-white dark:bg-base-800 border border-gray-100 dark:border-base-700',
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/40',
    iconText: 'text-emerald-600 dark:text-emerald-400',
    label: 'text-gray-500 dark:text-gray-400',
    amount: 'text-emerald-600 dark:text-emerald-400',
    dotBg: 'bg-emerald-500',
    trend: 'text-gray-500 dark:text-gray-400',
  },
  expense: {
    card: 'bg-white dark:bg-base-800 border border-gray-100 dark:border-base-700',
    iconBg: 'bg-rose-100 dark:bg-rose-900/40',
    iconText: 'text-rose-600 dark:text-rose-400',
    label: 'text-gray-500 dark:text-gray-400',
    amount: 'text-rose-600 dark:text-rose-400',
    dotBg: 'bg-rose-500',
    trend: 'text-gray-500 dark:text-gray-400',
  },
}

function resolveDotColor(colorKey: string): string {
  return PERSON_COLORS[colorKey]?.button.split(' ').find(c => c.startsWith('bg-')) ?? 'bg-base-500'
}

export default function StatChip({
  label,
  value,
  variant = 'default',
  change,
  persons,
  className,
}: StatChipProps) {
  const { hidden } = useHideAmounts()
  const v = VARIANT_CONFIG[variant]

  const changeLabel = change ? (
    change.value === '0%' ? '0% dari bulan lalu'
    : `${change.isUp ? '▲' : '▼'} ${change.value} dari bulan lalu`
  ) : null

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn('rounded-2xl p-3.5 shadow-sm', v.card, className)}
    >
      <div className="flex items-start gap-3">
        {/* Icon Circle */}
        <div className={cn('w-10 h-10 rounded-full flex items-center justify-center shrink-0', v.iconBg)}>
          <span className={cn(v.iconText)}>
            {variant === 'income' && <ArrowUpRight size={20} strokeWidth={2.5} />}
            {variant === 'expense' && <ArrowDownRight size={20} strokeWidth={2.5} />}
            {variant === 'default' && <TrendingUp size={20} strokeWidth={2.5} />}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p className={cn('text-xs font-medium', v.label)}>{label}</p>
          <p className={cn('text-lg font-bold amount mt-0.5', v.amount)}>
            {hidden ? '••••••' : formatCurrency(value)}
          </p>
          {changeLabel && !hidden && (
            <p className={cn('text-[11px] mt-0.5', v.trend)}>{changeLabel}</p>
          )}
        </div>
      </div>

      {/* Per-person breakdown */}
      {persons && persons.length > 0 && !hidden && (
        <div className="mt-3 pt-2.5 border-t border-gray-100 dark:border-base-700 space-y-1.5">
          {persons.map((p) => (
            <div key={p.name} className="flex items-center gap-2">
              <div className={cn('w-2 h-2 rounded-full shrink-0', resolveDotColor(p.color))} />
              <span className="text-[11px] text-gray-500 dark:text-gray-400 shrink-0">{p.name}</span>
              <span className="text-[11px] font-semibold amount ml-auto">{formatCurrency(p.amount)}</span>
              {p.change && p.change.value !== '0%' && (
                <span className={cn(
                  'text-[10px] font-medium shrink-0 inline-flex items-center gap-0.5',
                  p.change.isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                )}>
                  {p.change.isUp && <TrendingUp size={9} />}
                  {!p.change.isUp && <TrendingDown size={9} />}
                  {p.change.value}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </motion.div>
  )
}
