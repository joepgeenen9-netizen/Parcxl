import { createClientComponentClient, createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

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
          country: string | null
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
          country?: string | null
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
          country?: string | null
          created_at?: string
          updated_at?: string
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
      user_type: "customer" | "admin"
    }
  }
}

// Client-side Supabase client
export const createClient = () => createClientComponentClient<Database>()

// Server-side Supabase client for Server Components
export const createServerClient = () => createServerComponentClient<Database>({ cookies })

// Route handler Supabase client
export const createRouteHandlerSupabaseClient = () => createRouteHandlerClient<Database>({ cookies })
