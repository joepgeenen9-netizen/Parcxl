"use server"

import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function testWooCommerceConnection(data: {
  domain: string
  consumerKey: string
  consumerSecret: string
}): Promise<{ success: boolean; error?: string }> {
  try {
    // Clean up domain - remove protocol and trailing slash
    const cleanDomain = data.domain.replace(/^https?:\/\//, "").replace(/\/$/, "")

    // Add https:// if not present
    const testUrl = `https://${cleanDomain}/wp-json/wc/v3/products?per_page=1&consumer_key=${data.consumerKey}&consumer_secret=${data.consumerSecret}`

    const response = await fetch(testUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "User-Agent": "Packway-Integration/1.0",
      },
      // Add timeout
      signal: AbortSignal.timeout(10000), // 10 seconds timeout
    })

    if (!response.ok) {
      return {
        success: false,
        error: `HTTP ${response.status}: ${response.statusText}`,
      }
    }

    const responseText = await response.text()

    // Check if response starts with [{"id": which indicates success
    if (responseText.startsWith('[{"id":') && responseText.includes('"name"')) {
      return { success: true }
    } else {
      return {
        success: false,
        error: "Ongeldig antwoord van WooCommerce API. Controleer je instellingen.",
      }
    }
  } catch (error) {
    console.error("WooCommerce test error:", error)

    if (error instanceof Error) {
      if (error.name === "TimeoutError") {
        return { success: false, error: "Verbinding time-out. Controleer het domein." }
      }
      if (error.message.includes("ENOTFOUND") || error.message.includes("ECONNREFUSED")) {
        return { success: false, error: "Domein niet bereikbaar. Controleer het domein." }
      }
    }

    return {
      success: false,
      error: "Kan geen verbinding maken met WooCommerce. Controleer je instellingen.",
    }
  }
}

export async function addWooCommerceIntegration(data: {
  clientId: string
  tenantId: string
  domain: string
  consumerKey: string
  consumerSecret: string
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

    // Clean up domain
    const cleanDomain = data.domain.replace(/^https?:\/\//, "").replace(/\/$/, "")

    const { error } = await supabase.from("fc_client_integrations").insert({
      tenant_id: data.tenantId,
      client_id: data.clientId,
      platform: "woocommerce",
      domain: cleanDomain,
      api_key: data.consumerKey,
      api_secret: data.consumerSecret,
      active: true,
    })

    if (error) {
      console.error("Database error:", error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error("Error adding WooCommerce integration:", error)
    return { success: false, error: "Failed to add integration" }
  }
}
