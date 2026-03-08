'use server'

import { revalidatePath } from 'next/cache'
import { supabase } from '@/lib/supabase'
import type { Person } from '@/lib/types'

export async function getPersons(): Promise<Person[]> {
  const { data, error } = await supabase
    .from('persons')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true })

  if (error) throw error
  return (data ?? []) as Person[]
}

export async function addPerson(name: string, color: string): Promise<Person> {
  // Get current max sort_order
  const { data: existing } = await supabase
    .from('persons')
    .select('sort_order')
    .order('sort_order', { ascending: false })
    .limit(1)

  const nextOrder = ((existing?.[0]?.sort_order ?? -1) as number) + 1

  const { data, error } = await supabase
    .from('persons')
    .insert({ name, color, sort_order: nextOrder })
    .select()
    .single()

  if (error) throw error
  revalidatePath('/')
  revalidatePath('/settings')
  return data as Person
}

export async function updatePerson(
  id: string,
  updates: { name?: string; color?: string; sort_order?: number }
) {
  const { error } = await supabase
    .from('persons')
    .update(updates)
    .eq('id', id)

  if (error) throw error
  revalidatePath('/')
  revalidatePath('/settings')
}

export async function deletePerson(id: string) {
  const { error } = await supabase.from('persons').delete().eq('id', id)
  if (error) throw error
  revalidatePath('/')
  revalidatePath('/settings')
}
