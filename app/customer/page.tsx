import { redirect } from "next/navigation"
import { createServerSupabaseClient } from "@/lib/supabase-server"
import CustomerDashboard from "@/customer-dashboard"

export default async function CustomerPage() {
  const supabase = await createServerSupabaseClient()

  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      console.log("No authenticated user, redirecting to login")
      redirect("/login")
    }

    // Check if user exists in profiles
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("user_type, first_name, last_name")
      .eq("id", user.id)
      .maybeSingle()

    if (profileError) {
      console.error("Profile fetch error:", profileError)
      redirect("/login")
    }

    if (!profile) {
      console.log("No profile found for user")
      redirect("/login")
    }

    // Admin users should go to admin dashboard
    if (profile.user_type === "admin") {
      console.log("User is admin, redirecting to admin")
      redirect("/admin")
    }

    return <CustomerDashboard />
  } catch (error) {
    console.error("Error in customer page:", error)
    redirect("/login")
  }
}
