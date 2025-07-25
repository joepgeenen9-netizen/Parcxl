import { NextResponse } from "next/server"
import { getHostingerToken } from "@/lib/get-hostinger-token"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { domain } = body

    if (!domain || typeof domain !== "string") {
      return NextResponse.json({ error: "Domain is required" }, { status: 400 })
    }

    // Get Hostinger token from database
    const hostingerToken = await getHostingerToken()
    if (!hostingerToken) {
      return NextResponse.json(
        { error: "Hostinger API token not configured. Please configure it in Settings." },
        { status: 500 },
      )
    }

    // Update nameservers via Hostinger API
    const hostingerResponse = await fetch(
      `https://developers.hostinger.com/api/domains/v1/portfolio/${domain}/nameservers`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${hostingerToken}`,
        },
        body: JSON.stringify({
          ns1: "ns1.vercel-dns.com",
          ns2: "ns2.vercel-dns.com",
        }),
      },
    )

    if (!hostingerResponse.ok) {
      const errorText = await hostingerResponse.text()
      console.error(
        "Hostinger Nameservers API Error:",
        hostingerResponse.status,
        hostingerResponse.statusText,
        errorText,
      )
      return NextResponse.json(
        { error: `Hostinger nameservers API error: ${hostingerResponse.status}` },
        { status: 502 },
      )
    }

    const responseText = await hostingerResponse.text()

    return NextResponse.json({
      success: true,
      domain,
      message: responseText,
    })
  } catch (error) {
    console.error("Error updating nameservers:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
