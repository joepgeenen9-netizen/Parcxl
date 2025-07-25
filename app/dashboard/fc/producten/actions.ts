"use server"

import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export interface ProductWithClient {
  id: string
  tenant_id: string
  client_id: string
  sku: string
  article_number?: string | null
  name: string
  description?: string | null
  image_url?: string | null
  weight_grams?: number | null
  dimensions_cm?: any | null
  barcode?: string | null
  stock: number
  location?: string | null
  platform?: string | null
  platform_product_id?: string | null
  platform_2?: string | null
  product_id_2?: string | null
  platform_3?: string | null
  product_id_3?: string | null
  platform_4?: string | null
  product_id_4?: string | null
  platform_5?: string | null
  product_id_5?: string | null
  platform_6?: string | null
  product_id_6?: string | null
  created_at: string
  updated_at?: string | null
  // Client information
  client_company_name: string
  client_logo_url?: string | null
  client_status: string
  client_address_city?: string | null
  client_address_country?: string | null
}

export interface ProductStats {
  totalProducts: number
  lowStockProducts: number
  newProductsLast30Days: number
  totalClients: number
}

export async function getProductsWithClients(
  tenantId: string,
): Promise<{ data: ProductWithClient[] | null; error?: string }> {
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

    // Fetch products with client information
    const { data: products, error } = await supabase
      .from("fc_client_products")
      .select(`
        *,
        fc_clients!inner (
          company_name,
          logo_url,
          status,
          address_city,
          address_country
        )
      `)
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching products:", error)
      return { data: null, error: error.message }
    }

    // Transform the data to flatten client information
    const transformedProducts: ProductWithClient[] =
      products?.map((product: any) => ({
        ...product,
        client_company_name: product.fc_clients.company_name,
        client_logo_url: product.fc_clients.logo_url,
        client_status: product.fc_clients.status,
        client_address_city: product.fc_clients.address_city,
        client_address_country: product.fc_clients.address_country,
      })) || []

    return { data: transformedProducts }
  } catch (error) {
    console.error("Error in getProductsWithClients:", error)
    return { data: null, error: "Failed to fetch products" }
  }
}

export async function getProductStats(tenantId: string): Promise<{ data: ProductStats | null; error?: string }> {
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

    // Get total products
    const { count: totalProducts } = await supabase
      .from("fc_client_products")
      .select("*", { count: "exact", head: true })
      .eq("tenant_id", tenantId)

    // Get low stock products (stock <= 10)
    const { count: lowStockProducts } = await supabase
      .from("fc_client_products")
      .select("*", { count: "exact", head: true })
      .eq("tenant_id", tenantId)
      .lte("stock", 10)

    // Get new products in last 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { count: newProductsLast30Days } = await supabase
      .from("fc_client_products")
      .select("*", { count: "exact", head: true })
      .eq("tenant_id", tenantId)
      .gte("created_at", thirtyDaysAgo.toISOString())

    // Get total unique clients with products
    const { data: clientsData } = await supabase
      .from("fc_client_products")
      .select("client_id")
      .eq("tenant_id", tenantId)

    const uniqueClients = new Set(clientsData?.map((p) => p.client_id) || [])

    const stats: ProductStats = {
      totalProducts: totalProducts || 0,
      lowStockProducts: lowStockProducts || 0,
      newProductsLast30Days: newProductsLast30Days || 0,
      totalClients: uniqueClients.size,
    }

    return { data: stats }
  } catch (error) {
    console.error("Error in getProductStats:", error)
    return { data: null, error: "Failed to fetch product statistics" }
  }
}

export async function deleteProducts(
  tenantId: string,
  productIds: string[],
): Promise<{ success: boolean; error?: string; deletedCount?: number }> {
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

    // Delete products from the database
    const { error, count } = await supabase
      .from("fc_client_products")
      .delete()
      .eq("tenant_id", tenantId)
      .in("id", productIds)

    if (error) {
      console.error("Error deleting products:", error)
      return { success: false, error: error.message }
    }

    return {
      success: true,
      deletedCount: count || productIds.length,
    }
  } catch (error) {
    console.error("Error in deleteProducts:", error)
    return { success: false, error: "Failed to delete products" }
  }
}
