import { createServerComponentClient, createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import type { Database } from "./supabase"

// Server-side Supabase client for Server Components
export const createServerClient = () => createServerComponentClient<Database>({ cookies })

// Route handler Supabase client
export const createRouteHandlerSupabaseClient = () => createRouteHandlerClient<Database>({ cookies })
