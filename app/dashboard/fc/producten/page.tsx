import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { createServerClient } from "@supabase/ssr"
import { FCLayout } from "../_components/fc-layout"
import { ProductenPageClient } from "./producten-page-client"
import { getProductsWithClients, getProductStats } from "./actions"

export default async function ProductenPage() {
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

  // Get products with client information
  const { data: products, error: productsError } = await getProductsWithClients(tenant.id)

  if (productsError) {
    console.error("Error fetching products:", productsError)
  }

  // Get product statistics
  const { data: stats, error: statsError } = await getProductStats(tenant.id)

  if (statsError) {
    console.error("Error fetching stats:", statsError)
  }

  return (
    <FCLayout tenant={tenant} user={user} searchPlaceholder="Zoek producten...">
      <ProductenPageClient
        products={products || []}
        stats={stats || { totalProducts: 0, lowStockProducts: 0, newProductsLast30Days: 0, totalClients: 0 }}
      />
    </FCLayout>
  )
}
