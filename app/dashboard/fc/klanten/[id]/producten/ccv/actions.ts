"use server"

import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

interface CCVProduct {
  id: number
  name: string
  price: number
  productnumber: string
  sku: string
  is_active: boolean
  stock: number
  productmainphoto: string
  description: string
  weight: number
  attributecombinations: {
    collection: any[]
  }
}

interface CCVVariant {
  sku_number: string
  product_number: string
  ean_number: string
  combination: Array<{
    attribute: { name: string }
    attribute_value: { name: string }
  }>
  stock: number
  netto_extra_price: number
}

interface CCVProductsResponse {
  items: CCVProduct[]
}

interface CCVVariantsResponse {
  items: CCVVariant[]
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
  platform_product_id: string
  description?: string
  type: "simple" | "variable"
  parent_id?: number
  variant_id?: string
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

interface CCVIntegration {
  id: string
  client_id: string
  tenant_id: string
  platform: string
  domain?: string
  api_key?: string
  api_secret?: string
  active: boolean
  created_at: string
  updated_at?: string
}

export async function getAllCCVIntegrations(clientId: string, tenantId: string) {
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

    // Get all CCV integrations for this client (oldest first)
    const { data: integrations, error } = await supabase
      .from("fc_client_integrations")
      .select("*")
      .eq("client_id", clientId)
      .eq("tenant_id", tenantId)
      .eq("platform", "ccv")
      .order("created_at", { ascending: true })

    if (error) {
      console.error("Error fetching CCV integrations:", error)
      return { data: [], error: error.message }
    }

    return { data: integrations || [], error: null }
  } catch (error) {
    console.error("Error in getAllCCVIntegrations:", error)
    return { data: [], error: "Failed to fetch CCV integrations" }
  }
}

async function createCCVAPISignature(method: string, uri: string, data: string, apiKey: string, apiSecret: string) {
  const timestamp = new Date().toISOString()
  const hashString = `${apiKey}|${method}|${uri}|${data}|${timestamp}`

  const encoder = new TextEncoder()
  const keyData = encoder.encode(apiSecret)
  const messageData = encoder.encode(hashString)

  const cryptoKey = await crypto.subtle.importKey("raw", keyData, { name: "HMAC", hash: "SHA-512" }, false, ["sign"])
  const signature = await crypto.subtle.sign("HMAC", cryptoKey, messageData)
  const hashArray = Array.from(new Uint8Array(signature))
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")

  return { timestamp, hash: hashHex }
}

async function fetchCCVAPI(url: string, apiKey: string, apiSecret: string) {
  const method = "GET"
  const uri = new URL(url).pathname + new URL(url).search
  const data = ""

  const { timestamp, hash } = await createCCVAPISignature(method, uri, data, apiKey, apiSecret)

  const response = await fetch(url, {
    method: method,
    headers: {
      "x-date": timestamp,
      "x-hash": hash,
      "x-public": apiKey,
      Accept: "application/json",
      "User-Agent": "Packway-Integration/1.0",
    },
    signal: AbortSignal.timeout(30000), // 30 second timeout
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error("CCV API Error:", response.status, errorText)
    throw new Error(`CCV API fout: ${response.status}`)
  }

  return response.json()
}

async function fetchProductVariants(
  productId: number,
  domain: string,
  apiKey: string,
  apiSecret: string,
): Promise<CCVVariant[]> {
  const cleanDomain = domain.replace(/^https?:\/\//, "").replace(/\/$/, "")
  const apiUrl = `https://${cleanDomain}/api/rest/v1/products/${productId}/attributecombinations`

  try {
    const response: CCVVariantsResponse = await fetchCCVAPI(apiUrl, apiKey, apiSecret)
    return response.items || []
  } catch (error) {
    console.error(`Error fetching variants for product ${productId}:`, error)
    return []
  }
}

function buildVariantName(productName: string, combination: CCVVariant["combination"]): string {
  if (!combination || combination.length === 0) {
    return productName
  }

  const attributeString = combination
    .map((attr) => attr.attribute_value.name)
    .filter((value) => value && value.trim() !== "")
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

export async function fetchCCVProducts(
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

    // Get CCV integration
    let query = supabase
      .from("fc_client_integrations")
      .select("*")
      .eq("client_id", clientId)
      .eq("tenant_id", tenantId)
      .eq("platform", "ccv")
      .eq("active", true)

    if (integrationId) {
      query = query.eq("id", integrationId)
    }

    const { data: integration, error: integrationError } = await query.single()

    if (integrationError || !integration) {
      return { data: null, error: "CCV integratie niet gevonden" }
    }

    if (!integration.domain || !integration.api_key || !integration.api_secret) {
      return { data: null, error: "CCV integratie is niet volledig geconfigureerd" }
    }

    // Fetch products from CCV API
    const domain = integration.domain.replace(/^https?:\/\//, "").replace(/\/$/, "")
    const apiUrl = `https://${domain}/api/rest/v1/products?start=0&size=100`

    const ccvProducts: CCVProductsResponse = await fetchCCVAPI(apiUrl, integration.api_key, integration.api_secret)

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

    // Process and map CCV products
    const processedProducts: ProcessedProduct[] = []

    for (const product of ccvProducts.items || []) {
      if (!product.is_active) continue // Skip inactive products

      // ALWAYS fetch variants explicitly, regardless of attributecombinations.collection
      const variants = await fetchProductVariants(
        product.id,
        integration.domain,
        integration.api_key,
        integration.api_secret,
      )

      if (variants && variants.length > 0) {
        // Handle variable products - process each variant as separate product
        for (const variant of variants) {
          const sku = variant.sku_number || `ccv-${product.id}-${variant.product_number}`
          const platformProductId = `${product.id}-${variant.sku_number}`
          const existingProduct = existingProductsMap.get(sku)
          const status = checkPlatformStatus(existingProduct || null, "ccv", platformProductId)

          // Build variation name with attributes
          const variationName = buildVariantName(product.name, variant.combination)

          // Build attributes string for display
          const attributesString =
            variant.combination?.map((attr) => `${attr.attribute.name}: ${attr.attribute_value.name}`).join(", ") || ""

          // Calculate variant price (base price + extra price)
          const variantPrice = product.price + (variant.netto_extra_price || 0)

          processedProducts.push({
            id: `ccv-${product.id}-${variant.sku_number}`,
            name: variationName,
            sku: sku,
            price: variantPrice,
            stock: variant.stock || 0,
            status: status,
            image: product.productmainphoto || "",
            weight: product.weight,
            platform_product_id: platformProductId,
            description: product.description,
            type: "variable",
            parent_id: product.id,
            variant_id: variant.sku_number,
            attributes: attributesString,
          })
        }
      } else {
        // Handle simple products (no variants found)
        const sku = product.sku || `ccv-${product.id}`
        const platformProductId = `${product.id}`
        const existingProduct = existingProductsMap.get(sku)
        const status = checkPlatformStatus(existingProduct || null, "ccv", platformProductId)

        processedProducts.push({
          id: `ccv-${product.id}`,
          name: product.name,
          sku: sku,
          price: product.price || 0,
          stock: product.stock || 0,
          status: status,
          image: product.productmainphoto || "",
          weight: product.weight,
          platform_product_id: platformProductId,
          description: product.description,
          type: "simple",
        })
      }
    }

    return { data: processedProducts }
  } catch (error) {
    console.error("Error fetching CCV products:", error)
    return { data: null, error: "Fout bij ophalen CCV producten" }
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
    const { data: products, error: fetchError } = await fetchCCVProducts(clientId, tenantId)

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
        barcode: null,
        stock: product.stock,
        location: null,
        platform: "ccv",
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
          [nextSlot.column]: "ccv",
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

export async function syncCCVProducts(
  clientId: string,
  tenantId: string,
  integrationId?: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    // This is essentially the same as fetchCCVProducts but could include
    // additional sync logic like updating existing products
    const { data, error } = await fetchCCVProducts(clientId, tenantId, integrationId)

    if (error) {
      return { success: false, error }
    }

    return { success: true }
  } catch (error) {
    console.error("Error syncing CCV products:", error)
    return { success: false, error: "Fout bij synchroniseren" }
  }
}
