import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

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

// Client-side Supabase client (for use in client components)
export const createClient = () => {
  // Check if we're in a preview environment or missing env vars
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    // Return a mock client for preview environments
    return {
      auth: {
        getUser: () => Promise.resolve({ data: { user: null }, error: null }),
        signInWithPassword: () =>
          Promise.resolve({ data: { user: null, session: null }, error: { message: "Preview mode" } }),
        signUp: () => Promise.resolve({ data: { user: null, session: null }, error: { message: "Preview mode" } }),
        signOut: () => Promise.resolve({ error: null }),
        refreshSession: () => Promise.resolve({ data: { session: null }, error: null }),
      },
      from: () => ({
        select: () => ({
          eq: () => ({
            single: () => Promise.resolve({ data: null, error: { message: "Preview mode" } }),
            maybeSingle: () => Promise.resolve({ data: null, error: { message: "Preview mode" } }),
          }),
        }),
      }),
    } as any
  }

  return createClientComponentClient<Database>()
}
