import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase-server"

export default async function HomePage() {
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
      redirect("/login")
    }

    if (profile.user_type === "admin") {
      redirect("/admin")
    } else {
      redirect("/customer")
    }
  } catch (error) {
    redirect("/login")
  }
}
