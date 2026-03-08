import type { Person, Category } from './types'

export const PEOPLE: Person[] = [
  { id: 'mas', name: 'Mas' },
  { id: 'fita', name: 'Fita' },
]

export const CATEGORIES: Category[] = [
  // Expense
  { id: 'food', name: 'Makanan', type: 'expense', icon: '🍽️' },
  { id: 'transport', name: 'Transport', type: 'expense', icon: '🚗' },
  { id: 'shopping', name: 'Belanja', type: 'expense', icon: '🛍️' },
  { id: 'health', name: 'Kesehatan', type: 'expense', icon: '💊' },
  { id: 'entertainment', name: 'Hiburan', type: 'expense', icon: '🎬' },
  { id: 'bills', name: 'Tagihan', type: 'expense', icon: '📄' },
  { id: 'education', name: 'Pendidikan', type: 'expense', icon: '📚' },
  { id: 'household', name: 'Rumah Tangga', type: 'expense', icon: '🏠' },
  { id: 'personal_care', name: 'Perawatan', type: 'expense', icon: '💆' },
  { id: 'subscription', name: 'Langganan', type: 'expense', icon: '📱' },
  { id: 'charity', name: 'Donasi', type: 'expense', icon: '🤲' },
  // Income
  { id: 'salary', name: 'Gaji', type: 'income', icon: '💰' },
  { id: 'freelance', name: 'Freelance', type: 'income', icon: '💼' },
  { id: 'investment', name: 'Investasi', type: 'income', icon: '📈' },
  { id: 'bonus', name: 'Bonus', type: 'income', icon: '🎁' },
  { id: 'other_income', name: 'Lainnya', type: 'income', icon: '💵' },
  // All / Transfer
  { id: 'transfer', name: 'Transfer', type: 'transfer', icon: '↔️' },
  { id: 'other', name: 'Lainnya', type: 'all', icon: '📌' },
]

export const EXPENSE_CATEGORIES = CATEGORIES.filter(
  (c) => c.type === 'expense' || c.type === 'all'
)
export const INCOME_CATEGORIES = CATEGORIES.filter(
  (c) => c.type === 'income' || c.type === 'all'
)

export const getCategoryById = (id: string): Category | undefined =>
  CATEGORIES.find((c) => c.id === id)

export const MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
]

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function todayISO(): string {
  return new Date().toISOString().split('T')[0]
}

export function currentMonth(): number {
  return new Date().getMonth() + 1
}

export function currentYear(): number {
  return new Date().getFullYear()
}
