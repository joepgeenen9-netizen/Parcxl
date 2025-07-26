"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { CustomerLayout } from "@/components/customer-layout"
import { DashboardContent } from "@/components/dashboard-content"

interface User {
  id: number
  gebruikersnaam: string
  email: string
  contactpersoon: string
  bedrijfsnaam: string
  rol: string
  status: string
}

export default function CustomerDashboardPage() {
  const router = useRouter()

  useEffect(() => {
    const userData = localStorage.getItem("user")

    if (!userData) {
      router.push("/login")
      return
    }

    const parsedUser = JSON.parse(userData)

    // Check if user has correct role
    if (parsedUser.rol !== "klant") {
      router.push("/login")
      return
    }
  }, [router])

  return (
    <CustomerLayout>
      <DashboardContent />
    </CustomerLayout>
  )
}
