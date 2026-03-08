'use server'

import { revalidatePath } from 'next/cache'
import { v4 as uuidv4 } from 'uuid'
import { supabase } from '@/lib/supabase'
import type { RecurringTemplate, AddRecurringTemplateInput } from '@/lib/types'
import { getCategoryById, currentMonth, currentYear } from '@/lib/constants'

// ─── Fetch ────────────────────────────────────────────────────────────────────

export async function getRecurringTemplates(): Promise<RecurringTemplate[]> {
  const { data, error } = await supabase
    .from('recurring_templates')
    .select('*')
    .order('day_of_month', { ascending: true })

  if (error) throw error

  return (data ?? []).map((t) => ({
    ...t,
    person_id: t.person_id as 'mas' | 'fita' | null,
    type: t.type as 'income' | 'expense' | 'transfer',
    split_type: t.split_type as 'equal' | 'custom' | 'full_mas' | 'full_fita',
    category: t.category_id ? getCategoryById(t.category_id) : undefined,
  }))
}

// ─── Add ──────────────────────────────────────────────────────────────────────

export async function addRecurringTemplate(input: AddRecurringTemplateInput) {
  const { error } = await supabase.from('recurring_templates').insert({
    name: input.name,
    type: input.type,
    category_id: input.category_id || null,
    person_id: input.person_id || null,
    amount: input.amount,
    day_of_month: input.day_of_month,
    split_type: input.split_type,
    split_ratio_mas: input.split_ratio_mas,
    split_ratio_fita: input.split_ratio_fita,
    note: input.note || null,
    active: true,
  })

  if (error) throw error
  revalidatePath('/recurring')
}

// ─── Update ───────────────────────────────────────────────────────────────────

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
      split_type: input.split_type,
      split_ratio_mas: input.split_ratio_mas,
      split_ratio_fita: input.split_ratio_fita,
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

// ─── Delete ────────────────────────────────────────────────────────────────────

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

  // Fetch existing recurring transactions for this month to avoid duplicates
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`
  const endDate = new Date(year, month, 0).toISOString().split('T')[0]

  const { data: existingRaw } = await supabase
    .from('transactions')
    .select('note, person_id, category_id, amount')
    .gte('date', startDate)
    .lte('date', endDate)

  const existing = existingRaw ?? []

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

    // Skip if already generated
    const alreadyExists = existing.some(
      (e) => e.note && e.note.includes(noteKey)
    )
    if (alreadyExists) continue

    const note = template.note
      ? `${template.note} ${noteKey}`
      : noteKey

    const group_id = uuidv4()

    if (template.split_type === 'equal') {
      const half = Math.round(template.amount / 2)
      toInsert.push({
        date,
        person_id: 'mas',
        type: template.type,
        category_id: template.category_id,
        amount: template.type === 'expense' ? -half : half,
        note,
        group_id,
      })
      toInsert.push({
        date,
        person_id: 'fita',
        type: template.type,
        category_id: template.category_id,
        amount: template.type === 'expense' ? -(template.amount - half) : template.amount - half,
        note,
        group_id,
      })
    } else if (template.split_type === 'custom') {
      const mas_amount = Math.round(
        (template.split_ratio_mas / 100) * template.amount
      )
      const fita_amount = template.amount - mas_amount
      toInsert.push({
        date,
        person_id: 'mas',
        type: template.type,
        category_id: template.category_id,
        amount: template.type === 'expense' ? -mas_amount : mas_amount,
        note,
        group_id,
      })
      toInsert.push({
        date,
        person_id: 'fita',
        type: template.type,
        category_id: template.category_id,
        amount: template.type === 'expense' ? -fita_amount : fita_amount,
        note,
        group_id,
      })
    } else {
      // full_mas, full_fita, or single person
      const person_id = template.person_id ??
        (template.split_type === 'full_mas' ? 'mas' : 'fita')
      toInsert.push({
        date,
        person_id,
        type: template.type,
        category_id: template.category_id,
        amount: template.type === 'expense' ? -template.amount : template.amount,
        note,
        group_id: null,
      })
    }
  }

  if (toInsert.length > 0) {
    const { error } = await supabase.from('transactions').insert(toInsert)
    if (error) throw error
  }

  revalidatePath('/')
  revalidatePath('/transactions')
}
