"use server"

import { createServerClient } from "@/lib/supabase"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

interface SaveIntegrationResult {
  success: boolean
  error?: string
  details?: string
  errorCode?: string
}

export async function testCCVConnection(domain: string, apiKey: string, apiSecret: string) {
  try {
    // Normalize domain - ensure it starts with https://
    let normalizedDomain = domain.trim()
    if (!normalizedDomain.startsWith("http://") && !normalizedDomain.startsWith("https://")) {
      normalizedDomain = "https://" + normalizedDomain
    }

    // Remove trailing slashes
    normalizedDomain = normalizedDomain.replace(/\/+$/, "")

    // Validate URL format
    try {
      new URL(normalizedDomain)
    } catch (error) {
      return {
        success: false,
        error: "Ongeldig domein formaat. Gebruik bijvoorbeeld: https://jouwshop.ccvshop.nl",
      }
    }

    const method = "GET"
    const uri = "/api/rest/v1/orders?limit=1"
    const data = ""
    const timestamp = new Date().toISOString()

    // Create hash string: API_KEY|METHOD|URI|DATA|TIMESTAMP
    const hashString = `${apiKey}|${method}|${uri}|${data}|${timestamp}`

    // Create HMAC SHA512 hash
    const encoder = new TextEncoder()
    const keyData = encoder.encode(apiSecret)
    const messageData = encoder.encode(hashString)

    const cryptoKey = await crypto.subtle.importKey("raw", keyData, { name: "HMAC", hash: "SHA-512" }, false, ["sign"])

    const signature = await crypto.subtle.sign("HMAC", cryptoKey, messageData)
    const hashArray = Array.from(new Uint8Array(signature))
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")

    // Make API request
    const response = await fetch(`${normalizedDomain}${uri}`, {
      method: method,
      headers: {
        "x-date": timestamp,
        "x-hash": hashHex,
        "x-public": apiKey,
        Accept: "application/json",
        "User-Agent": "Packway-Integration/1.0",
      },
      signal: AbortSignal.timeout(15000), // 15 second timeout
    })

    if (!response.ok) {
      if (response.status === 401) {
        return {
          success: false,
          error: "Authenticatie mislukt. Controleer je API Key en Secret.",
        }
      } else if (response.status === 403) {
        return {
          success: false,
          error: "Toegang geweigerd. Controleer de API permissies.",
        }
      } else if (response.status === 404) {
        return {
          success: false,
          error: "API endpoint niet gevonden. Controleer je shop domein.",
        }
      } else {
        return {
          success: false,
          error: `HTTP ${response.status}: ${response.statusText}`,
        }
      }
    }

    const responseText = await response.text()

    // Check if response starts with {"items" as expected
    if (responseText.startsWith('{"items"')) {
      return {
        success: true,
        message: "Verbinding succesvol getest!",
      }
    } else {
      return {
        success: false,
        error: "Onverwacht API response formaat. Controleer je API instellingen.",
      }
    }
  } catch (error: any) {
    console.error("CCV API test error:", error)

    if (error.name === "AbortError") {
      return {
        success: false,
        error: "Verbinding time-out. Controleer je internetverbinding en probeer opnieuw.",
      }
    }

    return {
      success: false,
      error: error.message || "Onbekende fout bij het testen van de verbinding.",
    }
  }
}

export async function saveCCVIntegration(
  tenantId: string,
  clientId: string,
  domain: string,
  apiKey: string,
  apiSecret: string,
): Promise<SaveIntegrationResult> {
  console.log("🚀 Starting CCV integration save process...")
  console.log("📊 Input parameters:", {
    tenantId: tenantId?.substring(0, 8) + "...",
    clientId: clientId?.substring(0, 8) + "...",
    domain: domain?.substring(0, 30) + "...",
    apiKeyLength: apiKey?.length || 0,
    apiSecretLength: apiSecret?.length || 0,
  })

  console.log("🔍 Environment check:", {
    hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasSupabaseAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    hasSupabaseServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    nodeEnv: process.env.NODE_ENV,
  })

  try {
    // Step 1: Input validation
    console.log("✅ Step 1: Validating input parameters...")

    if (!tenantId || typeof tenantId !== "string" || tenantId.trim().length === 0) {
      const error = "❌ VALIDATION_ERROR: Tenant ID is verplicht en moet een geldige string zijn"
      console.error(error)
      return {
        success: false,
        error: "Tenant ID ontbreekt of is ongeldig",
        details: "De tenant identificatie is niet correct doorgegeven. Dit is een technisch probleem.",
        errorCode: "INVALID_TENANT_ID",
      }
    }

    if (!clientId || typeof clientId !== "string" || clientId.trim().length === 0) {
      const error = "❌ VALIDATION_ERROR: Client ID is verplicht en moet een geldige string zijn"
      console.error(error)
      return {
        success: false,
        error: "Client ID ontbreekt of is ongeldig",
        details: "De client identificatie is niet correct doorgegeven. Dit is een technisch probleem.",
        errorCode: "INVALID_CLIENT_ID",
      }
    }

    if (!domain || typeof domain !== "string" || domain.trim().length === 0) {
      const error = "❌ VALIDATION_ERROR: Domein is verplicht"
      console.error(error)
      return {
        success: false,
        error: "Shop domein is verplicht",
        details: "Voer het volledige domein van je CCV Shop in (bijv. https://jouwshop.ccvshop.nl)",
        errorCode: "MISSING_DOMAIN",
      }
    }

    if (!apiKey || typeof apiKey !== "string" || apiKey.trim().length === 0) {
      const error = "❌ VALIDATION_ERROR: API Key is verplicht"
      console.error(error)
      return {
        success: false,
        error: "API Key is verplicht",
        details: "Voer je CCV Shop API Key (Public Key) in",
        errorCode: "MISSING_API_KEY",
      }
    }

    if (!apiSecret || typeof apiSecret !== "string" || apiSecret.trim().length === 0) {
      const error = "❌ VALIDATION_ERROR: API Secret is verplicht"
      console.error(error)
      return {
        success: false,
        error: "API Secret is verplicht",
        details: "Voer je CCV Shop API Secret (Private Key) in",
        errorCode: "MISSING_API_SECRET",
      }
    }

    console.log("✅ Input validation passed")

    // Step 2: Environment variables check
    console.log("✅ Step 2: Checking environment variables...")

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      const error = "❌ ENV_ERROR: NEXT_PUBLIC_SUPABASE_URL is missing"
      console.error(error)
      return {
        success: false,
        error: "Database configuratie ontbreekt",
        details: "NEXT_PUBLIC_SUPABASE_URL environment variable is niet geconfigureerd",
        errorCode: "MISSING_SUPABASE_URL",
      }
    }

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const error = "❌ ENV_ERROR: SUPABASE_SERVICE_ROLE_KEY is missing"
      console.error(error)
      return {
        success: false,
        error: "Database service key ontbreekt",
        details: "SUPABASE_SERVICE_ROLE_KEY environment variable is niet geconfigureerd",
        errorCode: "MISSING_SERVICE_KEY",
      }
    }

    console.log("✅ Environment variables check passed")

    // Step 3: Normalize and validate domain
    console.log("✅ Step 3: Normalizing domain...")
    let normalizedDomain = domain.trim()
    if (!normalizedDomain.startsWith("http://") && !normalizedDomain.startsWith("https://")) {
      normalizedDomain = "https://" + normalizedDomain
    }
    normalizedDomain = normalizedDomain.replace(/\/+$/, "")

    try {
      new URL(normalizedDomain)
      console.log("✅ Domain validation passed:", normalizedDomain)
    } catch (error) {
      const errorMsg = "❌ DOMAIN_ERROR: Ongeldig domein formaat"
      console.error(errorMsg, error)
      return {
        success: false,
        error: "Ongeldig domein formaat",
        details: "Gebruik het volledige domein inclusief https:// (bijv. https://jouwshop.ccvshop.nl)",
        errorCode: "INVALID_DOMAIN_FORMAT",
      }
    }

    // Step 4: Validate API credentials format
    console.log("✅ Step 4: Validating API credentials format...")
    if (apiKey.trim().length < 8) {
      const error = "❌ API_KEY_ERROR: API Key te kort"
      console.error(error)
      return {
        success: false,
        error: "API Key lijkt ongeldig",
        details: "De API Key is te kort. Controleer of je de juiste key hebt gekopieerd uit CCV Shop.",
        errorCode: "INVALID_API_KEY_LENGTH",
      }
    }

    if (apiSecret.trim().length < 16) {
      const error = "❌ API_SECRET_ERROR: API Secret te kort"
      console.error(error)
      return {
        success: false,
        error: "API Secret lijkt ongeldig",
        details: "De API Secret is te kort. Controleer of je de juiste secret hebt gekopieerd uit CCV Shop.",
        errorCode: "INVALID_API_SECRET_LENGTH",
      }
    }

    console.log("✅ API credentials format validation passed")

    // Step 5: Initialize Supabase client with server-side client
    console.log("✅ Step 5: Initializing database connection...")
    let supabase

    try {
      supabase = createServerClient()
      console.log("✅ Server-side Supabase client created successfully")
    } catch (supabaseError: any) {
      const error = `❌ DATABASE_ERROR: Supabase client initialization failed: ${supabaseError.message}`
      console.error(error, supabaseError)
      return {
        success: false,
        error: "Database verbinding mislukt",
        details: `Kon geen verbinding maken met de database: ${supabaseError.message}`,
        errorCode: "DATABASE_CONNECTION_FAILED",
      }
    }

    // Step 6: Validate tenant exists
    console.log("✅ Step 6: Validating tenant exists...")
    const { data: tenantData, error: tenantError } = await supabase
      .from("tenants")
      .select("id, status")
      .eq("id", tenantId.trim())
      .single()

    if (tenantError) {
      const error = `❌ TENANT_VALIDATION_ERROR: ${tenantError.message}`
      console.error(error, tenantError)
      return {
        success: false,
        error: "Tenant validatie mislukt",
        details: `Database fout bij ophalen tenant: ${tenantError.message} (Code: ${tenantError.code})`,
        errorCode: "TENANT_VALIDATION_FAILED",
      }
    }

    if (!tenantData) {
      const error = "❌ TENANT_NOT_FOUND: Tenant niet gevonden"
      console.error(error)
      return {
        success: false,
        error: "Tenant niet gevonden",
        details: "Je hebt geen toegang tot deze tenant of de tenant bestaat niet meer.",
        errorCode: "TENANT_NOT_FOUND",
      }
    }

    console.log("✅ Tenant validation passed:", tenantData.id)

    // Step 7: Validate client exists and belongs to tenant
    console.log("✅ Step 7: Validating client exists and belongs to tenant...")
    const { data: clientData, error: clientError } = await supabase
      .from("fc_clients")
      .select("id, tenant_id, status")
      .eq("id", clientId.trim())
      .eq("tenant_id", tenantId.trim())
      .single()

    if (clientError) {
      const error = `❌ CLIENT_VALIDATION_ERROR: ${clientError.message}`
      console.error(error, clientError)
      return {
        success: false,
        error: "Client validatie mislukt",
        details: `Database fout bij ophalen client: ${clientError.message} (Code: ${clientError.code})`,
        errorCode: "CLIENT_VALIDATION_FAILED",
      }
    }

    if (!clientData) {
      const error = "❌ CLIENT_NOT_FOUND: Client niet gevonden of geen toegang"
      console.error(error)
      return {
        success: false,
        error: "Client niet gevonden",
        details: "De client bestaat niet of je hebt geen toegang tot deze client.",
        errorCode: "CLIENT_NOT_FOUND",
      }
    }

    console.log("✅ Client validation passed:", clientData.id)

    // Step 8: Check for existing CCV integration
    console.log("✅ Step 8: Checking for existing CCV integration...")
    const { data: existingIntegration, error: existingError } = await supabase
      .from("fc_client_integrations")
      .select("id, platform, active, created_at")
      .eq("tenant_id", tenantId.trim())
      .eq("client_id", clientId.trim())
      .eq("platform", "ccv")
      .maybeSingle()

    if (existingError) {
      const error = `❌ EXISTING_INTEGRATION_CHECK_ERROR: ${existingError.message}`
      console.error(error, existingError)
      return {
        success: false,
        error: "Fout bij controleren bestaande integratie",
        details: `Database fout: ${existingError.message} (Code: ${existingError.code})`,
        errorCode: "EXISTING_INTEGRATION_CHECK_FAILED",
      }
    }

    // Step 9: Save or update integration
    const currentTimestamp = new Date().toISOString()

    if (existingIntegration) {
      console.log("🔄 Found existing CCV integration, updating...", existingIntegration.id)

      const { data: updateData, error: updateError } = await supabase
        .from("fc_client_integrations")
        .update({
          domain: normalizedDomain,
          api_key: apiKey.trim(),
          api_secret: apiSecret.trim(),
          active: true,
          updated_at: currentTimestamp,
        })
        .eq("id", existingIntegration.id)
        .select()

      if (updateError) {
        const error = `❌ INTEGRATION_UPDATE_ERROR: ${updateError.message}`
        console.error(error, updateError)

        let userFriendlyError = "Fout bij bijwerken integratie"
        let details = `Database fout: ${updateError.message}`

        if (updateError.code === "42501") {
          userFriendlyError = "Onvoldoende rechten"
          details = "Je hebt geen rechten om deze integratie bij te werken. Neem contact op met de beheerder."
        } else if (updateError.code === "23503") {
          userFriendlyError = "Referentie fout"
          details = "Er is een probleem met de database referenties. Dit is een technisch probleem."
        }

        return {
          success: false,
          error: userFriendlyError,
          details: `${details} (Code: ${updateError.code})`,
          errorCode: "INTEGRATION_UPDATE_FAILED",
        }
      }

      if (!updateData || updateData.length === 0) {
        const error = "❌ UPDATE_NO_DATA: Geen data geretourneerd na update"
        console.error(error)
        return {
          success: false,
          error: "Update mislukt",
          details: "De integratie werd niet correct bijgewerkt. Geen data geretourneerd van database.",
          errorCode: "UPDATE_NO_DATA_RETURNED",
        }
      }

      console.log("✅ CCV integration updated successfully:", updateData[0].id)
    } else {
      console.log("➕ Creating new CCV integration...")

      const integrationData = {
        tenant_id: tenantId.trim(),
        client_id: clientId.trim(),
        platform: "ccv",
        domain: normalizedDomain,
        api_key: apiKey.trim(),
        api_secret: apiSecret.trim(),
        active: true,
        created_at: currentTimestamp,
        updated_at: currentTimestamp,
      }

      console.log("📝 Integration data prepared:", {
        ...integrationData,
        api_key: `${apiKey.substring(0, 4)}***`,
        api_secret: `${apiSecret.substring(0, 4)}***`,
      })

      const { data: insertData, error: insertError } = await supabase
        .from("fc_client_integrations")
        .insert(integrationData)
        .select()

      if (insertError) {
        const error = `❌ INTEGRATION_INSERT_ERROR: ${insertError.message}`
        console.error(error, insertError)

        let userFriendlyError = "Fout bij opslaan integratie"
        let details = `Database fout: ${insertError.message}`
        let errorCode = "INTEGRATION_INSERT_FAILED"

        // Provide specific error messages based on error type
        if (insertError.code === "23505") {
          userFriendlyError = "Integratie bestaat al"
          details = "Er bestaat al een CCV integratie voor deze client. Probeer de pagina te verversen."
          errorCode = "DUPLICATE_INTEGRATION"
        } else if (insertError.code === "23503") {
          userFriendlyError = "Referentie fout"
          details = "Client of Tenant referentie is ongeldig. Dit is een technisch probleem."
          errorCode = "FOREIGN_KEY_VIOLATION"
        } else if (insertError.code === "42501") {
          userFriendlyError = "Onvoldoende rechten"
          details = "Je hebt geen rechten om integraties op te slaan. Neem contact op met de beheerder."
          errorCode = "INSUFFICIENT_PERMISSIONS"
        } else if (insertError.code === "42601") {
          userFriendlyError = "SQL syntax fout"
          details = "Er is een technisch probleem met de database query. Neem contact op met support."
          errorCode = "SQL_SYNTAX_ERROR"
        } else if (insertError.code === "23514") {
          userFriendlyError = "Data validatie fout"
          details = "Een of meer velden bevatten ongeldige data. Controleer alle invoervelden."
          errorCode = "CHECK_CONSTRAINT_VIOLATION"
        }

        return {
          success: false,
          error: userFriendlyError,
          details: `${details} (Code: ${insertError.code})`,
          errorCode,
        }
      }

      if (!insertData || insertData.length === 0) {
        const error = "❌ INSERT_NO_DATA: Geen data geretourneerd na insert"
        console.error(error)
        return {
          success: false,
          error: "Opslaan mislukt",
          details: "De integratie werd niet correct opgeslagen. Geen data geretourneerd van database.",
          errorCode: "INSERT_NO_DATA_RETURNED",
        }
      }

      console.log("✅ CCV integration created successfully:", insertData[0].id)
    }

    console.log("🎉 CCV integration save process completed successfully")

    // Revalidate the client page to show the new integration
    revalidatePath(`/dashboard/fc/klanten/${clientId}`)

    return {
      success: true,
    }
  } catch (error: any) {
    const errorMsg = `❌ UNEXPECTED_ERROR: ${error.message || "Unknown error"}`
    console.error(errorMsg, error)
    console.error("Error stack:", error.stack)

    return {
      success: false,
      error: "Onverwachte fout",
      details: `Er is een onverwachte fout opgetreden: ${error.message || "Onbekende fout"}. Stack: ${error.stack?.substring(0, 200) || "Geen stack trace"}`,
      errorCode: "UNEXPECTED_ERROR",
    }
  }
}

// Wrapper function that handles the redirect
export async function saveCCVIntegrationWithRedirect(
  tenantId: string,
  clientId: string,
  domain: string,
  apiKey: string,
  apiSecret: string,
) {
  const result = await saveCCVIntegration(tenantId, clientId, domain, apiKey, apiSecret)

  if (result.success) {
    redirect(`/dashboard/fc/klanten/${clientId}`)
  } else {
    // Return the error instead of throwing it to avoid server component render errors
    throw new Error(JSON.stringify(result))
  }
}
