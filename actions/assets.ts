'use server'

import { revalidatePath } from 'next/cache'
import { supabase } from '@/lib/supabase'
import type { Asset, GoldPrice, AddAssetInput, UpdateGoldPriceInput } from '@/lib/types'

// ─── Assets ───────────────────────────────────────────────────────────────────

export async function getAssets(): Promise<Asset[]> {
  const { data, error } = await supabase
    .from('assets')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []).map((a) => ({
    ...a,
    type: a.type as 'gold' | 'deposit' | 'other',
  }))
}

export async function addAsset(input: AddAssetInput) {
  const { error } = await supabase.from('assets').insert({
    name: input.name,
    type: input.type,
    amount: input.amount,
    unit: input.unit,
    note: input.note ?? null,
  })

  if (error) throw error
  revalidatePath('/assets')
}

export async function updateAsset(id: string, input: Partial<AddAssetInput>) {
  const { error } = await supabase
    .from('assets')
    .update({
      name: input.name,
      amount: input.amount,
      unit: input.unit,
      ...(input.note !== undefined ? { note: input.note } : {}),
    })
    .eq('id', id)

  if (error) throw error
  revalidatePath('/assets')
}

export async function deleteAsset(id: string) {
  const { error } = await supabase.from('assets').delete().eq('id', id)
  if (error) throw error
  revalidatePath('/assets')
}

// ─── Gold Prices ──────────────────────────────────────────────────────────────

export async function getLatestGoldPrice(): Promise<GoldPrice | null> {
  const { data } = await supabase
    .from('gold_prices')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  return data ?? null
}

export async function getGoldPriceHistory(): Promise<GoldPrice[]> {
  const { data, error } = await supabase
    .from('gold_prices')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) throw error
  return data ?? []
}

export async function updateGoldPrice(input: UpdateGoldPriceInput) {
  const { error } = await supabase.from('gold_prices').insert({
    price_per_gram: input.price_per_gram,
    date: input.date,
  })

  if (error) throw error
  revalidatePath('/assets')
}

// ─── Summary ──────────────────────────────────────────────────────────────────

export async function getAssetsSummary() {
  const [assets, goldPrice] = await Promise.all([
    getAssets(),
    getLatestGoldPrice(),
  ])

  const goldAssets = assets.filter((a) => a.type === 'gold')
  const depositAssets = assets.filter((a) => a.type === 'deposit')
  const totalGrams = goldAssets.reduce((acc, a) => acc + a.amount, 0)
  const pricePerGram = goldPrice?.price_per_gram ?? 0
  const totalGoldValue = totalGrams * pricePerGram
  const totalDepositValue = depositAssets.reduce((acc, a) => acc + a.amount, 0)

  return {
    assets,
    goldAssets,
    depositAssets,
    totalGrams,
    pricePerGram,
    totalGoldValue,
    goldPrice,
    totalDepositValue,
  }
}
