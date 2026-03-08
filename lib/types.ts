export type TransactionType = 'income' | 'expense' | 'transfer'
export type AssetType = 'gold' | 'deposit' | 'other'

export interface Person {
  id: string
  name: string
  color: string
  sort_order: number
  created_at: string
}

export interface Category {
  id: string
  name: string
  type: TransactionType | 'all'
  icon?: string
}

export interface Transaction {
  id: string
  date: string
  person_id: string
  type: TransactionType
  category_id: string | null
  amount: number
  note: string | null
  group_id: string | null
  created_at: string
  person?: { name: string; color: string }
  category?: Category
}

export interface TransactionWithCategory extends Transaction {
  category: Category | undefined
}

export interface RecurringTemplate {
  id: string
  name: string
  type: TransactionType
  category_id: string | null
  person_id: string | null
  amount: number
  day_of_month: number
  note: string | null
  active: boolean
  created_at: string
  person?: { name: string; color: string }
  category?: Category
}

export interface Balance {
  id: string
  person_id: string
  month: number
  year: number
  amount: number
  person?: { name: string; color: string }
}

export interface Saving {
  id: string
  person_id: string
  amount: number
  date: string
  note: string | null
  created_at: string
  person?: { name: string; color: string }
}

export interface Asset {
  id: string
  name: string
  type: AssetType
  amount: number
  unit: string
  note?: string | null
  created_at: string
}

export interface GoldPrice {
  id: string
  price_per_gram: number
  date: string
  created_at: string
}

// ─── Form input types ─────────────────────────────────────────────────────────

export interface AddTransactionInput {
  date: string
  person_id: string
  type: TransactionType
  category_id: string
  amount: number
  note: string
}

export interface SplitEntry {
  person_id: string
  amount: number
}

export interface AddSplitBillInput {
  date: string
  category_id: string
  note: string
  splits: SplitEntry[]
}

export interface AddTransferInput {
  date: string
  from_person_id: string
  to_person_id: string
  amount: number
  note: string
}

export interface AddRecurringTemplateInput {
  name: string
  type: TransactionType
  category_id: string
  person_id: string | null
  amount: number
  day_of_month: number
  note: string
}

export interface AddSavingInput {
  person_id: string
  amount: number
  date: string
  note: string
}

export interface AddAssetInput {
  name: string
  type: AssetType
  amount: number
  unit: string
  note?: string | null
}

export interface UpdateGoldPriceInput {
  price_per_gram: number
  date: string
}

export interface TransactionFilters {
  person_id?: string | 'all'
  category_id?: string | 'all'
  type?: TransactionType | 'all'
  month?: number
  year?: number
  limit?: number
  offset?: number
}
