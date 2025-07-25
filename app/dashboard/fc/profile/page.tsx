import { getCurrentUser } from "./actions"
import { ProfilePageClient } from "./profile-page-client"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"

export default async function ProfilePage() {
  try {
    console.log("ProfilePage: Starting profile page load...")

    const cookieStore = await cookies()
    const tenantContextCookie = cookieStore.get("tenant-context")

    console.log("ProfilePage: Tenant context cookie:", tenantContextCookie?.value)

    if (!tenantContextCookie?.value) {
      console.log("ProfilePage: No tenant context cookie found, redirecting to login")
      redirect("/login")
    }

    let tenantContext
    try {
      tenantContext = JSON.parse(tenantContextCookie.value)
      console.log("ProfilePage: Parsed tenant context:", tenantContext)
    } catch (error) {
      console.error("ProfilePage: Error parsing tenant context:", error)
      redirect("/login")
    }

    console.log("ProfilePage: Calling getCurrentUser...")
    const result = await getCurrentUser()
    console.log("ProfilePage: getCurrentUser result:", result)

    if (!result.success) {
      console.log("ProfilePage: getCurrentUser failed:", result.error)
      redirect("/login")
    }

    if (!result.user) {
      console.log("ProfilePage: No user found in result")
      redirect("/login")
    }

    console.log("ProfilePage: Successfully loaded user, rendering ProfilePageClient")
    return <ProfilePageClient user={result.user} tenant={tenantContext} />
  } catch (error) {
    console.error("ProfilePage: Unexpected error:", error)
    redirect("/login")
  }
}
