import { createServerClient } from "@supabase/ssr"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import type { Database } from "@/types/database"

export async function middleware(req: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: req.headers,
    },
  })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value))
          response = NextResponse.next({
            request: {
              headers: req.headers,
            },
          })
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
        },
      },
    },
  )

  // Allow access to auth pages and public assets
  if (
    req.nextUrl.pathname.startsWith("/login") ||
    req.nextUrl.pathname.startsWith("/signup") ||
    req.nextUrl.pathname.startsWith("/_next") ||
    req.nextUrl.pathname.startsWith("/api") ||
    req.nextUrl.pathname.startsWith("/public") ||
    req.nextUrl.pathname === "/"
  ) {
    return response
  }

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    // Redirect to login if no session
    if (!session) {
      return NextResponse.redirect(new URL("/login", req.url))
    }

    // Check user role for protected routes
    if (req.nextUrl.pathname.startsWith("/admin") || req.nextUrl.pathname.startsWith("/customer")) {
      const { data: profile } = await supabase.from("profiles").select("user_type").eq("id", session.user.id).single()

      if (!profile) {
        return NextResponse.redirect(new URL("/login", req.url))
      }

      // Redirect admin users away from customer routes
      if (req.nextUrl.pathname.startsWith("/customer") && profile.user_type === "admin") {
        return NextResponse.redirect(new URL("/admin", req.url))
      }

      // Redirect customer users away from admin routes
      if (req.nextUrl.pathname.startsWith("/admin") && profile.user_type === "customer") {
        return NextResponse.redirect(new URL("/customer", req.url))
      }
    }
  } catch (error) {
    console.error("Middleware error:", error)
    return NextResponse.redirect(new URL("/login", req.url))
  }

  return response
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
