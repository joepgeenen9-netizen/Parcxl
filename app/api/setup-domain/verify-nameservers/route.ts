import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { domain } = body

    if (!domain || typeof domain !== "string") {
      return NextResponse.json({ error: "Domain is required" }, { status: 400 })
    }

    // Check nameservers via Cloudflare DNS
    const dnsResponse = await fetch(`https://cloudflare-dns.com/dns-query?name=${domain}&type=NS`, {
      method: "GET",
      headers: {
        accept: "application/dns-json",
      },
    })

    if (!dnsResponse.ok) {
      const errorText = await dnsResponse.text()
      console.error("Cloudflare DNS API Error:", dnsResponse.status, dnsResponse.statusText, errorText)
      return NextResponse.json({ error: `DNS verification error: ${dnsResponse.status}` }, { status: 502 })
    }

    const dnsData = await dnsResponse.json()

    // Check if nameservers are correctly set to Vercel
    const expectedNameservers = ["ns1.vercel-dns.com.", "ns2.vercel-dns.com."]
    let nameserversCorrect = false
    let currentNameservers: string[] = []

    if (dnsData.Answer && Array.isArray(dnsData.Answer)) {
      currentNameservers = dnsData.Answer.map((answer: any) => answer.data).filter(Boolean)

      // Check if all expected nameservers are present
      nameserversCorrect = expectedNameservers.every((ns) =>
        currentNameservers.some((current) => current.toLowerCase() === ns.toLowerCase()),
      )
    }

    return NextResponse.json({
      success: true,
      domain,
      nameservers_correct: nameserversCorrect,
      current_nameservers: currentNameservers,
      expected_nameservers: expectedNameservers,
      dns_response: dnsData,
    })
  } catch (error) {
    console.error("Error verifying nameservers:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
