import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"
import bcrypt from "bcryptjs"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { tenantId, logoUrl, user } = body

    if (!tenantId) {
      return NextResponse.json({ error: "Tenant ID is required" }, { status: 400 })
    }

    if (!user || !user.username || !user.email || !user.password) {
      return NextResponse.json({ error: "User information is required" }, { status: 400 })
    }

    const supabase = createServerClient()

    // Hash the password
    const passwordHash = await bcrypt.hash(user.password, 12)

    // Start a transaction-like approach
    const results = {
      tenant_updated: false,
      user_created: false,
      error: null as string | null,
    }

    try {
      // Update tenant with logo if provided
      if (logoUrl) {
        const { error: tenantError } = await supabase.from("tenants").update({ logo_url: logoUrl }).eq("id", tenantId)

        if (tenantError) {
          throw new Error(`Failed to update tenant logo: ${tenantError.message}`)
        }
        results.tenant_updated = true
      }

      // Create tenant user
      const { data: newUser, error: userError } = await supabase
        .from("tenant_users")
        .insert({
          tenant_id: tenantId,
          username: user.username,
          email: user.email,
          password_hash: passwordHash,
          is_admin: true,
        })
        .select()
        .single()

      if (userError) {
        console.error("Supabase user insert error:", userError)
        throw new Error(`Failed to create tenant user: ${userError.message || userError.details || "unknown"}`)
      }
      results.user_created = true

      return NextResponse.json({
        success: true,
        message: "Tenant configuratie voltooid",
        results,
      })
    } catch (error) {
      results.error = error instanceof Error ? error.message : "Unknown error"
      throw error
    }
  } catch (error) {
    console.error("Error completing tenant:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
        success: false,
      },
      { status: 500 },
    )
  }
}
