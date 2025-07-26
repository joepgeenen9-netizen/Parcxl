import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function HomePage() {
  const user = await getCurrentUser()

  if (user) {
    // Redirect based on user role
    redirect(user.rol === "admin" ? "/admin" : "/dashboard")
  } else {
    // Redirect to login if not authenticated
    redirect("/login")
  }
}
