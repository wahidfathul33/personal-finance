'use server'

import { revalidatePath } from 'next/cache'
import { supabase } from '@/lib/supabase'
import type { Piutang, PiutangPayment, AddPiutangInput, AddPiutangPaymentInput } from '@/lib/types'

export async function getPiutang(): Promise<Piutang[]> {
  const { data, error } = await supabase
    .from('piutang')
    .select('*, payments:piutang_payments(*)')
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as unknown as Piutang[]
}

export async function addPiutang(input: AddPiutangInput): Promise<Piutang> {
  const { data, error } = await supabase
    .from('piutang')
    .insert({
      debtor_name: input.debtor_name,
      amount: input.amount,
      date: input.date,
      note: input.note || null,
      person_id: input.person_id || null,
    })
    .select()
    .single()
  if (error) throw error
  revalidatePath('/assets')
  return data as unknown as Piutang
}

export async function deletePiutang(id: string) {
  const { error } = await supabase.from('piutang').delete().eq('id', id)
  if (error) throw error
  revalidatePath('/assets')
}

export async function addPiutangPayment(
  input: AddPiutangPaymentInput
): Promise<{ payment: PiutangPayment; newStatus: 'outstanding' | 'paid' }> {
  const { data: payment, error } = await supabase
    .from('piutang_payments')
    .insert({
      piutang_id: input.piutang_id,
      amount: input.amount,
      date: input.date,
      note: input.note || null,
    })
    .select()
    .single()
  if (error) throw error

  // Recalculate status
  const { data: piutang } = await supabase
    .from('piutang')
    .select('amount, piutang_payments(amount)')
    .eq('id', input.piutang_id)
    .single()

  let newStatus: 'outstanding' | 'paid' = 'outstanding'
  if (piutang) {
    const totalPaid = (piutang.piutang_payments as { amount: number }[]).reduce(
      (s, p) => s + p.amount,
      0
    )
    if (totalPaid >= piutang.amount) {
      newStatus = 'paid'
      await supabase.from('piutang').update({ status: 'paid' }).eq('id', input.piutang_id)
    }
  }

  revalidatePath('/assets')
  return { payment: payment as unknown as PiutangPayment, newStatus }
}

export async function deletePiutangPayment(id: string) {
  const { data: payment } = await supabase
    .from('piutang_payments')
    .select('piutang_id, amount')
    .eq('id', id)
    .single()

  const { error } = await supabase.from('piutang_payments').delete().eq('id', id)
  if (error) throw error

  // Recalculate status after deletion
  if (payment) {
    const { data: piutang } = await supabase
      .from('piutang')
      .select('amount, piutang_payments(amount)')
      .eq('id', payment.piutang_id)
      .single()
    if (piutang) {
      const totalPaid = (piutang.piutang_payments as { amount: number }[]).reduce(
        (s, p) => s + p.amount,
        0
      )
      const newStatus = totalPaid >= piutang.amount ? 'paid' : 'outstanding'
      await supabase.from('piutang').update({ status: newStatus }).eq('id', payment.piutang_id)
    }
  }

  revalidatePath('/assets')
}
