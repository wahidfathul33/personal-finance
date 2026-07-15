import type { Category } from './types'
import {
  UtensilsCrossed, Car, ShoppingBag, Pill, Clapperboard, FileText,
  BookOpen, Home, Sparkles, Smartphone, HeartHandshake, Wallet,
  Briefcase, TrendingUp, Gift, Banknote, ArrowLeftRight, Pin,
  type LucideIcon,
} from 'lucide-react'

/* ─── Icon Map: string name → Lucide component ─── */
export const CATEGORY_ICON_MAP: Record<string, LucideIcon> = {
  UtensilsCrossed, Car, ShoppingBag, Pill, Clapperboard, FileText,
  BookOpen, Home, Sparkles, Smartphone, HeartHandshake, Wallet,
  Briefcase, TrendingUp, Gift, Banknote, ArrowLeftRight, Pin,
}

export const getCategoryIcon = (iconName?: string): LucideIcon =>
  iconName && CATEGORY_ICON_MAP[iconName] ? CATEGORY_ICON_MAP[iconName] : Pin

/* ─── Category Icon Colors ─── */
export const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  food:          { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-600 dark:text-orange-400' },
  transport:     { bg: 'bg-sky-100 dark:bg-sky-900/30',      text: 'text-sky-600 dark:text-sky-400' },
  shopping:      { bg: 'bg-pink-100 dark:bg-pink-900/30',     text: 'text-pink-600 dark:text-pink-400' },
  health:        { bg: 'bg-red-100 dark:bg-red-900/30',       text: 'text-red-600 dark:text-red-400' },
  entertainment: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-600 dark:text-purple-400' },
  bills:         { bg: 'bg-blue-100 dark:bg-blue-900/30',     text: 'text-blue-600 dark:text-blue-400' },
  education:     { bg: 'bg-indigo-100 dark:bg-indigo-900/30', text: 'text-indigo-600 dark:text-indigo-400' },
  household:     { bg: 'bg-teal-100 dark:bg-teal-900/30',     text: 'text-teal-600 dark:text-teal-400' },
  personal_care: { bg: 'bg-rose-100 dark:bg-rose-900/30',     text: 'text-rose-600 dark:text-rose-400' },
  subscription:  { bg: 'bg-violet-100 dark:bg-violet-900/30', text: 'text-violet-600 dark:text-violet-400' },
  charity:       { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-600 dark:text-emerald-400' },
  salary:        { bg: 'bg-green-100 dark:bg-green-900/30',   text: 'text-green-600 dark:text-green-400' },
  freelance:     { bg: 'bg-cyan-100 dark:bg-cyan-900/30',     text: 'text-cyan-600 dark:text-cyan-400' },
  investment:    { bg: 'bg-lime-100 dark:bg-lime-900/30',     text: 'text-lime-600 dark:text-lime-400' },
  bonus:         { bg: 'bg-amber-100 dark:bg-amber-900/30',   text: 'text-amber-600 dark:text-amber-400' },
  other_income:  { bg: 'bg-slate-100 dark:bg-slate-900/30',   text: 'text-slate-600 dark:text-slate-400' },
  transfer:      { bg: 'bg-violet-100 dark:bg-violet-900/30', text: 'text-violet-600 dark:text-violet-400' },
  other:         { bg: 'bg-gray-100 dark:bg-gray-900/30',     text: 'text-gray-600 dark:text-gray-400' },
}

export const getCategoryColors = (categoryId?: string): { bg: string; text: string } =>
  categoryId && CATEGORY_COLORS[categoryId] ? CATEGORY_COLORS[categoryId] : { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-600 dark:text-gray-400' }

export const CATEGORIES: Category[] = [
  // Expense
  { id: 'food',          name: 'Makanan',      type: 'expense', icon: 'UtensilsCrossed' },
  { id: 'transport',     name: 'Transport',    type: 'expense', icon: 'Car' },
  { id: 'shopping',      name: 'Belanja',      type: 'expense', icon: 'ShoppingBag' },
  { id: 'health',        name: 'Kesehatan',    type: 'expense', icon: 'Pill' },
  { id: 'entertainment', name: 'Hiburan',      type: 'expense', icon: 'Clapperboard' },
  { id: 'bills',         name: 'Tagihan',      type: 'expense', icon: 'FileText' },
  { id: 'education',     name: 'Pendidikan',   type: 'expense', icon: 'BookOpen' },
  { id: 'household',     name: 'Rumah Tangga', type: 'expense', icon: 'Home' },
  { id: 'personal_care', name: 'Perawatan',    type: 'expense', icon: 'Sparkles' },
  { id: 'subscription',  name: 'Langganan',    type: 'expense', icon: 'Smartphone' },
  { id: 'charity',       name: 'Donasi',       type: 'expense', icon: 'HeartHandshake' },
  // Income
  { id: 'salary',        name: 'Gaji',         type: 'income',  icon: 'Wallet' },
  { id: 'freelance',     name: 'Freelance',    type: 'income',  icon: 'Briefcase' },
  { id: 'investment',    name: 'Investasi',    type: 'income',  icon: 'TrendingUp' },
  { id: 'bonus',         name: 'Bonus',        type: 'income',  icon: 'Gift' },
  { id: 'other_income',  name: 'Lainnya',      type: 'income',  icon: 'Banknote' },
  // All / Transfer
  { id: 'transfer',      name: 'Transfer',     type: 'transfer', icon: 'ArrowLeftRight' },
  { id: 'other',         name: 'Lainnya',      type: 'all',     icon: 'Pin' },
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
