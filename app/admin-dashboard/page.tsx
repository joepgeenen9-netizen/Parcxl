"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import AdminLayout from "@/components/admin-layout"

interface User {
  id: number
  gebruikersnaam: string
  email: string
  rol: string
  contactpersoon: string
  bedrijfsnaam: string
}

export default function AdminDashboardPage() {
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
    if (parsedUser.rol !== "admin") {
      router.push("/login")
      return
    }

    setUser(parsedUser)
    setIsLoading(false)
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
            <p className="text-gray-600">Welkom terug, {user.contactpersoon}</p>
          </div>

          {/* Admin specific content will go here */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Totaal Klanten</h3>
              <p className="text-3xl font-bold text-purple-600">1,234</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Actieve Zendingen</h3>
              <p className="text-3xl font-bold text-blue-600">567</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Maandelijkse Omzet</h3>
              <p className="text-3xl font-bold text-green-600">€45,678</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Systeem Alerts</h3>
              <p className="text-3xl font-bold text-red-600">3</p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
