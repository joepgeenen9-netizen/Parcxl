"use server"

import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import type { Client } from "@/types/client"
import type { ClientStats, ClientDetailsData } from "@/types/client-details"

export async function getClientDetails(
  clientId: string,
  tenantId: string,
): Promise<{ data: ClientDetailsData | null; error?: string }> {
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

    // Get client details
    const { data: client, error: clientError } = await supabase
      .from("fc_clients")
      .select("*")
      .eq("id", clientId)
      .eq("tenant_id", tenantId)
      .single()

    if (clientError || !client) {
      return { data: null, error: "Client not found" }
    }

    // Get integrations
    const { data: integrations, error: integrationsError } = await supabase
      .from("fc_client_integrations")
      .select("*")
      .eq("client_id", clientId)
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false })

    if (integrationsError) {
      console.error("Error fetching integrations:", integrationsError)
    }

    // Get products
    const { data: products, error: productsError } = await supabase
      .from("fc_client_products")
      .select("*")
      .eq("client_id", clientId)
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false })

    if (productsError) {
      console.error("Error fetching products:", productsError)
    }

    // Get users
    const { data: users, error: usersError } = await supabase
      .from("fc_client_users")
      .select("*")
      .eq("client_id", clientId)
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false })

    if (usersError) {
      console.error("Error fetching users:", usersError)
    }

    // Calculate stats
    const stats: ClientStats = {
      totalProducts: products?.length || 0,
      totalUsers: users?.length || 0,
      totalIntegrations: integrations?.length || 0,
      activeIntegrations: integrations?.filter((i) => i.active).length || 0,
    }

    const clientDetailsData: ClientDetailsData = {
      client: client as Client,
      stats,
      integrations: integrations || [],
      products: products || [],
      users: users || [],
    }

    return { data: clientDetailsData }
  } catch (error) {
    console.error("Error in getClientDetails:", error)
    return { data: null, error: "Failed to fetch client details" }
  }
}

export async function addClientIntegration(data: {
  clientId: string
  tenantId: string
  platform: string
  domain?: string
  apiKey?: string
  apiSecret?: string
  accessToken?: string
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

    const { error } = await supabase.from("fc_client_integrations").insert({
      client_id: data.clientId,
      tenant_id: data.tenantId,
      platform: data.platform,
      domain: data.domain,
      api_key: data.apiKey,
      api_secret: data.apiSecret,
      access_token: data.accessToken,
      active: true,
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error("Error adding integration:", error)
    return { success: false, error: "Failed to add integration" }
  }
}

export async function deleteClientIntegration(
  integrationId: string,
  tenantId: string,
): Promise<{ success: boolean; error?: string }> {
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

    const { error } = await supabase
      .from("fc_client_integrations")
      .delete()
      .eq("id", integrationId)
      .eq("tenant_id", tenantId)

    if (error) {
      console.error("Error deleting integration:", error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error("Error in deleteClientIntegration:", error)
    return { success: false, error: "Failed to delete integration" }
  }
}

export async function addClientProduct(data: {
  clientId: string
  tenantId: string
  sku: string
  articleNumber?: string
  name: string
  description?: string
  imageUrl?: string
  weightGrams?: number
  dimensions?: { length?: number; width?: number; height?: number }
  barcode?: string
  stock?: number
  location?: string
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

    const { error } = await supabase.from("fc_client_products").insert({
      client_id: data.clientId,
      tenant_id: data.tenantId,
      sku: data.sku,
      article_number: data.articleNumber,
      name: data.name,
      description: data.description,
      image_url: data.imageUrl,
      weight_grams: data.weightGrams,
      dimensions_cm: data.dimensions,
      barcode: data.barcode,
      stock: data.stock || 0,
      location: data.location,
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error("Error adding product:", error)
    return { success: false, error: "Failed to add product" }
  }
}
