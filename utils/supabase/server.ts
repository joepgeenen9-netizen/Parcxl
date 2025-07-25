/** utils/supabase/server.ts
 * Shared server–side Supabase client creator.
 * Wraps `createServerClient` from `@supabase/ssr` and injects the
 * request–scoped cookie store so RSC-friendly calls Just Work™.
 */
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

/**
 * Returns a configured Supabase client for the current server request.
 */
export function createClient() {
  const cookieStore = cookies()

  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookiesToSet) => {
        // `set` is allowed in Route Handlers / Server Actions
        cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
      },
    },
  })
}
