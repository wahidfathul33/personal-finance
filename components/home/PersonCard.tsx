'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { PERSON_COLORS, formatCurrency } from '@/lib/constants'
import { useHideAmounts } from '@/lib/HideAmountsContext'

interface PersonCardProps {
  name: string
  amount: number
  percentage?: number
  color?: string
  className?: string
}

/** Resolve a color key (e.g. 'indigo') to a Tailwind bg class (e.g. 'bg-indigo-600') */
function resolveAvatarBg(color?: string): string {
  if (!color) return 'bg-base-500'
  const palette = PERSON_COLORS[color]
  if (palette) {
    // Extract bg class from button: 'bg-indigo-600 text-white border-indigo-600'
    return palette.button.split(' ').find(c => c.startsWith('bg-')) ?? 'bg-base-500'
  }
  // Already a Tailwind class or unknown — pass through
  return color
}

export default function PersonCard({
  name,
  amount,
  percentage,
  color = 'bg-base-500',
  className,
}: PersonCardProps) {
  const { hidden } = useHideAmounts()
  const avatarBg = resolveAvatarBg(color)
  const barBg = PERSON_COLORS[color]?.button.split(' ').find(c => c.startsWith('bg-')) ?? color

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        'flex flex-col items-start gap-2 p-4 rounded-xl shadow-sm bg-white dark:bg-base-800 border border-base-200 dark:border-base-700',
        className
      )}
    >
      <div className="flex items-center gap-2 w-full">
        <div className={cn(
          'w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold shadow-sm',
          avatarBg
        )}>
          {name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{name}</p>
          {percentage !== undefined && (
            <p className="text-xs text-gray-500 dark:text-gray-400">{percentage}%</p>
          )}
        </div>
      </div>
      <div className="w-full">
        <p className="text-lg font-bold amount text-gray-900 dark:text-gray-100">{hidden ? '••••••' : formatCurrency(amount)}</p>
        {percentage !== undefined && (
          <div className="h-1.5 w-full bg-base-200 dark:bg-base-700 rounded-full mt-2 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 0.5 }}
              className={cn('h-full rounded-full', barBg)}
            />
          </div>
        )}
      </div>
    </motion.div>
  )
}
