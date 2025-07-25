import { NextResponse } from "next/server"
import { getHostingerToken } from "@/lib/get-hostinger-token"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { domain } = body

    if (!domain || typeof domain !== "string") {
      return NextResponse.json({ error: "Domain is required" }, { status: 400 })
    }

    // Handle Packway subdomains - these are always available internally
    if (domain.endsWith(".packway.app")) {
      return NextResponse.json({
        domain,
        available: true,
      })
    }

    // Get Hostinger token from database
    const hostingerToken = await getHostingerToken()
    if (!hostingerToken) {
      return NextResponse.json(
        { error: "Hostinger API token not configured. Please configure it in Settings." },
        { status: 500 },
      )
    }

    // Parse domain: "joepi.nl" -> domain: "joepi", tld: "nl"
    const domainParts = domain.split(".")
    if (domainParts.length < 2) {
      return NextResponse.json({ error: "Invalid domain format" }, { status: 400 })
    }

    const domainName = domainParts[0]
    const tld = domainParts.slice(1).join(".") // Handles multi-part TLDs like co.uk

    // Make request to Hostinger API using the exact format from the curl command
    const hostingerResponse = await fetch("https://developers.hostinger.com/api/domains/v1/availability", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${hostingerToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        domain: domainName,
        tlds: [tld],
        with_alternatives: false,
      }),
    })

    if (!hostingerResponse.ok) {
      const errorText = await hostingerResponse.text()
      console.error("Hostinger API Error:", hostingerResponse.status, hostingerResponse.statusText, errorText)
      return NextResponse.json({ error: `Hostinger API error: ${hostingerResponse.status}` }, { status: 502 })
    }

    // Parse Hostinger response: [{"domain":"joepi.nl","is_available":false,"is_alternative":false,"restriction":null}]
    const hostingerData = await hostingerResponse.json()

    if (!Array.isArray(hostingerData) || hostingerData.length === 0) {
      return NextResponse.json({ error: "Invalid response from Hostinger API" }, { status: 502 })
    }

    const domainResult = hostingerData[0]

    return NextResponse.json({
      domain: domainResult.domain,
      available: domainResult.is_available,
    })
  } catch (error) {
    console.error("Error checking domain availability:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
