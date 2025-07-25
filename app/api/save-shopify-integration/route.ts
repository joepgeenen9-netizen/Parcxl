import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const { clientId, domain, accessToken, shopInfo } = await request.json()

    if (!clientId || !domain || !accessToken) {
      return NextResponse.json({ success: false, error: "Ontbrekende verplichte velden" }, { status: 400 })
    }

    const cookieStore = await cookies()

    // Get tenant context from cookie
    const tenantContextCookie = cookieStore.get("tenant-context")
    if (!tenantContextCookie?.value) {
      return NextResponse.json({ success: false, error: "Geen tenant context gevonden" }, { status: 401 })
    }

    let tenant
    try {
      tenant = JSON.parse(tenantContextCookie.value)
    } catch (error) {
      return NextResponse.json({ success: false, error: "Ongeldige tenant context" }, { status: 401 })
    }

    // Create Supabase client
    const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          } catch {
            // The `setAll` method was called from a Server Component.
          }
        },
      },
    })

    // Clean up domain
    let cleanDomain = domain.replace(/^https?:\/\//, "").replace(/\/+$/, "")
    if (!cleanDomain.includes(".myshopify.com")) {
      cleanDomain = cleanDomain + ".myshopify.com"
    }

    // Check if integration already exists for this client and platform
    const { data: existingIntegration, error: fetchError } = await supabase
      .from("fc_client_integrations")
      .select("*")
      .eq("client_id", clientId)
      .eq("platform", "shopify")
      .single()

    if (fetchError && fetchError.code !== "PGRST116") {
      console.error("Error fetching existing integration:", fetchError)
      return NextResponse.json({ success: false, error: "Fout bij controleren bestaande integratie" }, { status: 500 })
    }

    const integrationData = {
      tenant_id: tenant.id,
      client_id: clientId,
      platform: "shopify",
      domain: cleanDomain,
      api_key: accessToken,
      active: true,
      config: shopInfo ? JSON.stringify(shopInfo) : null,
      updated_at: new Date().toISOString(),
    }

    if (existingIntegration) {
      // Update existing integration
      const { error: updateError } = await supabase
        .from("fc_client_integrations")
        .update(integrationData)
        .eq("id", existingIntegration.id)

      if (updateError) {
        console.error("Error updating Shopify integration:", updateError)
        return NextResponse.json(
          {
            success: false,
            error: `Fout bij bijwerken van integratie: ${updateError.message}`,
          },
          { status: 500 },
        )
      }

      return NextResponse.json({
        success: true,
        message: "Shopify integratie succesvol bijgewerkt",
        integrationId: existingIntegration.id,
      })
    } else {
      // Create new integration
      const { data: newIntegration, error: insertError } = await supabase
        .from("fc_client_integrations")
        .insert({
          ...integrationData,
          created_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (insertError) {
        console.error("Error creating Shopify integration:", insertError)
        return NextResponse.json(
          {
            success: false,
            error: `Fout bij aanmaken van integratie: ${insertError.message}`,
          },
          { status: 500 },
        )
      }

      return NextResponse.json({
        success: true,
        message: "Shopify integratie succesvol aangemaakt",
        integrationId: newIntegration.id,
      })
    }
  } catch (error: any) {
    console.error("Save Shopify integration error:", error)
    return NextResponse.json(
      {
        success: false,
        error: `Onverwachte fout bij opslaan: ${error.message}`,
      },
      { status: 500 },
    )
  }
}
