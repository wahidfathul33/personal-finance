'use server'

import { supabase } from '@/lib/supabase'
import { currentMonth, currentYear } from '@/lib/constants'

async function getPreviousMonthBalance(
  person_id: string,
  month: number,
  year: number
): Promise<number> {
  const prevMonth = month === 1 ? 12 : month - 1
  const prevYear = month === 1 ? year - 1 : year

  const { data } = await supabase
    .from('balances')
    .select('amount')
    .eq('person_id', person_id)
    .eq('month', prevMonth)
    .eq('year', prevYear)
    .single()

  return (data?.amount ?? 0) as number
}

export async function getPersonBalance(
  person_id: string,
  month?: number,
  year?: number
): Promise<number> {
  const m = month ?? currentMonth()
  const y = year ?? currentYear()

  const { data } = await supabase
    .from('balances')
    .select('amount')
    .eq('person_id', person_id)
    .eq('month', m)
    .eq('year', y)
    .single()

  if (data) return data.amount as number

  // No row for this month yet — roll over from previous month
  return getPreviousMonthBalance(person_id, m, y)
}

// Adjust balance for a person in a given month/year by delta.
// If no row exists yet, it is created starting from the previous month's balance.
export async function adjustBalance(
  person_id: string,
  month: number,
  year: number,
  delta: number
): Promise<void> {
  const { data: existing } = await supabase
    .from('balances')
    .select('amount')
    .eq('person_id', person_id)
    .eq('month', month)
    .eq('year', year)
    .single()

  if (!existing) {
    // Initialize from previous month's balance (rollover)
    const prevBalance = await getPreviousMonthBalance(person_id, month, year)
    const { error } = await supabase
      .from('balances')
      .insert({ person_id, month, year, amount: prevBalance + delta })
    if (error) throw error
    return
  }

  const newAmount = (existing.amount as number) + delta

  const { error } = await supabase
    .from('balances')
    .update({ amount: newAmount })
    .eq('person_id', person_id)
    .eq('month', month)
    .eq('year', year)

  if (error) throw error
}

export async function getAllBalances(month?: number, year?: number) {
  const m = month ?? currentMonth()
  const y = year ?? currentYear()

  // Fetch persons + current month balances + prev month balances in 3 parallel queries
  const prevMonth = m === 1 ? 12 : m - 1
  const prevYear  = m === 1 ? y - 1 : y

  const [{ data: persons }, { data: currRows }, { data: prevRows }] = await Promise.all([
    supabase.from('persons').select('id, name, color').order('sort_order', { ascending: true }),
    supabase.from('balances').select('person_id, amount').eq('month', m).eq('year', y),
    supabase.from('balances').select('person_id, amount').eq('month', prevMonth).eq('year', prevYear),
  ])

  if (!persons?.length) return { people: [], total: 0, prevTotal: 0 }

  const currMap = Object.fromEntries((currRows ?? []).map((r) => [r.person_id as string, r.amount as number]))
  const prevMap = Object.fromEntries((prevRows ?? []).map((r) => [r.person_id as string, r.amount as number]))

  const balances = persons.map((p) => ({
    id: p.id as string,
    name: p.name as string,
    color: p.color as string,
    amount: (currMap[p.id as string] ?? prevMap[p.id as string] ?? 0) as number,
  }))

  const total = balances.reduce((acc, b) => acc + b.amount, 0)
  const prevTotal = Object.values(prevMap).reduce((acc, v) => acc + (v as number), 0)
  return { people: balances, total, prevTotal }
}

export async function getMonthlyStats(month?: number, year?: number) {
  const m = month ?? currentMonth()
  const y = year ?? currentYear()
  const startDate = `${y}-${String(m).padStart(2, '0')}-01`
  const endDate = new Date(y, m, 0).toISOString().split('T')[0]

  const { data } = await supabase
    .from('transactions')
    .select('amount, type')
    .gte('date', startDate)
    .lte('date', endDate)

  const income = (data ?? [])
    .filter((t) => t.type === 'income')
    .reduce((acc, t) => acc + (t.amount as number), 0)

  const expense = (data ?? [])
    .filter((t) => t.type === 'expense')
    .reduce((acc, t) => acc + Math.abs(t.amount as number), 0)

  return { income, expense }
}

export async function getMonthlyStatsWithComparison(month?: number, year?: number) {
  const m = month ?? currentMonth()
  const y = year ?? currentYear()
  
  // Current month
  const currStart = `${y}-${String(m).padStart(2, '0')}-01`
  const currEnd = new Date(y, m, 0).toISOString().split('T')[0]
  
  // Previous month
  const prevMonth = m === 1 ? 12 : m - 1
  const prevYear = m === 1 ? y - 1 : y
  const prevStart = `${prevYear}-${String(prevMonth).padStart(2, '0')}-01`
  const prevEnd = new Date(prevYear, prevMonth, 0).toISOString().split('T')[0]

  const [{ data: currData }, { data: prevData }, { data: persons }] = await Promise.all([
    supabase.from('transactions').select('amount, type, person_id').gte('date', currStart).lte('date', currEnd),
    supabase.from('transactions').select('amount, type, person_id').gte('date', prevStart).lte('date', prevEnd),
    supabase.from('persons').select('id, name, color').order('sort_order', { ascending: true }),
  ])

  const calc = (data: any[]) => ({
    income: (data ?? []).filter((t) => t.type === 'income').reduce((acc, t) => acc + (t.amount as number), 0),
    expense: (data ?? []).filter((t) => t.type === 'expense').reduce((acc, t) => acc + Math.abs(t.amount as number), 0),
  })

  const curr = calc(currData ?? [])
  const prev = calc(prevData ?? [])

  const pct = (curr: number, prev: number) => prev === 0 ? (curr > 0 ? 100 : 0) : Math.round(((curr - prev) / prev) * 100)

  // Per-person breakdown with comparison
  const perPerson = (persons ?? []).map((p) => {
    const currRows = (currData ?? []).filter((t: any) => t.person_id === p.id)
    const prevRows = (prevData ?? []).filter((t: any) => t.person_id === p.id)

    const income = currRows.filter((t: any) => t.type === 'income').reduce((acc: number, t: any) => acc + (t.amount as number), 0)
    const expense = currRows.filter((t: any) => t.type === 'expense').reduce((acc: number, t: any) => acc + Math.abs(t.amount as number), 0)
    const prevIncome = prevRows.filter((t: any) => t.type === 'income').reduce((acc: number, t: any) => acc + (t.amount as number), 0)
    const prevExpense = prevRows.filter((t: any) => t.type === 'expense').reduce((acc: number, t: any) => acc + Math.abs(t.amount as number), 0)

    return {
      id: p.id as string,
      name: p.name as string,
      color: p.color as string,
      income, expense,
      incomePct: pct(income, prevIncome),
      expensePct: pct(expense, prevExpense),
    }
  })

  return {
    income: curr.income,
    expense: curr.expense,
    incomePct: pct(curr.income, prev.income),
    expensePct: pct(curr.expense, prev.expense),
    prevIncome: prev.income,
    prevExpense: prev.expense,
    perPerson,
  }
}
