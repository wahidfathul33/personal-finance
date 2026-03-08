'use server'

import { supabase } from '@/lib/supabase'
import { CATEGORIES } from '@/lib/constants'

export type MonthlyTrendPoint = {
  label: string
  income: number
  expense: number
}

export type CategoryBreakdownItem = {
  id: string
  name: string
  icon: string
  amount: number
  color: string
}

export type PersonComparisonItem = {
  category: string
  mas: number
  fita: number
}

const COLORS = [
  '#6366f1', '#f43f5e', '#f59e0b', '#10b981', '#3b82f6',
  '#ec4899', '#8b5cf6', '#14b8a6', '#f97316', '#64748b',
  '#84cc16', '#06b6d4',
]

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des']

export async function getMonthlyTrend(): Promise<MonthlyTrendPoint[]> {
  const now = new Date()
  const points: MonthlyTrendPoint[] = []

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const m = d.getMonth() + 1
    const y = d.getFullYear()
    const startDate = `${y}-${String(m).padStart(2, '0')}-01`
    const endDate = new Date(y, m, 0).toISOString().split('T')[0]

    const { data } = await supabase
      .from('transactions')
      .select('amount, type')
      .gte('date', startDate)
      .lte('date', endDate)

    const income = (data ?? []).filter((t) => t.type === 'income').reduce((a, t) => a + t.amount, 0)
    const expense = (data ?? []).filter((t) => t.type === 'expense').reduce((a, t) => a + Math.abs(t.amount), 0)

    points.push({ label: MONTH_NAMES[m - 1], income, expense })
  }

  return points
}

export async function getCategoryBreakdown(month: number, year: number): Promise<CategoryBreakdownItem[]> {
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`
  const endDate = new Date(year, month, 0).toISOString().split('T')[0]

  const { data } = await supabase
    .from('transactions')
    .select('amount, category_id, type')
    .gte('date', startDate)
    .lte('date', endDate)
    .eq('type', 'expense')

  const grouped: Record<string, number> = {}
  for (const t of data ?? []) {
    const key = t.category_id ?? 'other'
    grouped[key] = (grouped[key] ?? 0) + Math.abs(t.amount)
  }

  return Object.entries(grouped)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([id, amount], idx) => {
      const cat = CATEGORIES.find((c) => c.id === id)
      return {
        id,
        name: cat?.name ?? 'Lainnya',
        icon: cat?.icon ?? '📌',
        amount,
        color: COLORS[idx % COLORS.length],
      }
    })
}

export async function getPersonComparison(month: number, year: number): Promise<PersonComparisonItem[]> {
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`
  const endDate = new Date(year, month, 0).toISOString().split('T')[0]

  const { data } = await supabase
    .from('transactions')
    .select('amount, category_id, person_id, type')
    .gte('date', startDate)
    .lte('date', endDate)
    .eq('type', 'expense')

  const grouped: Record<string, { mas: number; fita: number }> = {}
  for (const t of data ?? []) {
    const key = t.category_id ?? 'other'
    if (!grouped[key]) grouped[key] = { mas: 0, fita: 0 }
    if (t.person_id === 'mas') grouped[key].mas += Math.abs(t.amount)
    else if (t.person_id === 'fita') grouped[key].fita += Math.abs(t.amount)
  }

  return Object.entries(grouped)
    .sort((a, b) => (b[1].mas + b[1].fita) - (a[1].mas + a[1].fita))
    .slice(0, 6)
    .map(([id, values]) => {
      const cat = CATEGORIES.find((c) => c.id === id)
      return {
        category: (cat?.icon ?? '📌') + ' ' + (cat?.name ?? 'Lainnya'),
        mas: values.mas,
        fita: values.fita,
      }
    })
}
