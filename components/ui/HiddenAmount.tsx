'use client'

import { useHideAmounts } from '@/lib/HideAmountsContext'
import { formatCurrency } from '@/lib/constants'

interface Props {
  value: number
  signed?: boolean
  className?: string
}

export default function HiddenAmount({ value, signed, className }: Props) {
  const { hidden } = useHideAmounts()
  if (hidden) return <span className={className}>••••••</span>
  const prefix = signed && value > 0 ? '+' : ''
  return <span className={className}>{prefix}{formatCurrency(value)}</span>
}
