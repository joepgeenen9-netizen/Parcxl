import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase"

export default async function HomePage() {
  const supabase = createServerClient()

  // Check if user is already authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    // Get user profile to determine redirect
    const { data: profile } = await supabase.from("profiles").select("user_type").eq("id", user.id).single()

    if (profile?.user_type === "admin") {
      redirect("/admin")
    } else {
      redirect("/customer")
    }
  }

  // If not authenticated, redirect to login
  redirect("/login")
}
