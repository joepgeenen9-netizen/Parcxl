"use server"

import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

interface BolIntegration {
  id: string
  client_id: string
  tenant_id: string
  platform: string
  domain?: string
  shop_url?: string
  shop_name?: string
  api_key?: string
  api_secret?: string
  status?: string
  active?: boolean
  created_at: string
  updated_at?: string
}

interface BolProduct {
  id: string
  name: string
  sku: string
  price: number
  stock: number
  status: "new" | "existing" | "koppelen"
  image: string
  weight?: number
  dimensions?: {
    length: number
    width: number
    height: number
  }
  platform_product_id: string
  description?: string
  type: "simple" | "variable"
  parent_id?: number
  variation_id?: number
  attributes?: string
}

export async function getAllBolIntegrations(
  clientId: string,
  tenantId: string,
): Promise<{ data: BolIntegration[] | null; error?: string }> {
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

    const { data, error } = await supabase
      .from("fc_client_integrations")
      .select("*")
      .eq("client_id", clientId)
      .eq("tenant_id", tenantId)
      .eq("platform", "bol.com")
      .order("created_at", { ascending: true })

    if (error) {
      return { data: null, error: error.message }
    }

    return { data: data as BolIntegration[] }
  } catch (error) {
    console.error("Error fetching bol.com integrations:", error)
    return { data: null, error: "Failed to fetch bol.com integrations" }
  }
}

export async function fetchBolProducts(
  clientId: string,
  tenantId: string,
  integrationId: string,
): Promise<{ data: BolProduct[] | null; error?: string }> {
  try {
    const response = await fetch("/api/fc/bol-import", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        clientId,
        tenantId,
      }),
    })

    const result = await response.json()

    if (!response.ok) {
      return { data: null, error: result.error || "Failed to fetch bol.com products" }
    }

    if (!result.success) {
      return { data: null, error: result.error || "Import was not successful" }
    }

    // Transform API response to match our BolProduct interface
    const transformedProducts: BolProduct[] = result.products.map((product: any) => ({
      id: product.offerId,
      name: product.name,
      sku: product.sku,
      price: product.price,
      stock: 0, // Default stock
      status: "new" as const, // All imported products are new
      image: product.imageUrl || "/placeholder.svg?height=60&width=60",
      weight: product.weight ? Number.parseFloat(product.weight) : undefined,
      platform_product_id: product.ean,
      type: "simple" as const, // Default to simple
    }))

    return { data: transformedProducts }
  } catch (error) {
    console.error("Error fetching bol.com products:", error)
    return { data: null, error: "Failed to fetch bol.com products" }
  }
}

export async function syncBolProducts(
  clientId: string,
  tenantId: string,
  integrationId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    // Placeholder for future implementation
    return { success: true }
  } catch (error) {
    console.error("Error syncing bol.com products:", error)
    return { success: false, error: "Failed to sync bol.com products" }
  }
}

export async function importSelectedProducts(
  clientId: string,
  tenantId: string,
  productIds: string[],
): Promise<{ success: boolean; error?: string; imported: number; linked: number }> {
  try {
    // Placeholder for future implementation
    return { success: true, imported: 0, linked: 0 }
  } catch (error) {
    console.error("Error importing bol.com products:", error)
    return { success: false, error: "Failed to import products", imported: 0, linked: 0 }
  }
}
