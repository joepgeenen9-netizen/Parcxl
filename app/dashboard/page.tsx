import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import CustomerDashboard from "@/customer-dashboard"

export default async function DashboardPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  if (user.rol !== "klant") {
    redirect("/admin")
  }

  return <CustomerDashboard initialUser={user} />
}
