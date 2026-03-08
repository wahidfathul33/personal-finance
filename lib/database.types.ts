export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      transactions: {
        Row: {
          id: string
          date: string
          person_id: string
          type: string
          category_id: string | null
          amount: number
          note: string | null
          group_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          date: string
          person_id: string
          type: string
          category_id?: string | null
          amount: number
          note?: string | null
          group_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          date?: string
          person_id?: string
          type?: string
          category_id?: string | null
          amount?: number
          note?: string | null
          group_id?: string | null
          created_at?: string
        }
      }
      recurring_templates: {
        Row: {
          id: string
          name: string
          type: string
          category_id: string | null
          person_id: string | null
          amount: number
          day_of_month: number
          split_type: string
          split_ratio_mas: number
          split_ratio_fita: number
          note: string | null
          active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          type: string
          category_id?: string | null
          person_id?: string | null
          amount: number
          day_of_month: number
          split_type?: string
          split_ratio_mas?: number
          split_ratio_fita?: number
          note?: string | null
          active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          type?: string
          category_id?: string | null
          person_id?: string | null
          amount?: number
          day_of_month?: number
          split_type?: string
          split_ratio_mas?: number
          split_ratio_fita?: number
          note?: string | null
          active?: boolean
          created_at?: string
        }
      }
      balances: {
        Row: {
          id: string
          person_id: string
          month: number
          year: number
          amount: number
        }
        Insert: {
          id?: string
          person_id: string
          month: number
          year: number
          amount: number
        }
        Update: {
          id?: string
          person_id?: string
          month?: number
          year?: number
          amount?: number
        }
      }
      savings: {
        Row: {
          id: string
          person_id: string
          amount: number
          date: string
          note: string | null
          created_at: string
        }
        Insert: {
          id?: string
          person_id: string
          amount: number
          date: string
          note?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          person_id?: string
          amount?: number
          date?: string
          note?: string | null
          created_at?: string
        }
      }
      assets: {
        Row: {
          id: string
          name: string
          type: string
          amount: number
          unit: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          type: string
          amount: number
          unit: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          type?: string
          amount?: number
          unit?: string
          created_at?: string
        }
      }
      gold_prices: {
        Row: {
          id: string
          price_per_gram: number
          date: string
          created_at: string
        }
        Insert: {
          id?: string
          price_per_gram: number
          date: string
          created_at?: string
        }
        Update: {
          id?: string
          price_per_gram?: number
          date?: string
          created_at?: string
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
