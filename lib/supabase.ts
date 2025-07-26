import { createClientComponentClient, createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import type { Database } from "@/types/database"

// Client-side Supabase client
export const createClient = () => createClientComponentClient<Database>()

// Server-side Supabase client for Server Components
export const createServerClient = () => createServerComponentClient<Database>({ cookies })

// Route handler Supabase client
export const createRouteHandlerSupabaseClient = () => createRouteHandlerClient<Database>({ cookies })
