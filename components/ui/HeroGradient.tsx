'use client'

import { cn } from '@/lib/utils'
import { TrendingUp, PiggyBank, ShieldCheck, type LucideIcon } from 'lucide-react'

interface HeroGradientProps {
  children: React.ReactNode
  className?: string
  /** Which silhouette set to show */
  variant?: 'home' | 'savings' | 'assets'
}

const VARIANT_ICON: Record<NonNullable<HeroGradientProps['variant']>, LucideIcon> = {
  home: TrendingUp,
  savings: PiggyBank,
  assets: ShieldCheck,
}

export default function HeroGradient({ children, className, variant = 'home' }: HeroGradientProps) {
  const Icon = VARIANT_ICON[variant]

  return (
    <div
      className={cn('relative overflow-hidden rounded-2xl text-white shadow-md', className)}
      style={{
        background: 'linear-gradient(135deg, hsl(var(--base-400)) 0%, hsl(var(--base-600)) 55%, hsl(var(--base-800)) 100%)',
        boxShadow: '0 8px 32px hsl(var(--base-600) / 0.22)',
      }}
    >
      {/* Radial glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-6 -right-8 w-40 h-40 rounded-full" style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.10) 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 left-1/3 w-36 h-36 rounded-full" style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)' }} />
      </div>

      {/* Icon silhouette */}
      <Icon
        className="absolute -bottom-6 -right-6 w-36 h-36 text-white opacity-[0.05] pointer-events-none"
        strokeWidth={0.75}
        aria-hidden="true"
      />

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}
