'use server'

import { supabase } from '@/lib/supabase'
import { CATEGORIES, MONTHS_SHORT, } from '@/lib/constants'

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
  [personName: string]: number | string
}

const CHART_COLORS = [
  '#6366f1', '#f43f5e', '#f59e0b', '#10b981', '#3b82f6',
  '#ec4899', '#8b5cf6', '#14b8a6', '#f97316', '#64748b',
  '#84cc16', '#06b6d4',
]

export async function getMonthlyTrend(): Promise<MonthlyTrendPoint[]> {
  const now = new Date()

  // Hitung range 6 bulan sekaligus — 1 query, bukan 6
  const oldest = new Date(now.getFullYear(), now.getMonth() - 5, 1)
  const startDate = `${oldest.getFullYear()}-${String(oldest.getMonth() + 1).padStart(2, '0')}-01`
  const endDate   = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]

  const { data } = await supabase
    .from('transactions')
    .select('amount, type, date')
    .gte('date', startDate)
    .lte('date', endDate)
    .in('type', ['income', 'expense'])

  // Aggregate per bulan di memory
  const buckets: Record<string, { income: number; expense: number }> = {}
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    buckets[key] = { income: 0, expense: 0 }
  }

  for (const t of data ?? []) {
    const key = (t.date as string).slice(0, 7) // "YYYY-MM"
    if (!buckets[key]) continue
    if (t.type === 'income')  buckets[key].income  += t.amount as number
    if (t.type === 'expense') buckets[key].expense += Math.abs(t.amount as number)
  }

  return Object.entries(buckets).map(([key, val]) => {
    const [y, m] = key.split('-')
    return { label: MONTHS_SHORT[parseInt(m) - 1], ...val }
  })
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
    const key = (t.category_id as string) ?? 'other'
    grouped[key] = (grouped[key] ?? 0) + Math.abs(t.amount as number)
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
        color: CHART_COLORS[idx % CHART_COLORS.length],
      }
    })
}

export async function getPersonComparison(month: number, year: number): Promise<PersonComparisonItem[]> {
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`
  const endDate = new Date(year, month, 0).toISOString().split('T')[0]

  // Get persons
  const { data: persons } = await supabase
    .from('persons')
    .select('id, name')
    .order('sort_order', { ascending: true })

  const { data } = await supabase
    .from('transactions')
    .select('amount, category_id, person_id, type')
    .gte('date', startDate)
    .lte('date', endDate)
    .eq('type', 'expense')

  const grouped: Record<string, Record<string, number>> = {}
  for (const t of data ?? []) {
    const catKey = (t.category_id as string) ?? 'other'
    const personName = (persons ?? []).find((p) => p.id === t.person_id)?.name as string ?? t.person_id as string
    if (!grouped[catKey]) grouped[catKey] = {}
    grouped[catKey][personName] = (grouped[catKey][personName] ?? 0) + Math.abs(t.amount as number)
  }

  return Object.entries(grouped)
    .sort((a, b) => {
      const sumA = Object.values(a[1]).reduce((s, v) => s + v, 0)
      const sumB = Object.values(b[1]).reduce((s, v) => s + v, 0)
      return sumB - sumA
    })
    .slice(0, 6)
    .map(([id, values]) => {
      const cat = CATEGORIES.find((c) => c.id === id)
      return {
        category: (cat?.icon ?? '📌') + ' ' + (cat?.name ?? 'Lainnya'),
        ...values,
      }
    })
}
