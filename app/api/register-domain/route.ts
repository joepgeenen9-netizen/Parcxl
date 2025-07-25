import { NextResponse } from "next/server"
import { getHostingerToken } from "@/lib/get-hostinger-token"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { domain } = body

    if (!domain || typeof domain !== "string") {
      return NextResponse.json({ error: "Domain is required" }, { status: 400 })
    }

    // Validate that it's a .nl domain
    if (!domain.endsWith(".nl")) {
      return NextResponse.json({ error: "Only .nl domains are supported" }, { status: 400 })
    }

    // Get Hostinger token from database
    const hostingerToken = await getHostingerToken()
    if (!hostingerToken) {
      return NextResponse.json(
        { error: "Hostinger API token not configured. Please configure it in Settings." },
        { status: 500 },
      )
    }

    // Make request to Hostinger API for domain registration
    const hostingerResponse = await fetch("https://developers.hostinger.com/api/domains/v1/portfolio", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${hostingerToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        domain: domain,
        item_id: "hostingernl-domain-nl-eur-1y",
        payment_method_id: 38230008,
        domain_contacts: {
          owner_id: 9486387, // This should be configurable in the future
          admin_id: 9486387,
          billing_id: 9486387,
          tech_id: 9486387,
        },
        additional_details: {},
        coupons: [],
      }),
    })

    if (!hostingerResponse.ok) {
      const errorText = await hostingerResponse.text()
      console.error(
        "Hostinger Registration API Error:",
        hostingerResponse.status,
        hostingerResponse.statusText,
        errorText,
      )
      return NextResponse.json({ error: `Domain registration failed: ${hostingerResponse.status}` }, { status: 502 })
    }

    // Parse Hostinger response
    const registrationData = await hostingerResponse.json()

    return NextResponse.json({
      success: true,
      domain,
      registration: registrationData,
    })
  } catch (error) {
    console.error("Error registering domain:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
