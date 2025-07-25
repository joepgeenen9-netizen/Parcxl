import { cookies } from "next/headers"
import { redirect, notFound } from "next/navigation"
import { createServerClient } from "@supabase/ssr"
import { CCVProductPageClient } from "./ccv-product-page-client"
import { getClientDetails } from "../../actions"
import { getAllCCVIntegrations } from "./actions"

interface PageProps {
  params: {
    id: string
  }
}

export default async function CCVProductPage({ params }: PageProps) {
  const cookieStore = await cookies()

  // Get tenant context from cookie
  const tenantContextCookie = cookieStore.get("tenant-context")
  if (!tenantContextCookie?.value) {
    redirect("/login")
  }

  let tenant
  try {
    tenant = JSON.parse(tenantContextCookie.value)
  } catch (error) {
    console.error("Error parsing tenant context:", error)
    redirect("/login")
  }

  if (!tenant || tenant.type !== "FC") {
    redirect("/login")
  }

  // Create Supabase client
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

  // Get tenant user
  const { data: tenantUsers, error } = await supabase
    .from("tenant_users")
    .select("*")
    .eq("tenant_id", tenant.id)
    .limit(1)

  if (error || !tenantUsers || tenantUsers.length === 0) {
    redirect("/login")
  }

  const user = tenantUsers[0]

  // Get client details
  const { data: clientDetails, error: clientError } = await getClientDetails(params.id, tenant.id)

  if (clientError || !clientDetails) {
    notFound()
  }

  // Get all CCV integrations for this client using the correct tenant ID
  const { data: ccvIntegrations, error: integrationError } = await getAllCCVIntegrations(params.id, tenant.id)

  if (integrationError) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium">Fout bij laden CCV integraties</h3>
          <p className="text-red-600 text-sm mt-1">{integrationError}</p>
        </div>
      </div>
    )
  }

  if (!ccvIntegrations || ccvIntegrations.length === 0) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-yellow-800 font-medium">Geen CCV integratie gevonden</h3>
          <p className="text-yellow-600 text-sm mt-1">
            Er is nog geen CCV Shop gekoppeld aan deze klant. Ga naar de integraties pagina om een CCV Shop te koppelen.
          </p>
        </div>
      </div>
    )
  }

  return (
    <CCVProductPageClient
      tenant={tenant}
      user={user}
      clientDetails={clientDetails}
      clientId={params.id}
      ccvIntegrations={ccvIntegrations || []}
    />
  )
}
