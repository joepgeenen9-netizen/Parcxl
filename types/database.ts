export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          user_type: "customer" | "admin"
          first_name: string | null
          last_name: string | null
          address: string | null
          phone: string | null
          city: string | null
          postal_code: string | null
          country: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          user_type?: "customer" | "admin"
          first_name?: string | null
          last_name?: string | null
          address?: string | null
          phone?: string | null
          city?: string | null
          postal_code?: string | null
          country?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_type?: "customer" | "admin"
          first_name?: string | null
          last_name?: string | null
          address?: string | null
          phone?: string | null
          city?: string | null
          postal_code?: string | null
          country?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_type: "customer" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
