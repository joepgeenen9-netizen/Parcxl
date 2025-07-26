import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Allow access to auth pages and public assets
  if (
    req.nextUrl.pathname.startsWith("/login") ||
    req.nextUrl.pathname.startsWith("/signup") ||
    req.nextUrl.pathname.startsWith("/_next") ||
    req.nextUrl.pathname.startsWith("/api") ||
    req.nextUrl.pathname.startsWith("/public")
  ) {
    return res
  }

  // Redirect to login if no session
  if (!session) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  // Check user role for protected routes
  if (req.nextUrl.pathname.startsWith("/admin") || req.nextUrl.pathname.startsWith("/customer")) {
    try {
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
    } catch (error) {
      console.error("Middleware error:", error)
      return NextResponse.redirect(new URL("/login", req.url))
    }
  }

  return res
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
