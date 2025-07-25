import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"
import { SubdomainSetupClient } from "./subdomain-setup-client"

interface PageProps {
  searchParams: {
    clientId?: string
  }
}

export default async function Step2Page({ searchParams }: PageProps) {
  const { clientId } = searchParams

  if (!clientId) {
    redirect("/dashboard/fc/klanten/nieuw")
  }

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

    // Get client information
    const { data: client, error: clientError } = await supabase
      .from("fc_clients")
      .select("id, company_name, tenant_id, status")
      .eq("id", clientId)
      .single()

    if (clientError || !client) {
      console.error("Error fetching client:", clientError)
      redirect("/dashboard/fc/klanten/nieuw")
    }

    // Get tenant information from cookie first
    let tenant = null
    const tenantContextCookie = cookieStore.get("tenant-context")

    if (tenantContextCookie?.value) {
      try {
        tenant = JSON.parse(tenantContextCookie.value)
      } catch (error) {
        console.error("Error parsing tenant context from cookie:", error)
      }
    }

    // If no tenant from cookie, get from database
    if (!tenant) {
      const { data: tenantData, error: tenantError } = await supabase
        .from("tenants")
        .select("id, name, type, domain_name")
        .eq("id", client.tenant_id)
        .single()

      if (tenantError || !tenantData) {
        console.error("Error fetching tenant:", tenantError)
        redirect("/dashboard/fc/klanten/nieuw")
      }

      tenant = {
        id: tenantData.id,
        name: tenantData.name,
        type: tenantData.type,
        domain_name: tenantData.domain_name,
      }
    }

    return <SubdomainSetupClient client={client} tenant={tenant} />
  } catch (error) {
    console.error("Error in Step2Page:", error)
    redirect("/dashboard/fc/klanten/nieuw")
  }
}
