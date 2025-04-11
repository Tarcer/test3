export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          password_hash: string
          solana_usdt_address: string | null
          referral_code: string
          referred_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name: string
          password_hash: string
          solana_usdt_address?: string | null
          referral_code: string
          referred_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          password_hash?: string
          solana_usdt_address?: string | null
          referral_code?: string
          referred_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          name: string
          description: string | null
          price: number
          category: string
          image_url: string | null
          features: Json | null
          demo_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          price: number
          category: string
          image_url?: string | null
          features?: Json | null
          demo_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          price?: number
          category?: string
          image_url?: string | null
          features?: Json | null
          demo_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      purchases: {
        Row: {
          id: string
          user_id: string
          product_id: string
          amount: number
          status: string
          created_at: string
          transaction_id: string | null
        }
        Insert: {
          id?: string
          user_id: string
          product_id: string
          amount: number
          status?: string
          created_at?: string
          transaction_id?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          product_id?: string
          amount?: number
          status?: string
          created_at?: string
          transaction_id?: string | null
        }
      }
      earnings: {
        Row: {
          id: string
          user_id: string
          purchase_id: string
          amount: number
          day_number: number
          status: string
          created_at: string
          paid_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          purchase_id: string
          amount: number
          day_number: number
          status?: string
          created_at?: string
          paid_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          purchase_id?: string
          amount?: number
          day_number?: number
          status?: string
          created_at?: string
          paid_at?: string | null
        }
      }
      affiliate_commissions: {
        Row: {
          id: string
          user_id: string
          purchase_id: string
          amount: number
          level: number
          status: string
          created_at: string
          paid_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          purchase_id: string
          amount: number
          level: number
          status?: string
          created_at?: string
          paid_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          purchase_id?: string
          amount?: number
          level?: number
          status?: string
          created_at?: string
          paid_at?: string | null
        }
      }
      withdrawals: {
        Row: {
          id: string
          user_id: string
          amount: number
          fee: number
          net_amount: number
          wallet_address: string
          status: string
          created_at: string
          processed_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          fee: number
          net_amount: number
          wallet_address: string
          status?: string
          created_at?: string
          processed_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          fee?: number
          net_amount?: number
          wallet_address?: string
          status?: string
          created_at?: string
          processed_at?: string | null
        }
      }
      deposits: {
        Row: {
          id: string
          user_id: string
          amount: number
          transaction_hash: string | null
          status: string
          created_at: string
          confirmed_at: string | null
          charge_id: string | null
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          transaction_hash?: string | null
          status?: string
          created_at?: string
          confirmed_at?: string | null
          charge_id?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          transaction_hash?: string | null
          status?: string
          created_at?: string
          confirmed_at?: string | null
          charge_id?: string | null
        }
      }
      withdrawal_days: {
        Row: {
          id: string
          day_of_month: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          day_of_month: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          day_of_month?: number
          created_at?: string
          updated_at?: string
        }
      }
      system_settings: {
        Row: {
          id: string
          key: string
          value: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          key: string
          value: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          key?: string
          value?: Json
          created_at?: string
          updated_at?: string
        }
      }
      balance_transactions: {
        Row: {
          id: string
          user_id: string
          amount: number
          type: string
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          type: string
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          type?: string
          description?: string | null
          created_at?: string
        }
      }
      payment_references: {
        Row: {
          id: string
          user_id: string
          product_id: string
          amount: number
          charge_id: string | null
          status: string | null
          created_at: string | null
          completed_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          product_id: string
          amount: number
          charge_id?: string | null
          status?: string | null
          created_at?: string | null
          completed_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          product_id?: string
          amount?: number
          charge_id?: string | null
          status?: string | null
          created_at?: string | null
          completed_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
