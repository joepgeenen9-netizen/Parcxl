import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase"
import AdminDashboard from "@/admin-dashboard"

export default async function AdminPage() {
  const supabase = createServerClient()

  try {
    // Check authentication
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      console.log("No authenticated user, redirecting to login")
      redirect("/login")
    }

    // Check if user is admin using a simple query
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

    if (profile.user_type !== "admin") {
      console.log("User is not admin, redirecting to customer")
      redirect("/customer")
    }

    return <AdminDashboard />
  } catch (error) {
    console.error("Error in admin page:", error)
    redirect("/login")
  }
}
