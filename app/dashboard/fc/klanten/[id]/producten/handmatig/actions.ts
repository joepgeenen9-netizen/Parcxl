"use server"

import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

export interface ProductFormData {
  sku: string
  articleNumber?: string
  name: string
  description?: string
  imageUrl?: string
  weightGrams?: number
  dimensions?: {
    length?: number
    width?: number
    height?: number
  }
  barcode?: string
  stock: number
  location?: string
}

export async function createProduct(
  clientId: string,
  tenantId: string,
  data: ProductFormData,
): Promise<{ success: boolean; error?: string; productId?: string }> {
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

    // Check if SKU already exists for this client
    const { data: existingProduct } = await supabase
      .from("fc_client_products")
      .select("id")
      .eq("client_id", clientId)
      .eq("tenant_id", tenantId)
      .eq("sku", data.sku)
      .single()

    if (existingProduct) {
      return { success: false, error: "Een product met deze SKU bestaat al voor deze klant" }
    }

    // Insert the new product
    const { data: newProduct, error } = await supabase
      .from("fc_client_products")
      .insert({
        client_id: clientId,
        tenant_id: tenantId,
        sku: data.sku,
        article_number: data.articleNumber || null,
        name: data.name,
        description: data.description || null,
        image_url: data.imageUrl || null,
        weight_grams: data.weightGrams || null,
        dimensions_cm: data.dimensions || null,
        barcode: data.barcode || null,
        stock: data.stock,
        location: data.location || null,
      })
      .select("id")
      .single()

    if (error) {
      console.error("Error creating product:", error)
      return { success: false, error: "Er is een fout opgetreden bij het opslaan van het product" }
    }

    // Revalidate the client details page to show the new product
    revalidatePath(`/dashboard/fc/klanten/${clientId}`)

    return { success: true, productId: newProduct.id }
  } catch (error) {
    console.error("Error in createProduct:", error)
    return { success: false, error: "Er is een onverwachte fout opgetreden" }
  }
}
