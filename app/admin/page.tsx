import { createServerClient } from "@/lib/supabase"
import { redirect } from "next/navigation"
import AdminDashboard from "@/admin-dashboard"

export default async function AdminPage() {
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

    // Check if user is admin
    if (profile.user_type !== "admin") {
      redirect("/customer")
    }

    return <AdminDashboard />
  } catch (error) {
    console.error("Admin page error:", error)
    redirect("/login")
  }
}
