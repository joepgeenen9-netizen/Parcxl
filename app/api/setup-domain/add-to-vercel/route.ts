import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { domain } = body

    if (!domain || typeof domain !== "string") {
      return NextResponse.json({ error: "Domain is required" }, { status: 400 })
    }

    // Vercel API credentials - these should be in environment variables
    const vercelToken = process.env.VERCEL_TOKEN
    const projectId = process.env.VERCEL_PROJECT_ID
    const teamId = process.env.VERCEL_TEAM_ID

    if (!vercelToken || !projectId || !teamId) {
      return NextResponse.json({ error: "Vercel API credentials not configured" }, { status: 500 })
    }

    const results = []

    // Add main domain to Vercel project
    const mainDomainResponse = await fetch(`https://api.vercel.com/v9/projects/${projectId}/domains?teamId=${teamId}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${vercelToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: domain,
      }),
    })

    if (!mainDomainResponse.ok) {
      const errorText = await mainDomainResponse.text()
      console.error(
        "Vercel API Error (main domain):",
        mainDomainResponse.status,
        mainDomainResponse.statusText,
        errorText,
      )
      return NextResponse.json(
        { error: `Vercel API error for main domain: ${mainDomainResponse.status}` },
        { status: 502 },
      )
    }

    const mainDomainData = await mainDomainResponse.json()
    results.push({ domain, response: mainDomainData })

    // Add www subdomain to Vercel project
    const wwwDomain = `www.${domain}`
    const wwwDomainResponse = await fetch(`https://api.vercel.com/v9/projects/${projectId}/domains?teamId=${teamId}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${vercelToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: wwwDomain,
      }),
    })

    if (!wwwDomainResponse.ok) {
      const errorText = await wwwDomainResponse.text()
      console.error("Vercel API Error (www domain):", wwwDomainResponse.status, wwwDomainResponse.statusText, errorText)
      return NextResponse.json(
        { error: `Vercel API error for www domain: ${wwwDomainResponse.status}` },
        { status: 502 },
      )
    }

    const wwwDomainData = await wwwDomainResponse.json()
    results.push({ domain: wwwDomain, response: wwwDomainData })

    return NextResponse.json({
      success: true,
      domain,
      results,
    })
  } catch (error) {
    console.error("Error adding domains to Vercel:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
