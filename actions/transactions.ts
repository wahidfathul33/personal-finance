'use server'

import { revalidatePath } from 'next/cache'
import { v4 as uuidv4 } from 'uuid'
import { supabase } from '@/lib/supabase'
import type {
  AddTransactionInput,
  AddSplitBillInput,
  AddTransferInput,
  Transaction,
  TransactionWithCategory,
  TransactionFilters,
} from '@/lib/types'
import { getCategoryById, currentMonth, currentYear } from '@/lib/constants'
import { adjustBalance } from '@/actions/balances'

function parseDateParts(dateStr: string): { month: number; year: number } {
  const [yearStr, monthStr] = dateStr.split('-')
  return { month: parseInt(monthStr), year: parseInt(yearStr) }
}

const WITH_PERSON = '*, person:persons!person_id(name, color)'

function mapRow(t: Record<string, unknown>): TransactionWithCategory {
  return {
    ...(t as unknown as Transaction),
    person: t.person as { name: string; color: string } | undefined,
    type: t.type as TransactionWithCategory['type'],
    category: t.category_id ? getCategoryById(t.category_id as string) : undefined,
  }
}

// ─── Fetch ────────────────────────────────────────────────────────────────────

export async function getTransactions(
  filters: TransactionFilters = {}
): Promise<TransactionWithCategory[]> {
  const month = filters.month ?? currentMonth()
  const year = filters.year ?? currentYear()

  const startDate = `${year}-${String(month).padStart(2, '0')}-01`
  const endDate = new Date(year, month, 0).toISOString().split('T')[0]

  let query = supabase
    .from('transactions')
    .select(WITH_PERSON)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })

  if (filters.person_id && filters.person_id !== 'all') {
    query = query.eq('person_id', filters.person_id)
  }
  if (filters.type && filters.type !== 'all') {
    query = query.eq('type', filters.type)
  }
  if (filters.category_id && filters.category_id !== 'all') {
    query = query.eq('category_id', filters.category_id)
  }

  if (filters.limit !== undefined) {
    const offset = filters.offset ?? 0
    query = query.range(offset, offset + filters.limit - 1)
  }

  const { data, error } = await query
  if (error) throw error

  return (data ?? []).map(mapRow)
}

export async function getRecentTransactions(
  limit = 10
): Promise<TransactionWithCategory[]> {
  const { data, error } = await supabase
    .from('transactions')
    .select(WITH_PERSON)
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return (data ?? []).map(mapRow)
}

// ─── Add single transaction ───────────────────────────────────────────────────

export async function addTransaction(input: AddTransactionInput) {
  const amount =
    input.type === 'expense' ? -Math.abs(input.amount) : Math.abs(input.amount)

  const { error } = await supabase.from('transactions').insert({
    date: input.date,
    person_id: input.person_id,
    type: input.type,
    category_id: input.category_id || null,
    amount,
    note: input.note || null,
  })

  if (error) throw error

  if (!input.skip_balance) {
    const { month, year } = parseDateParts(input.date)
    await adjustBalance(input.person_id, month, year, amount)
  }

  revalidatePath('/')
  revalidatePath('/transactions')
}

// ─── Update transaction ───────────────────────────────────────────────────────

export async function updateTransaction(
  id: string,
  data: {
    date: string
    amount: number
    note: string | null
    category_id: string | null
    person_id: string
    type: string
  }
) {
  // Fetch original to reverse its balance effect
  const { data: original } = await supabase
    .from('transactions')
    .select('date, amount, person_id')
    .eq('id', id)
    .single()

  const { error } = await supabase
    .from('transactions')
    .update(data)
    .eq('id', id)

  if (error) throw error

  if (original) {
    const { month: oldMonth, year: oldYear } = parseDateParts(original.date as string)
    await adjustBalance(original.person_id as string, oldMonth, oldYear, -(original.amount as number))
  }
  const { month, year } = parseDateParts(data.date)
  await adjustBalance(data.person_id, month, year, data.amount)

  revalidatePath('/')
  revalidatePath('/transactions')
}

// ─── Split Bill ───────────────────────────────────────────────────────────────

export async function addSplitBill(input: AddSplitBillInput) {
  const group_id = uuidv4()

  const rows = input.splits.map((s) => ({
    date: input.date,
    person_id: s.person_id,
    type: 'expense',
    category_id: input.category_id || null,
    amount: -Math.abs(s.amount),
    note: input.note || null,
    group_id,
  }))

  const { error } = await supabase.from('transactions').insert(rows)
  if (error) throw error

  const { month, year } = parseDateParts(input.date)
  await Promise.all(
    input.splits.map((s) => adjustBalance(s.person_id, month, year, -Math.abs(s.amount)))
  )

  revalidatePath('/')
  revalidatePath('/transactions')
}

// ─── Transfer ─────────────────────────────────────────────────────────────────

export async function addTransfer(input: AddTransferInput) {
  const group_id = uuidv4()
  const abs = Math.abs(input.amount)

  const rows = [
    {
      date: input.date,
      person_id: input.from_person_id,
      type: 'transfer',
      category_id: 'transfer',
      amount: -abs,
      note: input.note || null,
      group_id,
    },
    {
      date: input.date,
      person_id: input.to_person_id,
      type: 'transfer',
      category_id: 'transfer',
      amount: abs,
      note: input.note || null,
      group_id,
    },
  ]

  const { error } = await supabase.from('transactions').insert(rows)
  if (error) throw error

  const { month, year } = parseDateParts(input.date)
  await adjustBalance(input.from_person_id, month, year, -abs)
  await adjustBalance(input.to_person_id, month, year, abs)

  revalidatePath('/')
  revalidatePath('/transactions')
}

// ─── Duplicate ─────────────────────────────────────────────────────────────────

export async function duplicateTransaction(transaction: Transaction) {
  const today = new Date().toISOString().split('T')[0]

  const { error } = await supabase.from('transactions').insert({
    date: today,
    person_id: transaction.person_id,
    type: transaction.type,
    category_id: transaction.category_id,
    amount: transaction.amount,
    note: transaction.note,
    group_id: null,
  })

  if (error) throw error

  const { month, year } = parseDateParts(today)
  await adjustBalance(transaction.person_id, month, year, transaction.amount as number)

  revalidatePath('/')
  revalidatePath('/transactions')
}

// ─── Delete ────────────────────────────────────────────────────────────────────

export async function deleteTransaction(id: string) {
  // Fetch first to reverse its balance effect
  const { data: tx } = await supabase
    .from('transactions')
    .select('date, amount, person_id')
    .eq('id', id)
    .single()

  const { error } = await supabase.from('transactions').delete().eq('id', id)
  if (error) throw error

  if (tx) {
    const { month, year } = parseDateParts(tx.date as string)
    await adjustBalance(tx.person_id as string, month, year, -(tx.amount as number))
  }

  revalidatePath('/')
  revalidatePath('/transactions')
}
