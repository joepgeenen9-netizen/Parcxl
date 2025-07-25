"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useTenant } from "@/contexts/tenant-context"
import { Loader2 } from "lucide-react"

export default function HomePage() {
  const router = useRouter()
  const { tenant, isTenantDomain, isLoading } = useTenant()

  useEffect(() => {
    if (isLoading) return

    if (isTenantDomain && tenant) {
      // This is a tenant domain - redirect to login
      router.push("/login")
    } else {
      // This is a superadmin domain - redirect to superadmin dashboard
      router.push("/dashboard/superadmin")
    }
  }, [router, isTenantDomain, tenant, isLoading])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F7F9FC] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#0065FF] mx-auto mb-4" />
          <p className="text-gray-600">Bezig met laden...</p>
        </div>
      </div>
    )
  }

  return null
}
