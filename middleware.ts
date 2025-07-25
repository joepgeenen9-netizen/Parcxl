import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip middleware for Next.js internals and static files
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes("/favicon.ico") ||
    pathname.includes("/robots.txt") ||
    pathname.startsWith("/no-tenant")
  ) {
    return NextResponse.next()
  }

  const host = request.headers.get("host")
  if (!host) return NextResponse.next()

  // Strip www. from domain
  const domain = host.replace(/^www\./, "")

  // Superadmin domains
  const superadminDomains = ["wms.packway.nl", "v0-packway-un.vercel.app", "localhost:3000"]

  // Check if this is a superadmin domain
  if (superadminDomains.includes(domain)) {
    // This is a superadmin domain - no tenant context needed
    const response = NextResponse.next()
    response.cookies.set("tenant-context", "", { maxAge: 0 }) // Clear any existing tenant context
    return response
  }

  // Check if this domain belongs to a tenant
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { data: tenantDomain } = await supabase
      .from("tenant_domains")
      .select(`
        tenant_id,
        tenants (
          id,
          name,
          type,
          logo_url,
          status
        )
      `)
      .eq("domain", domain)
      .single()

    if (tenantDomain && tenantDomain.tenants) {
      // This is a tenant domain - set tenant context
      const tenantInfo = {
        id: tenantDomain.tenants.id,
        name: tenantDomain.tenants.name,
        type: tenantDomain.tenants.type,
        logo_url: tenantDomain.tenants.logo_url,
        status: tenantDomain.tenants.status,
        domain: domain,
      }

      const response = NextResponse.next()
      response.cookies.set("tenant-context", JSON.stringify(tenantInfo), {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24, // 24 hours
      })

      return response
    }
  } catch (error) {
    console.error("Middleware error:", error)
  }

  // Unknown domain - treat as superadmin domain
  const response = NextResponse.next()
  response.cookies.set("tenant-context", "", { maxAge: 0 })
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}
