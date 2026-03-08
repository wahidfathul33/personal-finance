'use server'

import { revalidatePath } from 'next/cache'
import { supabase } from '@/lib/supabase'
import type { RecurringTemplate, AddRecurringTemplateInput } from '@/lib/types'
import { getCategoryById, currentMonth, currentYear } from '@/lib/constants'

const WITH_PERSON = '*, person:persons!person_id(name, color)'

// ─── Fetch ────────────────────────────────────────────────────────────────────

export async function getRecurringTemplates(): Promise<RecurringTemplate[]> {
  const { data, error } = await supabase
    .from('recurring_templates')
    .select(WITH_PERSON)
    .order('day_of_month', { ascending: true })

  if (error) throw error

  return (data ?? []).map((t) => ({
    ...(t as unknown as RecurringTemplate),
    person: t.person as { name: string; color: string } | undefined,
    type: t.type as RecurringTemplate['type'],
    category: t.category_id ? getCategoryById(t.category_id as string) : undefined,
  }))
}

// ─── Add ─────────────────────────────────────────────────────────────────────

export async function addRecurringTemplate(input: AddRecurringTemplateInput) {
  const { error } = await supabase.from('recurring_templates').insert({
    name: input.name,
    type: input.type,
    category_id: input.category_id || null,
    person_id: input.person_id || null,
    amount: input.amount,
    day_of_month: input.day_of_month,
    note: input.note || null,
    active: true,
  })

  if (error) throw error
  revalidatePath('/recurring')
}

// ─── Update ──────────────────────────────────────────────────────────────────

export async function updateRecurringTemplate(
  id: string,
  input: Partial<AddRecurringTemplateInput>
) {
  const { error } = await supabase
    .from('recurring_templates')
    .update({
      name: input.name,
      type: input.type,
      category_id: input.category_id || null,
      person_id: input.person_id || null,
      amount: input.amount,
      day_of_month: input.day_of_month,
      note: input.note || null,
    })
    .eq('id', id)

  if (error) throw error
  revalidatePath('/recurring')
}

// ─── Toggle active ────────────────────────────────────────────────────────────

export async function toggleRecurringTemplate(id: string, active: boolean) {
  const { error } = await supabase
    .from('recurring_templates')
    .update({ active })
    .eq('id', id)

  if (error) throw error
  revalidatePath('/recurring')
}

// ─── Delete ──────────────────────────────────────────────────────────────────

export async function deleteRecurringTemplate(id: string) {
  const { error } = await supabase
    .from('recurring_templates')
    .delete()
    .eq('id', id)

  if (error) throw error
  revalidatePath('/recurring')
}

// ─── Auto-generate this month's recurring transactions ───────────────────────

export async function generateRecurringTransactions() {
  const month = currentMonth()
  const year = currentYear()

  const templates = await getRecurringTemplates()
  const activeTemplates = templates.filter((t) => t.active)

  if (!activeTemplates.length) return

  const startDate = `${year}-${String(month).padStart(2, '0')}-01`
  const endDate = new Date(year, month, 0).toISOString().split('T')[0]

  const { data: existingRaw } = await supabase
    .from('transactions')
    .select('note, person_id, category_id, amount')
    .gte('date', startDate)
    .lte('date', endDate)

  const existing = existingRaw ?? []

  // Get all persons (used as fallback when template has no person_id)
  const { data: personsRaw } = await supabase
    .from('persons')
    .select('id, name')
    .order('sort_order', { ascending: true })

  const persons = personsRaw ?? []

  const toInsert: Array<{
    date: string
    person_id: string
    type: string
    category_id: string | null
    amount: number
    note: string | null
    group_id: string | null
  }> = []

  for (const template of activeTemplates) {
    const maxDay = new Date(year, month, 0).getDate()
    const day = Math.min(template.day_of_month, maxDay)
    const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const noteKey = `[recurring:${template.id}]`

    const alreadyExists = existing.some((e) => e.note && e.note.includes(noteKey))
    if (alreadyExists) continue

    const note = template.note ? `${template.note} ${noteKey}` : noteKey

    // Single person — use person_id from template, fallback to first person
    const person_id = template.person_id ?? (persons[0]?.id as string)
    if (!person_id) continue
    toInsert.push({
      date, person_id, type: template.type,
      category_id: template.category_id,
      amount: template.type === 'expense' ? -template.amount : template.amount,
      note, group_id: null,
    })
  }

  if (toInsert.length > 0) {
    await supabase.from('transactions').insert(toInsert)
  }
}
