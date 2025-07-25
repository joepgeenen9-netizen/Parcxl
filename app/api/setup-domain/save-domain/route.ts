import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { tenantId, domain, nameserverVerified, vercelDomainVerified } = body

    if (!tenantId || !domain) {
      return NextResponse.json({ error: "Tenant ID and domain are required" }, { status: 400 })
    }

    const supabase = createServerClient()

    // Check if domain already exists for another tenant
    const { data: existingDomain } = await supabase
      .from("tenant_domains")
      .select("tenant_id")
      .eq("domain", domain)
      .single()

    if (existingDomain && existingDomain.tenant_id !== tenantId) {
      return NextResponse.json({ error: "Domain is already used by another tenant" }, { status: 409 })
    }

    // Upsert domain data
    const { data, error } = await supabase
      .from("tenant_domains")
      .upsert(
        {
          tenant_id: tenantId,
          domain,
          www_enabled: true,
          nameserver_verified: nameserverVerified || false,
          vercel_project_id: process.env.VERCEL_PROJECT_ID,
          vercel_team_id: process.env.VERCEL_TEAM_ID,
          vercel_domain_verified: vercelDomainVerified || false,
          connected_at: nameserverVerified ? new Date().toISOString() : null,
        },
        {
          onConflict: "tenant_id,domain",
        },
      )
      .select()
      .single()

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to save domain data" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      domain_data: data,
    })
  } catch (error) {
    console.error("Error saving domain:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
