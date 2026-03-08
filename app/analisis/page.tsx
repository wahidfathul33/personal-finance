'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  getMonthlyTrend,
  getCategoryBreakdown,
  getPersonComparison,
  type MonthlyTrendPoint,
  type CategoryBreakdownItem,
  type PersonComparisonItem,
} from '@/actions/analysis'
import { getPersons } from '@/actions/persons'
import PageHeader from '@/components/PageHeader'
import { formatCurrency, currentMonth, currentYear, MONTHS } from '@/lib/constants'
import type { Person } from '@/lib/types'
import { ChevronsUpDown } from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

const COLOR_HEX: Record<string, string> = {
  indigo: '#6366f1',
  pink: '#ec4899',
  emerald: '#10b981',
  blue: '#3b82f6',
  violet: '#8b5cf6',
  amber: '#f59e0b',
  rose: '#f43f5e',
  teal: '#14b8a6',
}

const now = new Date()
const YEAR_OPTIONS = Array.from({ length: 5 }, (_, i) => now.getFullYear() - i)

function FilterRow({
  month, year, onMonth, onYear,
}: {
  month: number; year: number; onMonth: (m: number) => void; onYear: (y: number) => void
}) {
  return (
    <div className="px-4 mb-4 flex items-center gap-2">
      <div className="relative flex-1">
        <select
          value={month}
          onChange={e => onMonth(Number(e.target.value))}
          className="w-full bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100 text-sm font-medium rounded-xl pl-3 pr-8 py-2.5 border-0 outline-none appearance-none cursor-pointer"
        >
          {MONTHS.map((name, i) => (
            <option key={i + 1} value={i + 1}>{name}</option>
          ))}
        </select>
        <ChevronsUpDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
      </div>
      <div className="relative w-28">
        <select
          value={year}
          onChange={e => onYear(Number(e.target.value))}
          className="w-full bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100 text-sm font-medium rounded-xl pl-3 pr-8 py-2.5 border-0 outline-none appearance-none cursor-pointer"
        >
          {YEAR_OPTIONS.map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
        <ChevronsUpDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
      </div>
    </div>
  )
}

export default function AnalisisPage() {
  const [trend, setTrend] = useState<MonthlyTrendPoint[]>([])
  const [breakdown, setBreakdown] = useState<CategoryBreakdownItem[]>([])
  const [comparison, setComparison] = useState<PersonComparisonItem[]>([])
  const [persons, setPersons] = useState<Person[]>([])
  const [loading, setLoading] = useState(true)
  const [month, setMonth] = useState(currentMonth())
  const [year, setYear] = useState(currentYear())

  const load = useCallback(async () => {
    setLoading(true)
    const [trendData, breakdownData, comparisonData, personsData] = await Promise.all([
      getMonthlyTrend(),
      getCategoryBreakdown(month, year),
      getPersonComparison(month, year),
      getPersons(),
    ])
    setTrend(trendData)
    setBreakdown(breakdownData)
    setComparison(comparisonData)
    setPersons(personsData)
    setLoading(false)
  }, [month, year])

  useEffect(() => {
    load()
  }, [load])

  if (loading) {
    return (
      <div>
        <PageHeader title="Analisis" />
        <FilterRow month={month} year={year} onMonth={setMonth} onYear={setYear} />
        <div className="px-4 space-y-6 pb-8">
          {/* Trend skeleton */}
          <div>
            <div className="h-4 w-24 rounded-full bg-gray-200 dark:bg-gray-700 mb-3 shimmer-dark" />
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-3">
              <div className="h-[180px] rounded-xl bg-gray-100 dark:bg-gray-700 shimmer-dark" />
            </div>
          </div>
          {/* Breakdown skeleton */}
          <div>
            <div className="h-4 w-40 rounded-full bg-gray-200 dark:bg-gray-700 mb-3 shimmer-dark" />
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-3 flex gap-4">
              <div className="w-[140px] h-[140px] rounded-full bg-gray-100 dark:bg-gray-700 flex-shrink-0 shimmer-dark" />
              <div className="flex-1 space-y-2.5 pt-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="h-3 w-24 rounded-full bg-gray-200 dark:bg-gray-700 shimmer-dark" />
                    <div className="h-3 w-16 rounded-full bg-gray-200 dark:bg-gray-700 shimmer-dark" />
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* Comparison skeleton */}
          <div>
            <div className="h-4 w-40 rounded-full bg-gray-200 dark:bg-gray-700 mb-3 shimmer-dark" />
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-3">
              <div className="h-[160px] rounded-xl bg-gray-100 dark:bg-gray-700 shimmer-dark" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader title="Analisis" />
      <FilterRow month={month} year={year} onMonth={setMonth} onYear={setYear} />
      <div className="px-4 space-y-6 pb-8">
        {/* Monthly Trend */}
        <div>
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Tren 6 Bulan
          </h2>
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-3">
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={trend} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} width={40} />
                <Tooltip
                  formatter={(value: unknown) => formatCurrency(Number(value))}
                  contentStyle={{ fontSize: 12 }}
                />
                <Line type="monotone" dataKey="income" name="Masuk" stroke="#10b981" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="expense" name="Keluar" stroke="#f43f5e" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
            <div className="flex items-center justify-center gap-4 mt-1">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-0.5 bg-emerald-500 rounded" />
                <span className="text-xs text-gray-500">Pemasukan</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-0.5 bg-rose-500 rounded" />
                <span className="text-xs text-gray-500">Pengeluaran</span>
              </div>
            </div>
          </div>
        </div>

        {/* Category Breakdown */}
        <div>
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Pengeluaran per Kategori — {MONTHS[month - 1]} {year}
          </h2>
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-3">
            {breakdown.length === 0 ? (
              <p className="text-center py-6 text-gray-400 text-sm">Belum ada data</p>
            ) : (
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <PieChart width={140} height={140}>
                    <Pie
                      data={breakdown}
                      cx={65}
                      cy={65}
                      innerRadius={40}
                      outerRadius={65}
                      paddingAngle={2}
                      dataKey="amount"
                    >
                      {breakdown.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </div>
                <div className="flex-1 space-y-1.5">
                  {breakdown.slice(0, 6).map((item) => (
                    <div key={item.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                        <span className="text-xs text-gray-600 dark:text-gray-300">
                          {item.icon} {item.name}
                        </span>
                      </div>
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-200">
                        {formatCurrency(item.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Person Comparison */}
        {persons.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Perbandingan per Orang — {MONTHS[month - 1]} {year}
            </h2>
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-3">
              {comparison.length === 0 ? (
                <p className="text-center py-6 text-gray-400 text-sm">Belum ada data</p>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={persons.length > 0 ? comparison.length * 40 + 20 : 200}>
                    <BarChart
                      layout="vertical"
                      data={comparison}
                      margin={{ top: 5, right: 10, bottom: 5, left: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                      <XAxis
                        type="number"
                        tick={{ fontSize: 10 }}
                        tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                      />
                      <YAxis dataKey="category" type="category" width={90} tick={{ fontSize: 10 }} />
                      <Tooltip
                        formatter={(value: unknown) => formatCurrency(Number(value))}
                        contentStyle={{ fontSize: 12 }}
                      />
                      {persons.map((p) => (
                        <Bar
                          key={p.id}
                          dataKey={p.name}
                          name={p.name}
                          fill={COLOR_HEX[p.color] ?? '#6366f1'}
                          radius={[0, 4, 4, 0]}
                          maxBarSize={16}
                        />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="flex items-center justify-center gap-4 mt-2">
                    {persons.map((p) => (
                      <div key={p.id} className="flex items-center gap-1.5">
                        <div
                          className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
                          style={{ backgroundColor: COLOR_HEX[p.color] ?? '#6366f1' }}
                        />
                        <span className="text-xs text-gray-500">{p.name}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
