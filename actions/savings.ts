'use server'

import { revalidatePath } from 'next/cache'
import { supabase } from '@/lib/supabase'
import type { Saving, AddSavingInput } from '@/lib/types'

export async function getSavings(): Promise<Saving[]> {
  const { data, error } = await supabase
    .from('savings')
    .select('*')
    .order('date', { ascending: false })

  if (error) throw error

  return (data ?? []).map((s) => ({
    ...s,
    person_id: s.person_id as 'mas' | 'fita',
  }))
}

export async function getSavingsSummary() {
  const savings = await getSavings()

  const mas = savings
    .filter((s) => s.person_id === 'mas')
    .reduce((acc, s) => acc + s.amount, 0)

  const fita = savings
    .filter((s) => s.person_id === 'fita')
    .reduce((acc, s) => acc + s.amount, 0)

  return { mas, fita, total: mas + fita, items: savings }
}

export async function addSaving(input: AddSavingInput) {
  const { error } = await supabase.from('savings').insert({
    person_id: input.person_id,
    amount: input.amount,
    date: input.date,
    note: input.note || null,
  })

  if (error) throw error
  revalidatePath('/savings')
  revalidatePath('/')
}

export async function deleteSaving(id: string) {
  const { error } = await supabase.from('savings').delete().eq('id', id)
  if (error) throw error
  revalidatePath('/savings')
  revalidatePath('/')
}

export async function updateSaving(
  id: string,
  data: { person_id: string; amount: number; date: string; note: string | null }
) {
  const { error } = await supabase.from('savings').update(data).eq('id', id)
  if (error) throw error
  revalidatePath('/savings')
  revalidatePath('/')
}
