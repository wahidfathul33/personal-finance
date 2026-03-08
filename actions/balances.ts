'use server'

import { supabase } from '@/lib/supabase'
import type { PersonId } from '@/lib/types'
import { currentMonth, currentYear } from '@/lib/constants'

export async function getBalance(
  person_id: PersonId,
  month?: number,
  year?: number
): Promise<number> {
  const m = month ?? currentMonth()
  const y = year ?? currentYear()

  // Starting balance for the month
  const { data: balanceRow } = await supabase
    .from('balances')
    .select('amount')
    .eq('person_id', person_id)
    .eq('month', m)
    .eq('year', y)
    .single()

  const startingBalance = balanceRow?.amount ?? 0

  // Sum of all transactions for this person this month
  const startDate = `${y}-${String(m).padStart(2, '0')}-01`
  const endDate = new Date(y, m, 0).toISOString().split('T')[0]

  const { data: txRows } = await supabase
    .from('transactions')
    .select('amount')
    .eq('person_id', person_id)
    .gte('date', startDate)
    .lte('date', endDate)

  const txSum = (txRows ?? []).reduce((acc, t) => acc + t.amount, 0)

  return startingBalance + txSum
}

export async function getAllBalances(month?: number, year?: number) {
  const m = month ?? currentMonth()
  const y = year ?? currentYear()

  const [mas, fita] = await Promise.all([
    getBalance('mas', m, y),
    getBalance('fita', m, y),
  ])

  return {
    mas,
    fita,
    total: mas + fita,
  }
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
    .reduce((acc, t) => acc + t.amount, 0)

  const expense = (data ?? [])
    .filter((t) => t.type === 'expense')
    .reduce((acc, t) => acc + Math.abs(t.amount), 0)

  return { income, expense }
}
