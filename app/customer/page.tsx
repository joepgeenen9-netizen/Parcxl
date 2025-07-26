import { createServerClient } from "@/lib/supabase"
import { redirect } from "next/navigation"
import CustomerDashboard from "@/customer-dashboard"

export default async function CustomerPage() {
  const supabase = createServerClient()

  try {
    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      redirect("/login")
    }

    // Get user profile to check role
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("user_type")
      .eq("id", user.id)
      .maybeSingle()

    if (profileError || !profile) {
      redirect("/login")
    }

    // Allow both customer and admin to access customer dashboard
    // Admin can view customer dashboard for testing/support purposes
    return <CustomerDashboard />
  } catch (error) {
    console.error("Customer page error:", error)
    redirect("/login")
  }
}
