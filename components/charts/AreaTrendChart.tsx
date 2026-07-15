'use client'

import { motion } from 'framer-motion'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { cn } from '@/lib/utils'

interface AreaTrendChartProps {
  data: {
    name: string
    income: number
    expense: number
  }[]
  className?: string
}

export default function AreaTrendChart({ data, className }: AreaTrendChartProps) {
  return (
    <div className={cn('w-full', className)}>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
          <XAxis
            dataKey="name"
            stroke="rgba(0,0,0,0.5)"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="rgba(0,0,0,0.5)"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `Rp ${value / 1000000}jt`}
          />
          <Tooltip
            formatter={(value) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value as number)}
            contentStyle={{
              backgroundColor: 'rgba(255,255,255,0.9)',
              borderRadius: '8px',
              border: 'none',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            }}
          />
          <Area
            type="monotone"
            dataKey="income"
            stroke="#10b981"
            strokeWidth={2}
            fill="url(#incomeGradient)"
            animationDuration={1000}
          />
          <Area
            type="monotone"
            dataKey="expense"
            stroke="#f43f5e"
            strokeWidth={2}
            fill="url(#expenseGradient)"
            animationDuration={1000}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
