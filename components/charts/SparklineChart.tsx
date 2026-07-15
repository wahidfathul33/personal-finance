'use client'

import { motion } from 'framer-motion'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { cn } from '@/lib/utils'

interface SparklineChartProps {
  data: {
    name: string
    value: number
  }[]
  color?: string
  className?: string
}

export default function SparklineChart({ data, color = '#3b82f6', className }: SparklineChartProps) {
  return (
    <div className={cn('w-full', className)}>
      <ResponsiveContainer width="100%" height={60}>
        <LineChart data={data}>
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            dot={false}
            animationDuration={1000}
          />
          <Tooltip
            formatter={(value) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value as number)}
            contentStyle={{
              backgroundColor: 'rgba(255,255,255,0.9)',
              borderRadius: '8px',
              border: 'none',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              fontSize: '12px',
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
