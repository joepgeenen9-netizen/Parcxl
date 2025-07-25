"use server"

import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

interface SubdomainSetupData {
  subdomain: string
  clientId: string
  tenantId: string
  tenantDomain?: string
}

interface VercelDomainResponse {
  name: string
  apexName: string
  projectId: string
  redirect?: string
  redirectStatusCode?: number
  gitBranch?: string
  updatedAt?: number
  createdAt?: number
  verified: boolean
  verification?: Array<{
    type: string
    domain: string
    value: string
    reason: string
  }>
}

interface ClientDomainRecord {
  id: string
  tenant_id: string
  client_id: string
  subdomain: string
  full_domain: string
  vercel_project_id: string | null
  dns_configured: boolean
  ssl_configured: boolean
  status: string
  created_at: string
  updated_at: string
}

// Validation functions
function validateSubdomain(subdomain: string): { valid: boolean; error?: string } {
  if (!subdomain || typeof subdomain !== "string") {
    return { valid: false, error: "Subdomain is verplicht" }
  }

  if (subdomain.length < 2 || subdomain.length > 63) {
    return { valid: false, error: "Subdomain moet tussen 2 en 63 karakters zijn" }
  }

  const subdomainRegex = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/
  if (!subdomainRegex.test(subdomain)) {
    return {
      valid: false,
      error:
        "Subdomain mag alleen kleine letters, cijfers en koppeltekens bevatten en moet beginnen en eindigen met een letter of cijfer",
    }
  }

  return { valid: true }
}

function validateDomain(domain: string): { valid: boolean; error?: string } {
  if (!domain || typeof domain !== "string") {
    return { valid: false, error: "Domein is verplicht" }
  }

  if (domain.length < 5 || domain.length > 253) {
    return { valid: false, error: "Domein moet tussen 5 en 253 karakters zijn" }
  }

  const domainRegex = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/
  if (!domainRegex.test(domain)) {
    return { valid: false, error: "Ongeldig domein formaat" }
  }

  return { valid: true }
}

function validateUUID(uuid: string): { valid: boolean; error?: string } {
  if (!uuid || typeof uuid !== "string") {
    return { valid: false, error: "UUID is verplicht" }
  }

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(uuid)) {
    return { valid: false, error: "Ongeldig UUID formaat" }
  }

  return { valid: true }
}

export async function checkSubdomainAvailability(subdomain: string, tenantId: string) {
  try {
    console.log("Checking subdomain availability:", { subdomain, tenantId })

    // Validate inputs
    const subdomainValidation = validateSubdomain(subdomain)
    if (!subdomainValidation.valid) {
      return {
        success: false,
        available: false,
        error: subdomainValidation.error,
      }
    }

    const tenantIdValidation = validateUUID(tenantId)
    if (!tenantIdValidation.valid) {
      return {
        success: false,
        available: false,
        error: "Ongeldige tenant ID",
      }
    }

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

    // Check if subdomain already exists for this tenant
    const { data: existingDomain, error } = await supabase
      .from("fc_client_domains")
      .select("id, subdomain, full_domain")
      .eq("tenant_id", tenantId)
      .eq("subdomain", subdomain)
      .maybeSingle()

    if (error && error.code !== "PGRST116") {
      // PGRST116 is "not found" which is what we want
      console.error("Database error checking subdomain availability:", error)
      return {
        success: false,
        available: false,
        error: `Database fout: ${error.message}`,
      }
    }

    const available = !existingDomain
    console.log("Subdomain availability check result:", { available, existingDomain })

    return {
      success: true,
      available,
      error: available ? null : `Subdomain '${subdomain}' is al in gebruik`,
    }
  } catch (error) {
    console.error("Unexpected error checking subdomain:", error)
    return {
      success: false,
      available: false,
      error: "Er is een onverwachte fout opgetreden bij het controleren van de subdomain beschikbaarheid",
    }
  }
}

export async function setupClientSubdomain(data: SubdomainSetupData) {
  try {
    console.log("Setting up subdomain with data:", data)

    // Comprehensive input validation
    const subdomainValidation = validateSubdomain(data.subdomain)
    if (!subdomainValidation.valid) {
      return {
        success: false,
        error: subdomainValidation.error,
      }
    }

    const clientIdValidation = validateUUID(data.clientId)
    if (!clientIdValidation.valid) {
      return {
        success: false,
        error: "Ongeldige klant ID",
      }
    }

    const tenantIdValidation = validateUUID(data.tenantId)
    if (!tenantIdValidation.valid) {
      return {
        success: false,
        error: "Ongeldige tenant ID",
      }
    }

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

    // Verify that the client exists and belongs to the tenant
    console.log("Verifying client exists:", { clientId: data.clientId, tenantId: data.tenantId })
    const { data: client, error: clientError } = await supabase
      .from("fc_clients")
      .select("id, tenant_id, company_name")
      .eq("id", data.clientId)
      .eq("tenant_id", data.tenantId)
      .single()

    if (clientError || !client) {
      console.error("Client verification failed:", clientError)
      return {
        success: false,
        error: "Klant niet gevonden of behoort niet tot deze tenant",
      }
    }

    console.log("Client verification successful:", client)

    // Get tenant domain from multiple sources
    let domainName = data.tenantDomain

    if (!domainName) {
      const tenantContextCookie = cookieStore.get("tenant-context")
      if (tenantContextCookie?.value) {
        try {
          const tenantContext = JSON.parse(tenantContextCookie.value)
          domainName = tenantContext.domain_name || tenantContext.domain
          console.log("Got domain from tenant context cookie:", domainName)
        } catch (error) {
          console.error("Error parsing tenant context from cookie:", error)
        }
      }
    }

    // If still no domain, try to get from database
    if (!domainName) {
      console.log("Fetching tenant domain from database")
      const { data: tenant, error: tenantError } = await supabase
        .from("tenants")
        .select("domain_name, name")
        .eq("id", data.tenantId)
        .single()

      if (tenant?.domain_name) {
        domainName = tenant.domain_name
        console.log("Got domain from tenants table:", domainName)
      } else if (tenant?.name) {
        // Generate domain from tenant name as fallback
        domainName = `${tenant.name.toLowerCase().replace(/[^a-z0-9]/g, "")}.packway.nl`
        console.log("Generated domain from tenant name:", domainName)
      } else {
        console.warn("Could not determine tenant domain, using default")
        domainName = "packway.nl"
      }
    }

    const fullDomain = `${data.subdomain}.${domainName}`
    console.log("Using full domain:", fullDomain)

    // Validate the constructed domain
    const domainValidation = validateDomain(fullDomain)
    if (!domainValidation.valid) {
      return {
        success: false,
        error: `Ongeldig domein: ${domainValidation.error}`,
      }
    }

    // Final availability check
    const availabilityCheck = await checkSubdomainAvailability(data.subdomain, data.tenantId)
    if (!availabilityCheck.success || !availabilityCheck.available) {
      return {
        success: false,
        error: availabilityCheck.error || "Subdomain is niet meer beschikbaar",
      }
    }

    // Vercel configuration (optional)
    const vercelProjectId = process.env.VERCEL_PROJECT_ID
    const vercelTeamId = process.env.VERCEL_TEAM_ID
    const vercelToken = process.env.VERCEL_TOKEN

    let vercelConfigured = false

    if (vercelProjectId && vercelTeamId && vercelToken) {
      try {
        console.log("Configuring Vercel domain:", fullDomain)
        const vercelDomainResponse = await fetch(
          `https://api.vercel.com/v9/projects/${vercelProjectId}/domains?teamId=${vercelTeamId}`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${vercelToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: fullDomain,
            }),
          },
        )

        if (vercelDomainResponse.ok) {
          const vercelResult = await vercelDomainResponse.json()
          console.log("Vercel domain configured successfully:", vercelResult)
          vercelConfigured = true

          // Configure DNS record
          try {
            const baseDomain = domainName
            const dnsResponse = await fetch(
              `https://api.vercel.com/v2/domains/${baseDomain}/records?teamId=${vercelTeamId}`,
              {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${vercelToken}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  type: "CNAME",
                  name: data.subdomain,
                  value: "cname.vercel-dns.com",
                  ttl: 14400,
                }),
              },
            )

            if (dnsResponse.ok) {
              console.log("DNS record configured successfully")
            } else {
              const errorText = await dnsResponse.text()
              console.warn("DNS configuration failed (non-critical):", errorText)
            }
          } catch (dnsError) {
            console.warn("DNS configuration error (non-critical):", dnsError)
          }
        } else {
          const errorText = await vercelDomainResponse.text()
          console.warn("Vercel domain configuration failed (non-critical):", errorText)
        }
      } catch (vercelError) {
        console.warn("Vercel configuration error (non-critical):", vercelError)
      }
    } else {
      console.log("Vercel configuration skipped - missing environment variables")
    }

    // Prepare domain record data with comprehensive validation
    const domainRecordData = {
      tenant_id: data.tenantId,
      client_id: data.clientId,
      subdomain: data.subdomain,
      full_domain: fullDomain,
      vercel_project_id: vercelProjectId || null,
      dns_configured: vercelConfigured,
      ssl_configured: false, // Will be configured automatically by Vercel
      status: "active" as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    console.log("Inserting domain record:", domainRecordData)

    // Insert domain record with detailed error handling
    const { data: domainRecord, error: dbError } = await supabase
      .from("fc_client_domains")
      .insert(domainRecordData)
      .select("*")
      .single()

    if (dbError) {
      console.error("Database error saving domain record:", {
        error: dbError,
        code: dbError.code,
        message: dbError.message,
        details: dbError.details,
        hint: dbError.hint,
        data: domainRecordData,
      })

      // Provide specific error messages based on error codes
      let errorMessage = "Fout bij het opslaan van domein configuratie"

      if (dbError.code === "23505") {
        if (dbError.message?.includes("unique_subdomain_per_tenant")) {
          errorMessage = "Dit subdomain is al in gebruik voor deze tenant"
        } else if (dbError.message?.includes("unique_full_domain")) {
          errorMessage = "Dit domein is al in gebruik"
        } else {
          errorMessage = "Domein configuratie bestaat al"
        }
      } else if (dbError.code === "23503") {
        if (dbError.message?.includes("fk_fc_client_domains_tenant")) {
          errorMessage = "Ongeldige tenant referentie"
        } else if (dbError.message?.includes("fk_fc_client_domains_client")) {
          errorMessage = "Ongeldige klant referentie"
        } else {
          errorMessage = "Ongeldige referentie in domein configuratie"
        }
      } else if (dbError.code === "23514") {
        if (dbError.message?.includes("valid_subdomain")) {
          errorMessage = "Ongeldig subdomain formaat"
        } else if (dbError.message?.includes("valid_full_domain")) {
          errorMessage = "Ongeldig domein formaat"
        } else {
          errorMessage = "Domein configuratie voldoet niet aan de validatieregels"
        }
      } else if (dbError.message) {
        errorMessage = `Database fout: ${dbError.message}`
      }

      return {
        success: false,
        error: errorMessage,
      }
    }

    if (!domainRecord) {
      console.error("Domain record insertion returned null")
      return {
        success: false,
        error: "Domein configuratie kon niet worden opgeslagen",
      }
    }

    console.log("Domain setup completed successfully:", domainRecord)

    return {
      success: true,
      domain: fullDomain,
      domainId: domainRecord.id,
      vercelConfigured,
      clientName: client.company_name,
    }
  } catch (error) {
    console.error("Unexpected error in setupClientSubdomain:", error)
    return {
      success: false,
      error: "Er is een onverwachte fout opgetreden bij het instellen van het subdomain",
    }
  }
}

export async function getClientInfo(clientId: string) {
  try {
    console.log("Fetching client info for:", clientId)

    const clientIdValidation = validateUUID(clientId)
    if (!clientIdValidation.valid) {
      return {
        success: false,
        error: "Ongeldige klant ID",
      }
    }

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

    const { data: client, error } = await supabase
      .from("fc_clients")
      .select("id, company_name, tenant_id, status")
      .eq("id", clientId)
      .single()

    if (error) {
      console.error("Error fetching client:", error)
      return {
        success: false,
        error: error.code === "PGRST116" ? "Klant niet gevonden" : `Database fout: ${error.message}`,
      }
    }

    if (!client) {
      return {
        success: false,
        error: "Klant niet gevonden",
      }
    }

    console.log("Client info fetched successfully:", client)

    return {
      success: true,
      client,
    }
  } catch (error) {
    console.error("Unexpected error fetching client:", error)
    return {
      success: false,
      error: "Er is een onverwachte fout opgetreden bij het ophalen van klant informatie",
    }
  }
}

// Wrapper function for the expected signature
export async function setupSubdomain(subdomain: string, clientId: string, tenantId: string) {
  // Get tenant domain from cookie
  const cookieStore = await cookies()
  const tenantContextCookie = cookieStore.get("tenant-context")

  let tenantDomain = undefined

  if (tenantContextCookie?.value) {
    try {
      const tenantContext = JSON.parse(tenantContextCookie.value)
      tenantDomain = tenantContext.domain_name || tenantContext.domain
      console.log("Got tenant domain from cookie for setupSubdomain:", tenantDomain)
    } catch (error) {
      console.error("Error parsing tenant context from cookie in setupSubdomain:", error)
    }
  }

  return await setupClientSubdomain({
    subdomain,
    clientId,
    tenantId,
    tenantDomain,
  })
}
