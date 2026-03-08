'use server'

import { revalidatePath } from 'next/cache'
import { supabase } from '@/lib/supabase'
import type { Saving, AddSavingInput } from '@/lib/types'

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
