"use server"

import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

interface ShopifyIntegration {
  id: string
  client_id: string
  tenant_id: string
  platform: string
  domain: string
  api_key: string
  active: boolean
  created_at: string
}

interface ShopifyProduct {
  id: number
  title: string
  body_html: string
  vendor: string
  product_type: string
  created_at: string
  updated_at: string
  published_at: string
  template_suffix: string | null
  status: string
  published_scope: string
  tags: string
  admin_graphql_api_id: string
  variants: ShopifyVariant[]
  options: ShopifyOption[]
  images: ShopifyImage[]
  image: ShopifyImage | null
}

interface ShopifyVariant {
  id: number
  product_id: number
  title: string
  price: string
  sku: string
  position: number
  inventory_policy: string
  compare_at_price: string | null
  fulfillment_service: string
  inventory_management: string
  option1: string | null
  option2: string | null
  option3: string | null
  created_at: string
  updated_at: string
  taxable: boolean
  barcode: string | null
  grams: number
  image_id: number | null
  weight: number
  weight_unit: string
  inventory_item_id: number
  inventory_quantity: number
  old_inventory_quantity: number
  requires_shipping: boolean
  admin_graphql_api_id: string
}

interface ShopifyOption {
  id: number
  product_id: number
  name: string
  position: number
  values: string[]
}

interface ShopifyImage {
  id: number
  product_id: number
  position: number
  created_at: string
  updated_at: string
  alt: string | null
  width: number
  height: number
  src: string
  variant_ids: number[]
  admin_graphql_api_id: string
}

interface ShopifyProductsResponse {
  products: ShopifyProduct[]
}

interface ProcessedProduct {
  name: string
  sku: string
  price: number
  weight: number
  weight_unit: string
  stock: number
  description: string
  image_url: string | null
  product_id: string
  platform: string
  status: "new" | "existing" | "koppelen"
  attributes?: string
  variant_title?: string
}

export async function getAllShopifyIntegrations(clientId: string, tenantId: string) {
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
      .eq("platform", "shopify")
      .eq("active", true)

    if (error) {
      console.error("Error fetching Shopify integrations:", error)
      return { data: null, error: error.message }
    }

    return { data: data as ShopifyIntegration[], error: null }
  } catch (error) {
    console.error("Error in getAllShopifyIntegrations:", error)
    return { data: null, error: "Failed to fetch Shopify integrations" }
  }
}

export async function fetchShopifyProducts(integrationId: string, clientId: string, tenantId: string) {
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

    // Get the integration details
    const { data: integration, error: integrationError } = await supabase
      .from("fc_client_integrations")
      .select("*")
      .eq("id", integrationId)
      .eq("client_id", clientId)
      .eq("tenant_id", tenantId)
      .eq("platform", "shopify")
      .single()

    if (integrationError || !integration) {
      return { data: null, error: "Integration not found" }
    }

    // Fetch products from Shopify API
    const shopifyUrl = `https://${integration.domain}/admin/api/2024-01/products.json`

    const response = await fetch(shopifyUrl, {
      method: "GET",
      headers: {
        "X-Shopify-Access-Token": integration.api_key,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Shopify API Error:", response.status, errorText)
      return { data: null, error: `Shopify API Error: ${response.status} ${response.statusText}` }
    }

    const shopifyData: ShopifyProductsResponse = await response.json()

    // Get existing products from database
    const { data: existingProducts } = await supabase
      .from("fc_client_products")
      .select(
        "sku, platform, platform_product_id, platform_2, product_id_2, platform_3, product_id_3, platform_4, product_id_4, platform_5, product_id_5, platform_6, product_id_6",
      )
      .eq("client_id", clientId)
      .eq("tenant_id", tenantId)

    // Process Shopify products
    const processedProducts: ProcessedProduct[] = []

    for (const product of shopifyData.products) {
      if (product.variants && product.variants.length > 0) {
        for (const variant of product.variants) {
          // Skip variants without SKU
          if (!variant.sku) continue

          // Determine product name
          let productName = product.title
          if (product.variants.length > 1 && variant.title !== "Default Title") {
            productName = `${product.title} - ${variant.title}`
          }

          // Get variant image or fallback to product image
          let imageUrl: string | null = null
          if (variant.image_id && product.images) {
            const variantImage = product.images.find((img) => img.id === variant.image_id)
            imageUrl = variantImage?.src || null
          }
          if (!imageUrl && product.image) {
            imageUrl = product.image.src
          }

          // Build attributes string for variants
          let attributes = ""
          if (product.variants.length > 1) {
            const attrs = []
            if (variant.option1) attrs.push(variant.option1)
            if (variant.option2) attrs.push(variant.option2)
            if (variant.option3) attrs.push(variant.option3)
            attributes = attrs.join(", ")
          }

          // Convert weight from grams to kg
          const weightInKg = variant.grams ? variant.grams / 1000 : 0

          // Determine status
          let status: "new" | "existing" | "koppelen" = "new"
          const existingProduct = existingProducts?.find((p) => p.sku === variant.sku)

          if (existingProduct) {
            // Check if shopify is already linked
            const platforms = [
              existingProduct.platform,
              existingProduct.platform_2,
              existingProduct.platform_3,
              existingProduct.platform_4,
              existingProduct.platform_5,
              existingProduct.platform_6,
            ]

            if (platforms.includes("shopify")) {
              status = "existing"
            } else {
              status = "koppelen"
            }
          }

          processedProducts.push({
            name: productName,
            sku: variant.sku,
            price: Number.parseFloat(variant.price) || 0,
            weight: weightInKg,
            weight_unit: "kg",
            stock: variant.inventory_quantity || 0,
            description: product.body_html ? product.body_html.replace(/<[^>]*>/g, "").substring(0, 200) : "",
            image_url: imageUrl,
            product_id: variant.id.toString(),
            platform: "shopify",
            status,
            attributes: attributes || undefined,
            variant_title: variant.title !== "Default Title" ? variant.title : undefined,
          })
        }
      }
    }

    return { data: processedProducts, error: null }
  } catch (error) {
    console.error("Error fetching Shopify products:", error)
    return { data: null, error: "Failed to fetch products from Shopify" }
  }
}

export async function importSelectedShopifyProducts(
  selectedProducts: ProcessedProduct[],
  integrationId: string,
  clientId: string,
  tenantId: string,
) {
  try {
    console.log("Starting import with:", {
      selectedProducts: selectedProducts.length,
      integrationId,
      clientId,
      tenantId,
    })

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

    let importedCount = 0
    let linkedCount = 0
    let errorCount = 0
    const errors: string[] = []

    for (const product of selectedProducts) {
      try {
        console.log(`Processing product: ${product.sku} with status: ${product.status}`)

        if (product.status === "new") {
          // Insert new product (zonder price kolom)
          const productData = {
            client_id: clientId,
            tenant_id: tenantId,
            name: product.name,
            sku: product.sku,
            weight_grams: Math.round(product.weight * 1000), // Convert kg back to grams
            stock: product.stock,
            description: product.description || null,
            image_url: product.image_url,
            platform: product.platform,
            platform_product_id: product.product_id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }

          console.log("Inserting product data:", productData)

          const { data: insertedProduct, error: insertError } = await supabase
            .from("fc_client_products")
            .insert(productData)
            .select()
            .single()

          if (insertError) {
            console.error("Error inserting product:", insertError)
            errors.push(`${product.sku}: ${insertError.message}`)
            errorCount++
          } else {
            console.log("Successfully inserted product:", insertedProduct)
            importedCount++
          }
        } else if (product.status === "koppelen") {
          // Link to existing product
          const { data: existingProduct, error: fetchError } = await supabase
            .from("fc_client_products")
            .select("*")
            .eq("client_id", clientId)
            .eq("tenant_id", tenantId)
            .eq("sku", product.sku)
            .single()

          if (fetchError) {
            console.error("Error fetching existing product:", fetchError)
            errors.push(`${product.sku}: Could not find existing product`)
            errorCount++
            continue
          }

          if (existingProduct) {
            // Find next available platform slot
            const platforms = [
              existingProduct.platform,
              existingProduct.platform_2,
              existingProduct.platform_3,
              existingProduct.platform_4,
              existingProduct.platform_5,
              existingProduct.platform_6,
            ]

            const updateData: any = { updated_at: new Date().toISOString() }
            let slotFound = false

            for (let i = 0; i < platforms.length; i++) {
              if (!platforms[i]) {
                const platformField = i === 0 ? "platform" : `platform_${i + 1}`
                const productIdField = i === 0 ? "platform_product_id" : `product_id_${i + 1}`
                updateData[platformField] = product.platform
                updateData[productIdField] = product.product_id
                slotFound = true
                break
              }
            }

            if (!slotFound) {
              errors.push(`${product.sku}: No available platform slots`)
              errorCount++
              continue
            }

            console.log("Updating existing product with:", updateData)

            const { error: updateError } = await supabase
              .from("fc_client_products")
              .update(updateData)
              .eq("id", existingProduct.id)

            if (updateError) {
              console.error("Error linking product:", updateError)
              errors.push(`${product.sku}: ${updateError.message}`)
              errorCount++
            } else {
              console.log("Successfully linked product:", product.sku)
              linkedCount++
            }
          }
        }
      } catch (error: any) {
        console.error("Error processing product:", product.sku, error)
        errors.push(`${product.sku}: ${error.message}`)
        errorCount++
      }
    }

    console.log("Import completed:", { importedCount, linkedCount, errorCount, errors })

    if (errorCount > 0) {
      return {
        success: false,
        imported: importedCount,
        linked: linkedCount,
        errors: errorCount,
        message: `Gedeeltelijk voltooid: ${importedCount} geïmporteerd, ${linkedCount} gekoppeld, ${errorCount} fouten. Eerste fout: ${errors[0]}`,
      }
    }

    let message = "Import voltooid: "
    const messageParts = []
    if (importedCount > 0) {
      messageParts.push(`${importedCount} nieuwe product${importedCount !== 1 ? "en" : ""} geïmporteerd`)
    }
    if (linkedCount > 0) {
      messageParts.push(`${linkedCount} product${linkedCount !== 1 ? "en" : ""} gekoppeld`)
    }
    message += messageParts.join(" en ")

    return {
      success: true,
      imported: importedCount,
      linked: linkedCount,
      errors: errorCount,
      message,
    }
  } catch (error: any) {
    console.error("Error importing Shopify products:", error)
    return {
      success: false,
      imported: 0,
      linked: 0,
      errors: 1,
      message: `Er is een fout opgetreden bij het importeren van producten: ${error.message}`,
    }
  }
}
