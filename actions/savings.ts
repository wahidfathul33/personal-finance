'use server'

import { revalidatePath } from 'next/cache'
import { supabase } from '@/lib/supabase'
import type { Saving, AddSavingInput } from '@/lib/types'
import { adjustBalance } from '@/actions/balances'

const WITH_PERSON = '*, person:persons!person_id(name, color)'

export async function getSavings(): Promise<Saving[]> {
  const { data, error } = await supabase
    .from('savings')
    .select(WITH_PERSON)
    .order('date', { ascending: false })

  if (error) throw error

  return (data ?? []).map((s) => ({
    ...(s as unknown as Saving),
    person: s.person as { name: string; color: string } | undefined,
  }))
}

export async function getSavingsSummary() {
  const savings = await getSavings()

  const byPerson: Record<string, number> = {}
  for (const s of savings) {
    const name = s.person?.name ?? s.person_id
    byPerson[name] = (byPerson[name] ?? 0) + s.amount
  }

  const total = Object.values(byPerson).reduce((a, b) => a + b, 0)
  return { byPerson, total, items: savings }
}

function parseDateParts(dateStr: string): { month: number; year: number } {
  const [yearStr, monthStr] = dateStr.split('-')
  return { month: parseInt(monthStr), year: parseInt(yearStr) }
}

export async function addSaving(input: AddSavingInput) {
  const { error } = await supabase.from('savings').insert({
    person_id: input.person_id,
    amount: input.amount,
    date: input.date,
    note: input.note || null,
  })

  if (error) throw error

  // Hanya kurangi saldo jika menabung (amount > 0). Pengeluaran dari tabungan tidak mengubah saldo.
  if (input.amount > 0) {
    const { month, year } = parseDateParts(input.date)
    await adjustBalance(input.person_id, month, year, -input.amount)
  }

  revalidatePath('/savings')
  revalidatePath('/')
}

export async function deleteSaving(id: string) {
  // Fetch dulu untuk kembalikan saldo
  const { data: saving } = await supabase
    .from('savings')
    .select('person_id, amount, date')
    .eq('id', id)
    .single()

  const { error } = await supabase.from('savings').delete().eq('id', id)
  if (error) throw error

  if (saving) {
    // Kembalikan saldo hanya jika dulu menabung (amount > 0)
    if ((saving.amount as number) > 0) {
      const { month, year } = parseDateParts(saving.date as string)
      await adjustBalance(saving.person_id as string, month, year, saving.amount as number)
    }
  }

  revalidatePath('/savings')
  revalidatePath('/')
}

export async function updateSaving(
  id: string,
  data: { person_id: string; amount: number; date: string; note: string | null }
) {
  // Fetch original untuk reverse saldo lama
  const { data: original } = await supabase
    .from('savings')
    .select('person_id, amount, date')
    .eq('id', id)
    .single()

  const { error } = await supabase.from('savings').update(data).eq('id', id)
  if (error) throw error

  if (original) {
    // Reverse saldo lama hanya jika dulu menabung
    if ((original.amount as number) > 0) {
      const { month: oldMonth, year: oldYear } = parseDateParts(original.date as string)
      await adjustBalance(original.person_id as string, oldMonth, oldYear, original.amount as number)
    }
  }
  // Apply saldo baru hanya jika sekarang menabung
  if (data.amount > 0) {
    const { month, year } = parseDateParts(data.date)
    await adjustBalance(data.person_id, month, year, -data.amount)
  }

  revalidatePath('/savings')
  revalidatePath('/')
}
