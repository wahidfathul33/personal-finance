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
    .select('*')
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

  const { data, error } = await query
  if (error) throw error

  return (data ?? []).map((t) => ({
    ...t,
    person_id: t.person_id as 'mas' | 'fita',
    type: t.type as 'income' | 'expense' | 'transfer',
    category: t.category_id ? getCategoryById(t.category_id) : undefined,
  }))
}

export async function getRecentTransactions(
  limit = 10
): Promise<TransactionWithCategory[]> {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error

  return (data ?? []).map((t) => ({
    ...t,
    person_id: t.person_id as 'mas' | 'fita',
    type: t.type as 'income' | 'expense' | 'transfer',
    category: t.category_id ? getCategoryById(t.category_id) : undefined,
  }))
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
  revalidatePath('/')
  revalidatePath('/transactions')
}

// ─── Split Bill ───────────────────────────────────────────────────────────────

export async function addSplitBill(input: AddSplitBillInput) {
  const group_id = uuidv4()

  let mas_amount: number
  let fita_amount: number

  if (input.split_type === 'equal') {
    mas_amount = Math.round(input.total_amount / 2)
    fita_amount = input.total_amount - mas_amount
  } else {
    mas_amount = input.mas_amount ?? Math.round(input.total_amount / 2)
    fita_amount = input.fita_amount ?? input.total_amount - mas_amount
  }

  const rows = [
    {
      date: input.date,
      person_id: 'mas',
      type: 'expense',
      category_id: input.category_id || null,
      amount: -mas_amount,
      note: input.note || null,
      group_id,
    },
    {
      date: input.date,
      person_id: 'fita',
      type: 'expense',
      category_id: input.category_id || null,
      amount: -fita_amount,
      note: input.note || null,
      group_id,
    },
  ]

  const { error } = await supabase.from('transactions').insert(rows)
  if (error) throw error
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
      person_id: input.from_person,
      type: 'transfer',
      category_id: 'transfer',
      amount: -abs,
      note: input.note || null,
      group_id,
    },
    {
      date: input.date,
      person_id: input.to_person,
      type: 'transfer',
      category_id: 'transfer',
      amount: abs,
      note: input.note || null,
      group_id,
    },
  ]

  const { error } = await supabase.from('transactions').insert(rows)
  if (error) throw error
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
  revalidatePath('/')
  revalidatePath('/transactions')
}

// ─── Delete ────────────────────────────────────────────────────────────────────

export async function deleteTransaction(id: string) {
  const { error } = await supabase.from('transactions').delete().eq('id', id)
  if (error) throw error
  revalidatePath('/')
  revalidatePath('/transactions')
}

export async function deleteTransactionGroup(group_id: string) {
  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('group_id', group_id)
  if (error) throw error
  revalidatePath('/')
  revalidatePath('/transactions')
}

// ─── Update ────────────────────────────────────────────────────────────────────

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
  const { error } = await supabase
    .from('transactions')
    .update(data)
    .eq('id', id)
  if (error) throw error
  revalidatePath('/')
  revalidatePath('/transactions')
}
