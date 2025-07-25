"use server"

import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export interface ProductDetail {
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
  client_contact_person?: string | null
  client_email?: string | null
  client_phone?: string | null
  client_address_street?: string | null
  client_address_number?: string | null
  client_address_postal_code?: string | null
}

export interface StockLocation {
  id: string
  location_code: string
  quantity: number
}

export interface ProductLogEntry {
  id: string
  date: string
  user: string
  event: string
}

export async function getProductById(
  tenantId: string,
  productId: string,
): Promise<{ data: ProductDetail | null; error?: string }> {
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

    // Fetch product with client information
    const { data: product, error } = await supabase
      .from("fc_client_products")
      .select(`
        *,
        fc_clients!inner (
          id,
          company_name,
          logo_url,
          status,
          contact_person,
          email,
          phone,
          address_city,
          address_country,
          address_street,
          address_number,
          address_postal_code
        )
      `)
      .eq("tenant_id", tenantId)
      .eq("id", productId)
      .single()

    if (error) {
      console.error("Error fetching product:", error)
      return { data: null, error: error.message }
    }

    if (!product) {
      return { data: null, error: "Product not found" }
    }

    // Transform the data to flatten client information
    const transformedProduct: ProductDetail = {
      ...product,
      client_company_name: product.fc_clients.company_name,
      client_logo_url: product.fc_clients.logo_url,
      client_status: product.fc_clients.status,
      client_contact_person: product.fc_clients.contact_person,
      client_email: product.fc_clients.email,
      client_phone: product.fc_clients.phone,
      client_address_city: product.fc_clients.address_city,
      client_address_country: product.fc_clients.address_country,
      client_address_street: product.fc_clients.address_street,
      client_address_number: product.fc_clients.address_number,
      client_address_postal_code: product.fc_clients.address_postal_code,
    }

    return { data: transformedProduct }
  } catch (error) {
    console.error("Error in getProductById:", error)
    return { data: null, error: "Failed to fetch product" }
  }
}

export async function getStockLocations(productId: string): Promise<StockLocation[]> {
  // Mock data for demonstration - in real app, this would come from database
  return [
    { id: "1", location_code: "A-01-01", quantity: 25 },
    { id: "2", location_code: "B-02-03", quantity: 15 },
    { id: "3", location_code: "C-01-05", quantity: 8 },
  ]
}

export async function getProductLog(productId: string): Promise<ProductLogEntry[]> {
  // Mock data for demonstration - in real app, this would come from database
  return [
    {
      id: "1",
      date: "2024-01-15 14:30",
      user: "Jan Janssen",
      event: "Voorraad aangepast van 40 naar 48 stuks",
    },
    {
      id: "2",
      date: "2024-01-14 09:15",
      user: "Marie de Vries",
      event: "Product toegevoegd aan WooCommerce",
    },
    {
      id: "3",
      date: "2024-01-13 16:45",
      user: "Piet Bakker",
      event: "Productinformatie bijgewerkt",
    },
    {
      id: "4",
      date: "2024-01-12 11:20",
      user: "System",
      event: "Product aangemaakt",
    },
  ]
}
