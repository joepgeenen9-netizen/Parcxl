import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase-server"
import CustomerDashboard from "@/customer-dashboard"

export default async function CustomerPage() {
  const supabase = createServerClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  const { data: profile } = await supabase.from("profiles").select("user_type").eq("id", session.user.id).single()

  if (!profile || profile.user_type !== "customer") {
    redirect("/admin")
  }

  return <CustomerDashboard />
}
