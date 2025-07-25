import { cookies } from "next/headers"
import { redirect, notFound } from "next/navigation"
import { createServerClient } from "@supabase/ssr"
import { WooCommerceSetupClient } from "./woocommerce-setup-client"

interface PageProps {
  params: {
    id: string
  }
}

export default async function WooCommerceIntegrationPage({ params }: PageProps) {
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

  // Get client details to show client name
  const { data: client, error: clientError } = await supabase
    .from("fc_clients")
    .select("company_name")
    .eq("id", params.id)
    .eq("tenant_id", tenant.id)
    .single()

  if (clientError || !client) {
    notFound()
  }

  return <WooCommerceSetupClient tenant={tenant} user={user} clientId={params.id} clientName={client.company_name} />
}
