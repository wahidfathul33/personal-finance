'use client'

import { useEffect, useState } from 'react'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import PageHeader from '@/components/PageHeader'
import {
  getMonthlyTrend,
  getCategoryBreakdown,
  getPersonComparison,
  type MonthlyTrendPoint,
  type CategoryBreakdownItem,
  type PersonComparisonItem,
} from '@/actions/analysis'
import { MONTHS, currentMonth, currentYear, formatCurrency } from '@/lib/constants'

const YEARS = [2024, 2025, 2026, 2027]

function fmt(v: number) {
  if (v >= 1_000_000) return 'Rp ' + (v / 1_000_000).toFixed(1) + 'jt'
  if (v >= 1_000) return 'Rp ' + (v / 1_000).toFixed(0) + 'rb'
  return 'Rp ' + v
}

export default function AnalisisPage() {
  const [month, setMonth] = useState(currentMonth())
  const [year, setYear] = useState(currentYear())

  const [trend, setTrend] = useState<MonthlyTrendPoint[]>([])
  const [breakdown, setBreakdown] = useState<CategoryBreakdownItem[]>([])
  const [comparison, setComparison] = useState<PersonComparisonItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      getMonthlyTrend(),
      getCategoryBreakdown(month, year),
      getPersonComparison(month, year),
    ]).then(([t, b, c]) => {
      setTrend(t)
      setBreakdown(b)
      setComparison(c)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [month, year])

  const totalExpense = breakdown.reduce((a, b) => a + b.amount, 0)

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <PageHeader title="Analisis" subtitle={`${MONTHS[month - 1]} ${year}`} />

      {/* Month / Year selector */}
      <div className="flex gap-2 px-4 mb-4">
        <select
          value={month}
          onChange={(e) => setMonth(parseInt(e.target.value))}
          className="flex-1 h-10 border border-gray-200 dark:border-gray-700 rounded-xl px-3 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none"
        >
          {MONTHS.map((m, i) => (
            <option key={i} value={i + 1}>{m}</option>
          ))}
        </select>
        <select
          value={year}
          onChange={(e) => setYear(parseInt(e.target.value))}
          className="h-10 border border-gray-200 dark:border-gray-700 rounded-xl px-3 text-sm w-24 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none"
        >
          {YEARS.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-sm text-gray-400 dark:text-gray-500">Memuat data...</div>
        </div>
      ) : (
        <div className="px-4 pb-6 space-y-5">

          {/* ── Trend 6 Bulan ── */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">Tren 6 Bulan</p>
            {trend.every((t) => t.income === 0 && t.expense === 0) ? (
              <p className="text-xs text-gray-400 dark:text-gray-500 text-center py-6">Belum ada data</p>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={trend} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gExpense" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={fmt} tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} width={56} />
                  <Tooltip formatter={(v) => formatCurrency(Number(v))} contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.12)', fontSize: 12 }} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                  <Area type="monotone" dataKey="income" name="Pemasukan" stroke="#10b981" fill="url(#gIncome)" strokeWidth={2} dot={{ r: 3 }} />
                  <Area type="monotone" dataKey="expense" name="Pengeluaran" stroke="#f43f5e" fill="url(#gExpense)" strokeWidth={2} dot={{ r: 3 }} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* ── Pengeluaran per Kategori ── */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
              Pengeluaran per Kategori
              {totalExpense > 0 && (
                <span className="ml-2 text-xs font-normal text-gray-400">({formatCurrency(totalExpense)})</span>
              )}
            </p>
            {breakdown.length === 0 ? (
              <p className="text-xs text-gray-400 dark:text-gray-500 text-center py-6">Belum ada data</p>
            ) : (
              <div className="flex flex-col gap-4">
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={breakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={75}
                      dataKey="amount"
                      nameKey="name"
                      paddingAngle={2}
                    >
                      {breakdown.map((entry) => (
                        <Cell key={entry.id} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => formatCurrency(Number(v))} contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.12)', fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2">
                  {breakdown.map((item) => (
                    <div key={item.id} className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">{item.icon}</span>
                      <span className="text-xs text-gray-700 dark:text-gray-200 flex-1 truncate">{item.name}</span>
                      <span className="text-xs font-semibold text-gray-800 dark:text-gray-100">{formatCurrency(item.amount)}</span>
                      {totalExpense > 0 && (
                        <span className="text-xs text-gray-400 w-9 text-right">{Math.round((item.amount / totalExpense) * 100)}%</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Mas vs Fita ── */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">Perbandingan Mas vs Fita</p>
            {comparison.length === 0 ? (
              <p className="text-xs text-gray-400 dark:text-gray-500 text-center py-6">Belum ada data</p>
            ) : (
              <ResponsiveContainer width="100%" height={Math.max(160, comparison.length * 42)}>
                <BarChart
                  layout="vertical"
                  data={comparison}
                  margin={{ top: 0, right: 8, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
                  <XAxis type="number" tickFormatter={fmt} tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="category" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} width={90} />
                  <Tooltip formatter={(v) => formatCurrency(Number(v))} contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.12)', fontSize: 12 }} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="mas" name="Mas" fill="#3b82f6" radius={[0, 4, 4, 0]} maxBarSize={16} />
                  <Bar dataKey="fita" name="Fita" fill="#ec4899" radius={[0, 4, 4, 0]} maxBarSize={16} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
