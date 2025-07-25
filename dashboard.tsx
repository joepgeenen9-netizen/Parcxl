"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function Dashboard() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to superadmin dashboard
    router.push("/dashboard/superadmin")
  }, [router])

  return null
}
