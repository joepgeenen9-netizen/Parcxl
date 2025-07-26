import { redirect } from "next/navigation"

export default async function HomePage() {
  // Redirect to login page by default
  redirect("/login")
}
