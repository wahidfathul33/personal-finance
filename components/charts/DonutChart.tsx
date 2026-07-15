'use client'

import { motion } from 'framer-motion'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { cn } from '@/lib/utils'

interface DonutChartProps {
  data: {
    name: string
    value: number
    color: string
  }[]
  size?: number
  className?: string
}

export default function DonutChart({ data, size = 300, className }: DonutChartProps) {
  const COLORS = data.map(d => d.color)
  const total = data.reduce((acc, curr) => acc + curr.value, 0)

  return (
    <div className={cn('w-full', className)}>
      <div className="relative">
        <ResponsiveContainer width="100%" height={size}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={size * 0.35}
              outerRadius={size * 0.5}
              paddingAngle={2}
              dataKey="value"
              labelLine={{ stroke: 'rgba(0,0,0,0.3)', strokeWidth: 1 }}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  stroke="rgba(255,255,255,0.1)"
                />
              ))}
            </Pie>
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
              wrapperStyle={{ fontSize: '12px', marginTop: '10px' }}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-sm text-gray-500 dark:text-gray-400">Total</span>
          <span className="text-2xl font-bold amount">
            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(total)}
          </span>
        </div>
      </div>
    </div>
  )
}
