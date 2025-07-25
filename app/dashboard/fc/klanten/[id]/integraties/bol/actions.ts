"use server"

import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

interface BolTokenResponse {
  access_token: string
  scope: string
  token_type: string
  expires_in: number
}

export async function testBolConnection(data: {
  clientId: string
  clientSecret: string
}): Promise<{ success: boolean; error?: string; accessToken?: string }> {
  try {
    // Test bol.com API connection
    const response = await fetch("https://login.bol.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: data.clientId,
        client_secret: data.clientSecret,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("bol.com API error:", response.status, errorText)

      if (response.status === 401) {
        return { success: false, error: "Ongeldige API gegevens. Controleer je Client ID en Client Secret." }
      } else if (response.status === 400) {
        return { success: false, error: "Onjuiste API aanvraag. Controleer je gegevens." }
      } else {
        return { success: false, error: `API fout: ${response.status}. Probeer het later opnieuw.` }
      }
    }

    const tokenData: BolTokenResponse = await response.json()

    // Validate response format
    if (!tokenData.access_token || tokenData.token_type !== "Bearer") {
      return { success: false, error: "Onverwacht API antwoord van bol.com." }
    }

    return {
      success: true,
      accessToken: tokenData.access_token,
    }
  } catch (error) {
    console.error("Error testing bol.com connection:", error)
    return {
      success: false,
      error: "Netwerkfout. Controleer je internetverbinding en probeer opnieuw.",
    }
  }
}

export async function saveBolIntegration(data: {
  clientId: string
  tenantId: string
  apiKey: string
  apiSecret: string
  accessToken: string
}): Promise<{ success: boolean; error?: string }> {
  try {
    const cookieStore = await cookies()
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

    // Check if integration already exists
    const { data: existingIntegration } = await supabase
      .from("fc_client_integrations")
      .select("id")
      .eq("client_id", data.clientId)
      .eq("tenant_id", data.tenantId)
      .eq("platform", "bol.com")
      .single()

    if (existingIntegration) {
      // Update existing integration
      const { error } = await supabase
        .from("fc_client_integrations")
        .update({
          api_key: data.apiKey,
          api_secret: data.apiSecret,
          access_token: data.accessToken,
          active: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingIntegration.id)

      if (error) {
        console.error("Error updating bol.com integration:", error)
        return { success: false, error: "Fout bij het bijwerken van de integratie." }
      }
    } else {
      // Create new integration
      const { error } = await supabase.from("fc_client_integrations").insert({
        client_id: data.clientId,
        tenant_id: data.tenantId,
        platform: "bol.com",
        api_key: data.apiKey,
        api_secret: data.apiSecret,
        access_token: data.accessToken,
        active: true,
      })

      if (error) {
        console.error("Error creating bol.com integration:", error)
        return { success: false, error: "Fout bij het opslaan van de integratie." }
      }
    }

    return { success: true }
  } catch (error) {
    console.error("Error saving bol.com integration:", error)
    return { success: false, error: "Onverwachte fout bij het opslaan." }
  }
}
