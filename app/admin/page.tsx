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

  // Pass user data as props to the client component
  return <AdminDashboard initialUser={user} />
}
