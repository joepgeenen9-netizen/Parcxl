"use server"

import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

interface WooCommerceProduct {
  id: number
  name: string
  sku: string
  price: string
  weight: string
  description: string
  type: "simple" | "variable" | "grouped" | "external"
  images: Array<{
    src: string
  }>
  dimensions: {
    length: string
    width: string
    height: string
  }
  stock_quantity: number
  global_unique_id?: string
  variations?: number[]
}

interface WooCommerceVariation {
  id: number
  sku: string
  price: string
  weight: string
  image: {
    src: string
  } | null
  dimensions: {
    length: string
    width: string
    height: string
  }
  stock_quantity: number
  manage_stock: boolean
  global_unique_id?: string
  attributes: Array<{
    name: string
    option: string
  }>
}

interface ProcessedProduct {
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

interface ExistingProduct {
  id: string
  sku: string
  platform: string
  platform_product_id: string
  platform_2?: string
  product_id_2?: string
  platform_3?: string
  product_id_3?: string
  platform_4?: string
  product_id_4?: string
  platform_5?: string
  product_id_5?: string
  platform_6?: string
  product_id_6?: string
}

export async function getWooCommerceIntegration(clientId: string, tenantId: string) {
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

    // Get the first WooCommerce integration for this client (oldest first)
    const { data: integration, error } = await supabase
      .from("fc_client_integrations")
      .select("*")
      .eq("client_id", clientId)
      .eq("tenant_id", tenantId)
      .eq("platform", "woocommerce")
      .order("created_at", { ascending: true })
      .limit(1)
      .single()

    if (error) {
      console.error("Error fetching WooCommerce integration:", error)
      return { data: null, error: error.message }
    }

    return { data: integration, error: null }
  } catch (error) {
    console.error("Error in getWooCommerceIntegration:", error)
    return { data: null, error: "Failed to fetch WooCommerce integration" }
  }
}

export async function getAllWooCommerceIntegrations(clientId: string, tenantId: string) {
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

    // Get all WooCommerce integrations for this client (oldest first)
    const { data: integrations, error } = await supabase
      .from("fc_client_integrations")
      .select("*")
      .eq("client_id", clientId)
      .eq("tenant_id", tenantId)
      .eq("platform", "woocommerce")
      .order("created_at", { ascending: true })

    if (error) {
      console.error("Error fetching WooCommerce integrations:", error)
      return { data: [], error: error.message }
    }

    return { data: integrations || [], error: null }
  } catch (error) {
    console.error("Error in getAllWooCommerceIntegrations:", error)
    return { data: [], error: "Failed to fetch WooCommerce integrations" }
  }
}

async function fetchWooCommerceAPI(url: string, apiKey: string, apiSecret: string) {
  const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString("base64")

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error("WooCommerce API Error:", response.status, errorText)
    throw new Error(`WooCommerce API fout: ${response.status}`)
  }

  return response.json()
}

async function fetchProductVariations(
  productId: number,
  domain: string,
  apiKey: string,
  apiSecret: string,
): Promise<WooCommerceVariation[]> {
  const cleanDomain = domain.replace(/^https?:\/\//, "").replace(/\/$/, "")
  const apiUrl = `https://${cleanDomain}/wp-json/wc/v3/products/${productId}/variations?per_page=100`

  try {
    return await fetchWooCommerceAPI(apiUrl, apiKey, apiSecret)
  } catch (error) {
    console.error(`Error fetching variations for product ${productId}:`, error)
    return []
  }
}

function buildVariationName(productName: string, attributes: Array<{ name: string; option: string }>): string {
  if (!attributes || attributes.length === 0) {
    return productName
  }

  const attributeString = attributes
    .map((attr) => attr.option)
    .filter((option) => option && option.trim() !== "")
    .join(" ")

  return attributeString ? `${productName} - ${attributeString}` : productName
}

function checkPlatformStatus(
  existingProduct: ExistingProduct | null,
  currentPlatform: string,
  currentProductId: string,
): "new" | "existing" | "koppelen" {
  if (!existingProduct) {
    return "new"
  }

  // Check all platform columns
  const platformColumns = [
    { platform: existingProduct.platform, productId: existingProduct.platform_product_id },
    { platform: existingProduct.platform_2, productId: existingProduct.product_id_2 },
    { platform: existingProduct.platform_3, productId: existingProduct.product_id_3 },
    { platform: existingProduct.platform_4, productId: existingProduct.product_id_4 },
    { platform: existingProduct.platform_5, productId: existingProduct.product_id_5 },
    { platform: existingProduct.platform_6, productId: existingProduct.product_id_6 },
  ]

  // Check if current platform is already linked
  const isLinked = platformColumns.some((col) => col.platform === currentPlatform && col.productId === currentProductId)

  if (isLinked) {
    return "existing"
  }

  // Check if there's an empty slot for linking
  const hasEmptySlot = platformColumns.some((col) => !col.platform)

  return hasEmptySlot ? "koppelen" : "existing" // If no empty slots, treat as existing
}

export async function fetchWooCommerceProducts(
  clientId: string,
  tenantId: string,
  integrationId?: string,
): Promise<{ data: ProcessedProduct[] | null; error?: string }> {
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

    // Get WooCommerce integration
    let query = supabase
      .from("fc_client_integrations")
      .select("*")
      .eq("client_id", clientId)
      .eq("tenant_id", tenantId)
      .eq("platform", "woocommerce")
      .eq("active", true)

    if (integrationId) {
      query = query.eq("id", integrationId)
    }

    const { data: integration, error: integrationError } = await query.single()

    if (integrationError || !integration) {
      return { data: null, error: "WooCommerce integratie niet gevonden" }
    }

    if (!integration.domain || !integration.api_key || !integration.api_secret) {
      return { data: null, error: "WooCommerce integratie is niet volledig geconfigureerd" }
    }

    // Fetch products from WooCommerce API
    const domain = integration.domain.replace(/^https?:\/\//, "").replace(/\/$/, "")
    const apiUrl = `https://${domain}/wp-json/wc/v3/products?per_page=100`

    const wooProducts: WooCommerceProduct[] = await fetchWooCommerceAPI(
      apiUrl,
      integration.api_key,
      integration.api_secret,
    )

    // Get existing products from database with all platform columns
    const { data: existingProducts, error: dbError } = await supabase
      .from("fc_client_products")
      .select(`
        id, sku, platform, platform_product_id,
        platform_2, product_id_2,
        platform_3, product_id_3,
        platform_4, product_id_4,
        platform_5, product_id_5,
        platform_6, product_id_6
      `)
      .eq("client_id", clientId)
      .eq("tenant_id", tenantId)

    if (dbError) {
      console.error("Database error:", dbError)
      return { data: null, error: "Fout bij ophalen bestaande producten" }
    }

    // Create lookup map for existing products by SKU
    const existingProductsMap = new Map<string, ExistingProduct>()
    existingProducts?.forEach((product) => {
      existingProductsMap.set(product.sku, product as ExistingProduct)
    })

    // Process and map WooCommerce products
    const processedProducts: ProcessedProduct[] = []

    for (const product of wooProducts) {
      if (product.type === "simple") {
        // Handle simple products
        const sku = product.sku || `wc-${product.id}`
        const platformProductId = `${product.id}`
        const existingProduct = existingProductsMap.get(sku)
        const status = checkPlatformStatus(existingProduct || null, "woocommerce", platformProductId)

        processedProducts.push({
          id: `wc-${product.id}`,
          name: product.name,
          sku: sku,
          price: Number.parseFloat(product.price) || 0,
          stock: product.stock_quantity || 0,
          status: status,
          image: product.images?.[0]?.src || "",
          weight: product.weight ? Number.parseFloat(product.weight) : undefined,
          dimensions: product.dimensions
            ? {
                length: Number.parseFloat(product.dimensions.length) || 0,
                width: Number.parseFloat(product.dimensions.width) || 0,
                height: Number.parseFloat(product.dimensions.height) || 0,
              }
            : undefined,
          platform_product_id: platformProductId,
          description: product.description,
          type: "simple",
        })
      } else if (product.type === "variable" && product.variations && product.variations.length > 0) {
        // Handle variable products - fetch variations
        const variations = await fetchProductVariations(
          product.id,
          integration.domain,
          integration.api_key,
          integration.api_secret,
        )

        for (const variation of variations) {
          const sku = variation.sku || `wc-${product.id}-${variation.id}`
          const platformProductId = `${product.id}-${variation.id}`
          const existingProduct = existingProductsMap.get(sku)
          const status = checkPlatformStatus(existingProduct || null, "woocommerce", platformProductId)

          // Build variation name with attributes
          const variationName = buildVariationName(product.name, variation.attributes)

          // Build attributes string for display
          const attributesString = variation.attributes?.map((attr) => `${attr.name}: ${attr.option}`).join(", ") || ""

          processedProducts.push({
            id: `wc-${product.id}-${variation.id}`,
            name: variationName,
            sku: sku,
            price: Number.parseFloat(variation.price) || 0,
            stock: variation.manage_stock ? variation.stock_quantity || 0 : 0,
            status: status,
            image: variation.image?.src || product.images?.[0]?.src || "",
            weight: variation.weight ? Number.parseFloat(variation.weight) : undefined,
            dimensions: variation.dimensions
              ? {
                  length: Number.parseFloat(variation.dimensions.length) || 0,
                  width: Number.parseFloat(variation.dimensions.width) || 0,
                  height: Number.parseFloat(variation.dimensions.height) || 0,
                }
              : undefined,
            platform_product_id: platformProductId,
            description: product.description,
            type: "variable",
            parent_id: product.id,
            variation_id: variation.id,
            attributes: attributesString,
          })
        }
      }
    }

    return { data: processedProducts }
  } catch (error) {
    console.error("Error fetching WooCommerce products:", error)
    return { data: null, error: "Fout bij ophalen WooCommerce producten" }
  }
}

function findNextAvailablePlatformSlot(existingProduct: ExistingProduct): { column: string; idColumn: string } | null {
  const platformSlots = [
    { column: "platform_2", idColumn: "product_id_2", value: existingProduct.platform_2 },
    { column: "platform_3", idColumn: "product_id_3", value: existingProduct.platform_3 },
    { column: "platform_4", idColumn: "product_id_4", value: existingProduct.platform_4 },
    { column: "platform_5", idColumn: "product_id_5", value: existingProduct.platform_5 },
    { column: "platform_6", idColumn: "product_id_6", value: existingProduct.platform_6 },
  ]

  const emptySlot = platformSlots.find((slot) => !slot.value)
  return emptySlot ? { column: emptySlot.column, idColumn: emptySlot.idColumn } : null
}

export async function importSelectedProducts(
  clientId: string,
  tenantId: string,
  productIds: string[],
): Promise<{ success: boolean; error?: string; imported: number; linked: number }> {
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

    // First, fetch the products again to get current data
    const { data: products, error: fetchError } = await fetchWooCommerceProducts(clientId, tenantId)

    if (fetchError || !products) {
      return { success: false, error: fetchError || "Fout bij ophalen producten", imported: 0, linked: 0 }
    }

    // Filter selected products and separate by status
    const selectedProducts = products.filter((p) => productIds.includes(p.id))
    const newProducts = selectedProducts.filter((p) => p.status === "new")
    const linkProducts = selectedProducts.filter((p) => p.status === "koppelen")

    let importedCount = 0
    let linkedCount = 0

    // Handle new products - create new records
    if (newProducts.length > 0) {
      const productsToInsert = newProducts.map((product) => ({
        tenant_id: tenantId,
        client_id: clientId,
        sku: product.sku,
        article_number: product.sku,
        name: product.name,
        description: product.description || null,
        image_url: product.image || null,
        weight_grams: product.weight ? Math.round(product.weight * 1000) : null,
        dimensions_cm: product.dimensions
          ? `${product.dimensions.length} x ${product.dimensions.width} x ${product.dimensions.height}`
          : null,
        barcode: null,
        stock: product.stock,
        location: null,
        platform: "woocommerce",
        platform_product_id: product.platform_product_id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }))

      const { error: insertError } = await supabase.from("fc_client_products").insert(productsToInsert)

      if (insertError) {
        console.error("Insert error:", insertError)
        return { success: false, error: "Fout bij importeren nieuwe producten", imported: 0, linked: 0 }
      }

      importedCount = newProducts.length
    }

    // Handle products to link - update existing records
    if (linkProducts.length > 0) {
      // Get existing products with all platform columns
      const { data: existingProducts, error: existingError } = await supabase
        .from("fc_client_products")
        .select(`
          id, sku, platform, platform_product_id,
          platform_2, product_id_2,
          platform_3, product_id_3,
          platform_4, product_id_4,
          platform_5, product_id_5,
          platform_6, product_id_6
        `)
        .eq("client_id", clientId)
        .eq("tenant_id", tenantId)
        .in(
          "sku",
          linkProducts.map((p) => p.sku),
        )

      if (existingError) {
        console.error("Error fetching existing products for linking:", existingError)
        return { success: false, error: "Fout bij ophalen bestaande producten", imported: importedCount, linked: 0 }
      }

      // Process each product to link
      for (const product of linkProducts) {
        const existingProduct = existingProducts?.find((ep) => ep.sku === product.sku) as ExistingProduct
        if (!existingProduct) continue

        const nextSlot = findNextAvailablePlatformSlot(existingProduct)
        if (!nextSlot) continue

        // Update the existing product with the new platform link
        const updateData = {
          [nextSlot.column]: "woocommerce",
          [nextSlot.idColumn]: product.platform_product_id,
          updated_at: new Date().toISOString(),
        }

        const { error: updateError } = await supabase
          .from("fc_client_products")
          .update(updateData)
          .eq("id", existingProduct.id)

        if (updateError) {
          console.error("Error linking product:", updateError)
          continue
        }

        linkedCount++
      }
    }

    return { success: true, imported: importedCount, linked: linkedCount }
  } catch (error) {
    console.error("Error importing products:", error)
    return { success: false, error: "Fout bij importeren producten", imported: 0, linked: 0 }
  }
}

export async function syncWooCommerceProducts(
  clientId: string,
  tenantId: string,
  integrationId?: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    // This is essentially the same as fetchWooCommerceProducts but could include
    // additional sync logic like updating existing products
    const { data, error } = await fetchWooCommerceProducts(clientId, tenantId, integrationId)

    if (error) {
      return { success: false, error }
    }

    return { success: true }
  } catch (error) {
    console.error("Error syncing WooCommerce products:", error)
    return { success: false, error: "Fout bij synchroniseren" }
  }
}
