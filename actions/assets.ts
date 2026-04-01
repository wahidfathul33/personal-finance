'use server'

import { revalidatePath } from 'next/cache'
import { supabase } from '@/lib/supabase'
import type { Asset, GoldPrice, AddAssetInput, UpdateGoldPriceInput } from '@/lib/types'
import { adjustBalance } from '@/actions/balances'

function parseDateParts(dateStr: string): { month: number; year: number } {
  const [yearStr, monthStr] = dateStr.split('-')
  return { month: parseInt(monthStr), year: parseInt(yearStr) }
}

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
    sub_type: a.sub_type as 'logam_mulia' | 'perhiasan' | null ?? null,
  }))
}

export async function addAsset(input: AddAssetInput) {
  const { error } = await supabase.from('assets').insert({
    name: input.name,
    type: input.type,
    sub_type: input.sub_type ?? null,
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
    jewelry_price_per_gram: input.jewelry_price_per_gram ?? null,
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
  const lmAssets = goldAssets.filter((a) => a.sub_type === 'logam_mulia' || !a.sub_type)
  const jewelryAssets = goldAssets.filter((a) => a.sub_type === 'perhiasan')
  const depositAssets = assets.filter((a) => a.type === 'deposit')
  const totalGrams = goldAssets.reduce((acc, a) => acc + a.amount, 0)
  const totalLmGrams = lmAssets.reduce((acc, a) => acc + a.amount, 0)
  const totalJewelryGrams = jewelryAssets.reduce((acc, a) => acc + a.amount, 0)
  const pricePerGram = goldPrice?.price_per_gram ?? 0
  const jewelryPricePerGram = goldPrice?.jewelry_price_per_gram ?? 0
  const totalGoldValue = totalLmGrams * pricePerGram + totalJewelryGrams * jewelryPricePerGram
  const totalDepositValue = depositAssets.reduce((acc, a) => acc + a.amount, 0)

  return {
    assets,
    goldAssets,
    lmAssets,
    jewelryAssets,
    depositAssets,
    totalGrams,
    totalLmGrams,
    totalJewelryGrams,
    pricePerGram,
    jewelryPricePerGram,
    totalGoldValue,
    goldPrice,
    totalDepositValue,
  }
}

// ─── Deposit: Setor (potong balance) ─────────────────────────────────────────

export async function addDepositWithTransaction(input: {
  name: string
  amount: number
  note: string | null
  person_id: string
  date: string
  deduct_from_balance: boolean
}) {
  const { error } = await supabase.from('assets').insert({
    name: input.name,
    type: 'deposit',
    amount: input.amount,
    unit: 'IDR',
    note: input.note ?? null,
  })
  if (error) throw error

  if (input.deduct_from_balance) {
    const { month, year } = parseDateParts(input.date)
    await adjustBalance(input.person_id, month, year, -Math.abs(input.amount))
  }

  revalidatePath('/assets')
}

// ─── Deposit: Cairkan (masuk ke balance) ─────────────────────────────────────

export async function cairkanDeposito(input: {
  asset_id: string
  asset_name: string
  person_id: string
  date: string
  pokok: number
  bunga: number
}) {
  const total = input.pokok + input.bunga
  const { month, year } = parseDateParts(input.date)

  const { error: txError } = await supabase.from('transactions').insert({
    date: input.date,
    person_id: input.person_id,
    type: 'income',
    category_id: 'deposit',
    amount: total,
    note: `Cairkan deposito: ${input.asset_name}${input.bunga > 0 ? ` (bunga: ${input.bunga.toLocaleString('id-ID')})` : ''}`,
    group_id: null,
  })
  if (txError) throw txError

  await adjustBalance(input.person_id, month, year, total)

  const { error: delError } = await supabase.from('assets').delete().eq('id', input.asset_id)
  if (delError) throw delError

  revalidatePath('/assets')
}
