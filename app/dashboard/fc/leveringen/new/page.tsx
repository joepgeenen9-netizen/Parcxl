import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { createServerClient } from "@supabase/ssr"
import { FCLayout } from "../../_components/fc-layout"
import { NewDeliveryPageClient } from "./new-delivery-page-client"

export default async function NewDeliveryPage() {
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

  // Get clients for dropdown
  const { data: clients, error: clientsError } = await supabase
    .from("fc_clients")
    .select("id, company_name")
    .eq("tenant_id", tenant.id)
    .eq("status", "active")
    .order("company_name")

  // Get storage locations
  const { data: locations, error: locationsError } = await supabase
    .from("locaties")
    .select("id, naam")
    .eq("actief", true)
    .order("naam")

  return (
    <FCLayout tenant={tenant} user={user} searchPlaceholder="Zoek leveringen...">
      <NewDeliveryPageClient clients={clients || []} locations={locations || []} tenant={tenant} user={user} />
    </FCLayout>
  )
}
