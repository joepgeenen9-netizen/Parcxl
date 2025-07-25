import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { domain, accessToken } = await request.json()

    if (!domain || !accessToken) {
      return NextResponse.json({ success: false, error: "Domein en access token zijn verplicht" }, { status: 400 })
    }

    // Clean up domain
    let cleanDomain = domain.replace(/^https?:\/\//, "").replace(/\/+$/, "")
    if (!cleanDomain.includes(".myshopify.com")) {
      cleanDomain = cleanDomain + ".myshopify.com"
    }

    // Test Shopify API connection
    const shopifyUrl = `https://${cleanDomain}/admin/api/2024-04/shop.json`

    const response = await fetch(shopifyUrl, {
      method: "GET",
      headers: {
        "X-Shopify-Access-Token": accessToken,
        "Content-Type": "application/json",
      },
    })

    const responseText = await response.text()

    // Check if response starts with {"shop":{"id as specified
    if (response.ok && responseText.startsWith('{"shop":{"id')) {
      try {
        const shopData = JSON.parse(responseText)
        return NextResponse.json({
          success: true,
          shopInfo: {
            id: shopData.shop.id,
            name: shopData.shop.name,
            domain: shopData.shop.domain,
            email: shopData.shop.email,
            currency: shopData.shop.currency,
            timezone: shopData.shop.timezone,
          },
        })
      } catch (parseError) {
        return NextResponse.json({
          success: true,
          shopInfo: { name: "Shopify winkel", domain: cleanDomain },
        })
      }
    } else {
      // Handle different error cases
      let errorMessage = "Onbekende fout bij verbinden met Shopify API"

      if (response.status === 401) {
        errorMessage = "Ongeldige access token - controleer je API sleutel"
      } else if (response.status === 404) {
        errorMessage = "Winkel niet gevonden - controleer je domein"
      } else if (response.status === 403) {
        errorMessage = "Geen toegang - controleer je API permissies"
      } else if (response.status >= 500) {
        errorMessage = "Shopify server fout - probeer het later opnieuw"
      } else if (!response.ok) {
        errorMessage = `HTTP ${response.status}: ${responseText.substring(0, 100)}`
      }

      return NextResponse.json({ success: false, error: errorMessage }, { status: 400 })
    }
  } catch (error: any) {
    console.error("Shopify connection test error:", error)

    if (error.code === "ENOTFOUND" || error.code === "ECONNREFUSED") {
      return NextResponse.json(
        { success: false, error: "Kan geen verbinding maken - controleer je domein" },
        { status: 400 },
      )
    }

    return NextResponse.json(
      { success: false, error: "Netwerkfout - controleer je internetverbinding" },
      { status: 500 },
    )
  }
}
