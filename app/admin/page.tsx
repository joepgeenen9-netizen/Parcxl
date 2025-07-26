import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import AdminDashboard from "@/admin-dashboard"

export default async function AdminPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  if (user.rol !== "admin") {
    redirect("/dashboard")
  }

  return <AdminDashboard user={user} />
}
