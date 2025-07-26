import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase-server"
import AdminDashboard from "@/admin-dashboard"

export default async function AdminPage() {
  const supabase = createServerClient()

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      redirect("/login")
    }

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("user_type")
      .eq("id", session.user.id)
      .maybeSingle()

    if (error || !profile) {
      console.error("Profile fetch error:", error)
      redirect("/login")
    }

    if (profile.user_type !== "admin") {
      redirect("/customer")
    }

    return <AdminDashboard />
  } catch (error) {
    console.error("Admin page error:", error)
    redirect("/login")
  }
}
