import type { Category } from './types'

export const CATEGORIES: Category[] = [
  // Expense
  { id: 'food',          name: 'Makanan',      type: 'expense', icon: '🍽️' },
  { id: 'transport',     name: 'Transport',    type: 'expense', icon: '🚗' },
  { id: 'shopping',      name: 'Belanja',      type: 'expense', icon: '🛍️' },
  { id: 'health',        name: 'Kesehatan',    type: 'expense', icon: '💊' },
  { id: 'entertainment', name: 'Hiburan',      type: 'expense', icon: '🎬' },
  { id: 'bills',         name: 'Tagihan',      type: 'expense', icon: '📄' },
  { id: 'education',     name: 'Pendidikan',   type: 'expense', icon: '📚' },
  { id: 'household',     name: 'Rumah Tangga', type: 'expense', icon: '🏠' },
  { id: 'personal_care', name: 'Perawatan',    type: 'expense', icon: '💆' },
  { id: 'subscription',  name: 'Langganan',    type: 'expense', icon: '📱' },
  { id: 'charity',       name: 'Donasi',       type: 'expense', icon: '🤲' },
  // Income
  { id: 'salary',        name: 'Gaji',         type: 'income',  icon: '💰' },
  { id: 'freelance',     name: 'Freelance',    type: 'income',  icon: '💼' },
  { id: 'investment',    name: 'Investasi',    type: 'income',  icon: '📈' },
  { id: 'bonus',         name: 'Bonus',        type: 'income',  icon: '🎁' },
  { id: 'other_income',  name: 'Lainnya',      type: 'income',  icon: '💵' },
  // All / Transfer
  { id: 'transfer',      name: 'Transfer',     type: 'transfer', icon: '↔️' },
  { id: 'other',         name: 'Lainnya',      type: 'all',     icon: '📌' },
]

export const EXPENSE_CATEGORIES = CATEGORIES.filter(
  (c) => c.type === 'expense' || c.type === 'all'
)
export const INCOME_CATEGORIES = CATEGORIES.filter(
  (c) => c.type === 'income' || c.type === 'all'
)

export const getCategoryById = (id: string): Category | undefined =>
  CATEGORIES.find((c) => c.id === id)

// Color palettes — key matches Person.color stored in DB
export const PERSON_COLORS: Record<string, {
  badge: string
  button: string
  card: { bg: string; label: string; value: string }
  balance: string
}> = {
  indigo: {
    badge:   'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
    button:  'bg-indigo-600 text-white border-indigo-600',
    card:    { bg: 'bg-indigo-50 dark:bg-indigo-900/20', label: 'text-indigo-500 dark:text-indigo-400', value: 'text-indigo-700 dark:text-indigo-300' },
    balance: 'text-indigo-100',
  },
  pink: {
    badge:   'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300',
    button:  'bg-pink-500 text-white border-pink-500',
    card:    { bg: 'bg-pink-50 dark:bg-pink-900/20', label: 'text-pink-500 dark:text-pink-400', value: 'text-pink-700 dark:text-pink-300' },
    balance: 'text-pink-100',
  },
  emerald: {
    badge:   'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    button:  'bg-emerald-600 text-white border-emerald-600',
    card:    { bg: 'bg-emerald-50 dark:bg-emerald-900/20', label: 'text-emerald-500 dark:text-emerald-400', value: 'text-emerald-700 dark:text-emerald-300' },
    balance: 'text-emerald-100',
  },
  blue: {
    badge:   'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    button:  'bg-blue-600 text-white border-blue-600',
    card:    { bg: 'bg-blue-50 dark:bg-blue-900/20', label: 'text-blue-500 dark:text-blue-400', value: 'text-blue-700 dark:text-blue-300' },
    balance: 'text-blue-100',
  },
  violet: {
    badge:   'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
    button:  'bg-violet-600 text-white border-violet-600',
    card:    { bg: 'bg-violet-50 dark:bg-violet-900/20', label: 'text-violet-500 dark:text-violet-400', value: 'text-violet-700 dark:text-violet-300' },
    balance: 'text-violet-100',
  },
  amber: {
    badge:   'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    button:  'bg-amber-500 text-white border-amber-500',
    card:    { bg: 'bg-amber-50 dark:bg-amber-900/20', label: 'text-amber-500 dark:text-amber-400', value: 'text-amber-700 dark:text-amber-300' },
    balance: 'text-amber-100',
  },
  rose: {
    badge:   'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
    button:  'bg-rose-500 text-white border-rose-500',
    card:    { bg: 'bg-rose-50 dark:bg-rose-900/20', label: 'text-rose-500 dark:text-rose-400', value: 'text-rose-700 dark:text-rose-300' },
    balance: 'text-rose-100',
  },
  teal: {
    badge:   'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300',
    button:  'bg-teal-600 text-white border-teal-600',
    card:    { bg: 'bg-teal-50 dark:bg-teal-900/20', label: 'text-teal-500 dark:text-teal-400', value: 'text-teal-700 dark:text-teal-300' },
    balance: 'text-teal-100',
  },
}

// All available color options for the settings page picker
export const COLOR_OPTIONS = Object.keys(PERSON_COLORS)

// Hex values for charts (matches Person.color keys)
export const COLOR_HEX: Record<string, string> = {
  indigo:  '#6366f1',
  pink:    '#ec4899',
  emerald: '#10b981',
  blue:    '#3b82f6',
  violet:  '#8b5cf6',
  amber:   '#f59e0b',
  rose:    '#f43f5e',
  teal:    '#14b8a6',
}

export const COLOR_LABELS: Record<string, string> = {
  indigo: 'Indigo',
  pink: 'Merah Muda',
  emerald: 'Hijau',
  blue: 'Biru',
  violet: 'Ungu',
  amber: 'Kuning',
  rose: 'Merah',
  teal: 'Teal',
}

export const MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
]

export const MONTHS_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des',
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

export const YEAR_OPTIONS = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i)
