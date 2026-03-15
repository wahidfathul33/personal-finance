import { formatCurrency } from '@/lib/constants'

interface Props {
  amount: number
  className?: string
  showSign?: boolean
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const SIZE_CLASSES = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg font-semibold',
  xl: 'text-2xl font-bold',
}

export default function AmountDisplay({
  amount,
  className = '',
  showSign = false,
  size = 'md',
}: Props) {
  const isPositive = amount >= 0
  const colorClass = isPositive ? 'text-emerald-600' : 'text-rose-500'
  const sign = showSign ? (isPositive ? '+' : '') : ''

  return (
    <span className={`${colorClass} ${SIZE_CLASSES[size]} ${className}`}>
      {sign}{formatCurrency(amount)}
    </span>
  )
}
