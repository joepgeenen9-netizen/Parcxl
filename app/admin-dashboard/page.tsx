"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { AdminDashboard } from "@/admin-dashboard"

export default function AdminDashboardPage() {
  const router = useRouter()

  useEffect(() => {
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
  }, [router])

  return <AdminDashboard />
}
