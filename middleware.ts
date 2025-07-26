import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const userSession = request.cookies.get("user-session")
  const { pathname } = request.nextUrl

  // Public routes that don't require authentication
  const publicRoutes = ["/login", "/"]

  if (publicRoutes.includes(pathname)) {
    // If user is logged in and tries to access login, redirect to appropriate dashboard
    if (userSession && pathname === "/login") {
      try {
        const user = JSON.parse(userSession.value)
        if (user.rol === "admin") {
          return NextResponse.redirect(new URL("/admin", request.url))
        } else {
          return NextResponse.redirect(new URL("/dashboard", request.url))
        }
      } catch {
        // Invalid session, continue to login
      }
    }
    return NextResponse.next()
  }

  // Protected routes
  if (!userSession) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  try {
    const user = JSON.parse(userSession.value)

    // Admin routes
    if (pathname.startsWith("/admin")) {
      if (user.rol !== "admin") {
        return NextResponse.redirect(new URL("/dashboard", request.url))
      }
    }

    // Customer routes
    if (pathname.startsWith("/dashboard")) {
      if (user.rol !== "klant") {
        return NextResponse.redirect(new URL("/admin", request.url))
      }
    }

    return NextResponse.next()
  } catch {
    // Invalid session
    return NextResponse.redirect(new URL("/login", request.url))
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
