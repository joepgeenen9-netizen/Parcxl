import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const userSession = request.cookies.get("user-session")
  const { pathname } = request.nextUrl

  // Public routes that don't require authentication
  const publicRoutes = ["/login"]
  const isPublicRoute = publicRoutes.includes(pathname)

  // If user is not logged in and trying to access protected route
  if (!userSession && !isPublicRoute && pathname !== "/") {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // If user is logged in and trying to access login page
  if (userSession && pathname === "/login") {
    try {
      const user = JSON.parse(userSession.value)
      const redirectTo = user.rol === "admin" ? "/admin" : "/dashboard"
      return NextResponse.redirect(new URL(redirectTo, request.url))
    } catch {
      // Invalid session, redirect to login
      const response = NextResponse.redirect(new URL("/login", request.url))
      response.cookies.delete("user-session")
      return response
    }
  }

  // Role-based route protection
  if (userSession) {
    try {
      const user = JSON.parse(userSession.value)

      // Admin trying to access customer dashboard
      if (user.rol === "admin" && pathname === "/dashboard") {
        return NextResponse.redirect(new URL("/admin", request.url))
      }

      // Customer trying to access admin dashboard
      if (user.rol === "klant" && pathname === "/admin") {
        return NextResponse.redirect(new URL("/dashboard", request.url))
      }
    } catch {
      // Invalid session, redirect to login
      const response = NextResponse.redirect(new URL("/login", request.url))
      response.cookies.delete("user-session")
      return response
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
}
