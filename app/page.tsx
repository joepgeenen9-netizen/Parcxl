import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase-server"

export default async function HomePage() {
  const supabase = createServerClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  const { data: profile } = await supabase.from("profiles").select("user_type").eq("id", session.user.id).single()

  if (profile?.user_type === "admin") {
    redirect("/admin")
  } else {
    redirect("/customer")
  }
}
