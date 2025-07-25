import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { createServerClient } from "@supabase/ssr"
import { FCLayout } from "../../../_components/fc-layout"
import { EditProductPageClient } from "./edit-product-page-client"
import { getProductById } from "../actions"

export default async function EditProductPage({ params }: { params: { id: string } }) {
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

  // Get product details
  const { data: product, error: productError } = await getProductById(tenant.id, params.id)

  if (productError || !product) {
    redirect("/dashboard/fc/producten")
  }

  return (
    <FCLayout tenant={tenant} user={user} searchPlaceholder="Zoek producten...">
      <EditProductPageClient product={product} />
    </FCLayout>
  )
}
