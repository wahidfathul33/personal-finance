export type PersonId = 'mas' | 'fita'
export type TransactionType = 'income' | 'expense' | 'transfer'
export type SplitType = 'equal' | 'custom' | 'full_mas' | 'full_fita'
export type AssetType = 'gold' | 'other'

export interface Person {
  id: PersonId
  name: string
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
  person_id: PersonId
  type: TransactionType
  category_id: string | null
  amount: number
  note: string | null
  group_id: string | null
  created_at: string
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
  person_id: PersonId | null
  amount: number
  day_of_month: number
  split_type: SplitType
  split_ratio_mas: number
  split_ratio_fita: number
  note: string | null
  active: boolean
  created_at: string
  category?: Category
}

export interface Balance {
  id: string
  person_id: PersonId
  month: number
  year: number
  amount: number
}

export interface Saving {
  id: string
  person_id: PersonId
  amount: number
  date: string
  note: string | null
  created_at: string
}

export interface Asset {
  id: string
  name: string
  type: AssetType
  amount: number
  unit: string
  created_at: string
}

export interface GoldPrice {
  id: string
  price_per_gram: number
  date: string
  created_at: string
}

// Form input types
export interface AddTransactionInput {
  date: string
  person_id: PersonId
  type: TransactionType
  category_id: string
  amount: number
  note: string
}

export interface AddSplitBillInput {
  date: string
  category_id: string
  total_amount: number
  note: string
  split_type: 'equal' | 'custom'
  mas_amount?: number
  fita_amount?: number
}

export interface AddTransferInput {
  date: string
  from_person: PersonId
  to_person: PersonId
  amount: number
  note: string
}

export interface AddRecurringTemplateInput {
  name: string
  type: TransactionType
  category_id: string
  person_id: PersonId | null
  amount: number
  day_of_month: number
  split_type: SplitType
  split_ratio_mas: number
  split_ratio_fita: number
  note: string
}

export interface AddSavingInput {
  person_id: PersonId
  amount: number
  date: string
  note: string
}

export interface AddAssetInput {
  name: string
  type: AssetType
  amount: number
  unit: string
}

export interface UpdateGoldPriceInput {
  price_per_gram: number
  date: string
}

// Dashboard summary
export interface DashboardSummary {
  balance_mas: number
  balance_fita: number
  total_cash: number
  monthly_income: number
  monthly_expense: number
  recent_transactions: TransactionWithCategory[]
}

export interface TransactionFilters {
  person_id?: PersonId | 'all'
  category_id?: string | 'all'
  type?: TransactionType | 'all'
  month?: number
  year?: number
}
