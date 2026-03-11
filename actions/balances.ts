'use server'

import { supabase } from '@/lib/supabase'
import { currentMonth, currentYear } from '@/lib/constants'

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

  return (data?.amount ?? 0) as number
}

// Adjust balance for a person in a given month/year by delta.
// If no row exists yet, it is created with amount = 0 before adjusting.
export async function adjustBalance(
  person_id: string,
  month: number,
  year: number,
  delta: number
): Promise<void> {
  // Ensure row exists
  await supabase
    .from('balances')
    .upsert(
      { person_id, month, year, amount: 0 },
      { onConflict: 'person_id,month,year', ignoreDuplicates: true }
    )

  const { data } = await supabase
    .from('balances')
    .select('amount')
    .eq('person_id', person_id)
    .eq('month', month)
    .eq('year', year)
    .single()

  const newAmount = ((data?.amount ?? 0) as number) + delta

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

  // Get all persons
  const { data: persons } = await supabase
    .from('persons')
    .select('id, name, color')
    .order('sort_order', { ascending: true })

  if (!persons?.length) return { people: [], total: 0 }

  const balances = await Promise.all(
    persons.map(async (p) => ({
      id: p.id as string,
      name: p.name as string,
      color: p.color as string,
      amount: await getPersonBalance(p.id as string, m, y),
    }))
  )

  const total = balances.reduce((acc, b) => acc + b.amount, 0)
  return { people: balances, total }
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
