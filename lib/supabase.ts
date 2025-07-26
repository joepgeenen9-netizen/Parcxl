import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

// Client-side Supabase client
export const createClient = () => createClientComponentClient()

// Server-side Supabase client for Server Components
export const createServerClient = () => createServerComponentClient({ cookies })

// Route handler Supabase client
export const createRouteHandlerSupabaseClient = () => createRouteHandlerClient({ cookies })
