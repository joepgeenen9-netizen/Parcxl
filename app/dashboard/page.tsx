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

  // Pass user data as props to the client component
  return <CustomerDashboard initialUser={user} />
}
