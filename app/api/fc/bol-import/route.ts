import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

interface BolProduct {
  sku: string
  name: string
  price: number
  weight: string | null
  imageUrl: string | null
  ean: string
  offerId: string
}

interface BolExportResponse {
  processStatusId: string
  status: string
  entityId?: string
}

interface BolProcessStatus {
  processStatusId: string
  status: "PENDING" | "SUCCESS" | "ERROR"
  entityId?: string
  errorMessage?: string
}

interface BolCatalogProduct {
  title: string
  attributes?: Array<{
    id: string
    values: Array<{
      value: string
      unitId?: string
    }>
  }>
  images?: Array<{
    url: string
  }>
  enrichment?: {
    status: string
  }
}

// Logger utility
const logger = {
  info: (message: string, meta: any = {}) => {
    console.log(`[INFO] ${message}`, JSON.stringify(meta))
  },
  debug: (message: string, meta: any = {}) => {
    console.log(`[DEBUG] ${message}`, JSON.stringify(meta))
  },
  warn: (message: string, meta: any = {}) => {
    console.warn(`[WARN] ${message}`, JSON.stringify(meta))
  },
  error: (message: string, meta: any = {}) => {
    console.error(`[ERROR] ${message}`, JSON.stringify(meta))
  },
}

async function getAccessToken(clientId: string, tenantId: string, supabase: any): Promise<string> {
  const { data, error } = await supabase
    .from("fc_client_integrations")
    .select("access_token")
    .eq("client_id", clientId)
    .eq("tenant_id", tenantId)
    .eq("platform", "bol.com")
    .eq("active", true)
    .single()

  if (error || !data?.access_token) {
    logger.error("Access token niet gevonden", { clientId, tenantId, error })
    throw new Error("Bol.com access token niet gevonden")
  }

  logger.info("Access token opgehaald", { clientId, tenantId })
  return data.access_token
}

async function requestOfferExport(accessToken: string): Promise<string> {
  logger.info("Export aanvragen gestart")

  const response = await fetch("https://api.bol.com/retailer/offers/export", {
    method: "POST",
    headers: {
      Accept: "application/vnd.retailer.v10+json",
      "Content-Type": "application/vnd.retailer.v10+json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ format: "CSV" }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    logger.error("Export aanvraag gefaald", {
      status: response.status,
      statusText: response.statusText,
      error: errorText,
    })
    throw new Error(`Bol.com API error: ${response.status} - ${errorText}`)
  }

  const data: BolExportResponse = await response.json()
  logger.info("Export aangevraagd", { processStatusId: data.processStatusId })

  return data.processStatusId
}

async function pollProcessStatus(processStatusId: string, accessToken: string): Promise<string> {
  logger.info("Status polling gestart", { processStatusId })

  let attempts = 0
  const maxAttempts = 60 // 2 minutes max

  while (attempts < maxAttempts) {
    const response = await fetch(`https://api.bol.com/shared/process-status/${processStatusId}`, {
      headers: {
        Accept: "application/vnd.retailer.v10+json",
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      logger.error("Status poll gefaald", {
        processStatusId,
        status: response.status,
        attempt: attempts + 1,
      })
      throw new Error(`Status poll failed: ${response.status}`)
    }

    const status: BolProcessStatus = await response.json()
    logger.debug("Status poll bol.com", {
      processStatusId,
      status: status.status,
      timestamp: new Date(),
      attempt: attempts + 1,
    })

    if (status.status === "SUCCESS") {
      if (!status.entityId) {
        throw new Error("Export succesvol maar geen entityId ontvangen")
      }
      logger.info("Export voltooid", { processStatusId, entityId: status.entityId })
      return status.entityId
    }

    if (status.status === "ERROR") {
      logger.error("Export gefaald", { processStatusId, error: status.errorMessage })
      throw new Error(`Export failed: ${status.errorMessage || "Onbekende fout"}`)
    }

    // Wait 2 seconds before next poll
    await new Promise((resolve) => setTimeout(resolve, 2000))
    attempts++
  }

  throw new Error("Export timeout - proces duurde te lang")
}

async function downloadCsv(entityId: string, accessToken: string): Promise<string> {
  logger.info("CSV download gestart", { entityId })

  const response = await fetch(`https://api.bol.com/retailer/offers/export/${entityId}`, {
    headers: {
      Accept: "application/vnd.retailer.v10+csv",
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    logger.error("CSV download gefaald", {
      entityId,
      status: response.status,
      statusText: response.statusText,
    })
    throw new Error(`CSV download failed: ${response.status}`)
  }

  const csvText = await response.text()
  logger.info("CSV gedownload", { entityId, length: csvText.length })

  return csvText
}

function parseCsv(csvText: string): Array<Record<string, string>> {
  const lines = csvText.trim().split("\n")
  if (lines.length < 2) {
    throw new Error("CSV bevat geen data")
  }

  const headers = lines[0].split(",").map((h) => h.replace(/"/g, "").trim())
  const rows = []

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",").map((v) => v.replace(/"/g, "").trim())
    const row: Record<string, string> = {}

    headers.forEach((header, index) => {
      row[header] = values[index] || ""
    })

    rows.push(row)
  }

  logger.info("CSV geparseerd", { rowCount: rows.length, headers })
  return rows
}

async function fetchProductData(ean: string, offerId: string, accessToken: string): Promise<BolCatalogProduct | null> {
  logger.info("Product data ophalen start", { ean, offerId })

  try {
    const response = await fetch(`https://api.bol.com/retailer/content/catalog-products/${ean}`, {
      headers: {
        Accept: "application/vnd.retailer.v10+json",
        Authorization: `Bearer ${accessToken}`,
        "Accept-Language": "nl",
      },
    })

    if (response.status === 403) {
      logger.error("Forbidden: controleer access_token", { ean, status: response.status })
      throw new Error("Bol.com API returned 403 – toegang geweigerd")
    }

    if (response.status === 429) {
      const retryAfter = response.headers.get("Retry-After")
      logger.warn("Rate limit bereikt, back-off", { ean, retryAfter })
      // Wait and retry once
      await new Promise((resolve) => setTimeout(resolve, Number.parseInt(retryAfter || "5") * 1000))
      return fetchProductData(ean, offerId, accessToken)
    }

    if (response.status === 404) {
      logger.warn("Product niet gevonden in catalog", { ean })
      return null
    }

    if (!response.ok) {
      logger.error("Product data ophalen gefaald", {
        ean,
        status: response.status,
        statusText: response.statusText,
      })
      return null
    }

    const productData: BolCatalogProduct = await response.json()
    logger.info("Product data opgehaald", {
      ean,
      title: productData.title,
      enrichmentStatus: productData.enrichment?.status,
    })

    return productData
  } catch (error) {
    logger.error("Fout bij ophalen product data", { ean, error: error.message })
    return null
  }
}

function extractWeight(
  attributes?: Array<{ id: string; values: Array<{ value: string; unitId?: string }> }>,
): string | null {
  if (!attributes) return null

  const weightAttr = attributes.find(
    (attr) => attr.id.toLowerCase().includes("weight") || attr.id.toLowerCase().includes("gewicht"),
  )

  if (weightAttr && weightAttr.values.length > 0) {
    const value = weightAttr.values[0]
    return `${value.value}${value.unitId ? ` ${value.unitId}` : ""}`
  }

  return null
}

async function processProducts(csvRows: Array<Record<string, string>>, accessToken: string): Promise<BolProduct[]> {
  const products: BolProduct[] = []

  logger.info("Product verwerking gestart", { totalRows: csvRows.length })

  for (const row of csvRows) {
    try {
      const ean = row.ean || row.EAN
      const offerId = row.offerId || row.OfferId
      const price = Number.parseFloat(row.bundlePricesPrice || row["bundlePrices.price"] || "0")

      if (!ean || !offerId) {
        logger.warn("Rij overgeslagen: ontbrekende EAN of OfferId", { row })
        continue
      }

      const productData = await fetchProductData(ean, offerId, accessToken)

      const product: BolProduct = {
        sku: offerId,
        name: productData?.title || `Product ${ean}`,
        price: price,
        weight: extractWeight(productData?.attributes),
        imageUrl: productData?.images?.[0]?.url || null,
        ean: ean,
        offerId: offerId,
      }

      products.push(product)

      // Small delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 100))
    } catch (error) {
      logger.error("Fout bij verwerken product", { row, error: error.message })
      continue
    }
  }

  logger.info("Import voltooid", { count: products.length })
  return products
}

export async function POST(request: NextRequest) {
  try {
    const { clientId, tenantId } = await request.json()

    if (!clientId || !tenantId) {
      return NextResponse.json({ error: "clientId en tenantId zijn verplicht" }, { status: 400 })
    }

    logger.info("Bol.com import gestart", { clientId, tenantId })

    // Setup Supabase client
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
            // Server component context
          }
        },
      },
    })

    // Step 1: Get access token
    const accessToken = await getAccessToken(clientId, tenantId, supabase)

    // Step 2: Request offer export
    const processStatusId = await requestOfferExport(accessToken)

    // Step 3: Poll for completion
    const entityId = await pollProcessStatus(processStatusId, accessToken)

    // Step 4: Download CSV
    const csvText = await downloadCsv(entityId, accessToken)

    // Step 5: Parse CSV
    const csvRows = parseCsv(csvText)

    // Step 6: Process products (fetch additional data)
    const products = await processProducts(csvRows, accessToken)

    return NextResponse.json({
      success: true,
      products,
      count: products.length,
    })
  } catch (error) {
    logger.error("Bol.com import gefaald", { error: error.message })
    return NextResponse.json(
      {
        error: error.message || "Onbekende fout bij importeren",
        success: false,
      },
      { status: 500 },
    )
  }
}
