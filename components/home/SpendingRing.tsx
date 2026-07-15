'use client'

import { motion } from 'framer-motion'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { cn } from '@/lib/utils'

interface SpendingRingProps {
  data: {
    name: string
    value: number
    color: string
  }[]
  size?: number
  className?: string
}

const COLORS = ['#10b981', '#f43f5e', '#3b82f6', '#f59e0b', '#8b5cf6']

export default function SpendingRing({
  data,
  size = 160,
  className,
}: SpendingRingProps) {
  const total = data.reduce((acc, curr) => acc + curr.value, 0)
  const hasData = total > 0

  return (
    <div className={cn('flex flex-col items-center', className)}>
      <div className="relative">
        <ResponsiveContainer width={size} height={size}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={size * 0.4}
              outerRadius={size * 0.5}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  stroke="rgba(255,255,255,0.1)"
                />
              ))}
            </Pie>
            {hasData && (
              <>
                <Tooltip
                  formatter={(value) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value as number)}
                  contentStyle={{
                    backgroundColor: 'rgba(255,255,255,0.9)',
                    borderRadius: '8px',
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  }}
                  itemStyle={{ color: '#1f2937' }}
                />
                <Legend
                  verticalAlign="bottom"
                  align="center"
                  iconType="circle"
                  wrapperStyle={{ fontSize: '10px', marginTop: '10px' }}
                />
              </>
            )}
          </PieChart>
        </ResponsiveContainer>
        
        {/* Center Text */}
        {hasData && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xs text-gray-500 dark:text-gray-400">Total</span>
            <span className="text-lg font-bold amount">
              {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(total)}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
