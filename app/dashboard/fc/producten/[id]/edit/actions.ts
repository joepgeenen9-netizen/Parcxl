"use server"

import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

interface UpdateProductData {
  name: string
  sku: string
  article_number?: string
  barcode?: string
  description?: string
  image_url?: string
  weight_grams?: number
  dimensions_cm?: string
}

export async function updateProduct(tenantId: string, productId: string, data: UpdateProductData) {
  try {
    const cookieStore = await cookies()

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

    // Prepare update data
    const updateData: any = {
      name: data.name.trim(),
      sku: data.sku.trim(),
      updated_at: new Date().toISOString(),
    }

    // Add optional fields if they exist and are not empty
    if (data.article_number?.trim()) {
      updateData.article_number = data.article_number.trim()
    }
    if (data.barcode?.trim()) {
      updateData.barcode = data.barcode.trim()
    }
    if (data.description?.trim()) {
      updateData.description = data.description.trim()
    }
    if (data.image_url?.trim()) {
      updateData.image_url = data.image_url.trim()
    }
    if (data.weight_grams && !isNaN(Number(data.weight_grams))) {
      updateData.weight_grams = Number(data.weight_grams)
    }
    if (data.dimensions_cm?.trim()) {
      // Try to parse dimensions as JSON if it looks like structured data
      const dimensionsStr = data.dimensions_cm.trim()
      if (dimensionsStr.includes("x") || dimensionsStr.includes("X")) {
        // Format like "10 x 5 x 3" - store as string for now
        updateData.dimensions_cm = dimensionsStr
      } else {
        updateData.dimensions_cm = dimensionsStr
      }
    }

    console.log("Updating product with data:", updateData)

    // Update the product - use correct column name
    const { data: updatedProduct, error } = await supabase
      .from("fc_client_products")
      .update(updateData)
      .eq("id", productId)
      .eq("tenant_id", tenantId) // Fixed: use tenant_id instead of client_tenant_id
      .select()
      .single()

    if (error) {
      console.error("Supabase error:", error)
      return {
        success: false,
        error: `Database error: ${error.message}`,
      }
    }

    if (!updatedProduct) {
      return {
        success: false,
        error: "Product not found or could not be updated",
      }
    }

    console.log("Product updated successfully:", updatedProduct)

    return {
      success: true,
      data: updatedProduct,
    }
  } catch (error) {
    console.error("Error in updateProduct:", error)
    return {
      success: false,
      error: `Unexpected error: ${error instanceof Error ? error.message : "Unknown error"}`,
    }
  }
}
