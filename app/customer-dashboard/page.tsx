"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import CustomerLayout from "@/components/customer-layout"
import DashboardContent from "@/components/dashboard-content"

interface User {
  id: number
  gebruikersnaam: string
  email: string
  rol: string
  contactpersoon: string
  bedrijfsnaam: string
}

export default function CustomerDashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in
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

    setUser(parsedUser)
    setIsLoading(false)
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <CustomerLayout>
      <DashboardContent />
    </CustomerLayout>
  )
}
