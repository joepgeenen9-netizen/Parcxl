"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Loader2, ShoppingCart, Users, LogOut, Package } from "lucide-react"
import { useTenant } from "@/contexts/tenant-context"
import Image from "next/image"

interface TenantUser {
  id: string
  tenant_id: string
  username: string
  email: string
  is_admin: boolean
}

export default function WSDashboard() {
  const router = useRouter()
  const { toast } = useToast()
  const { tenant, isTenantDomain, isLoading: tenantLoading } = useTenant()
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<TenantUser | null>(null)

  useEffect(() => {
    if (tenantLoading) return

    // Redirect if this is not a tenant domain
    if (!isTenantDomain) {
      router.push("/login")
      return
    }

    // Check if tenant is WS type
    if (tenant?.type !== "WS") {
      router.push("/login")
      return
    }

    // Check if user is logged in
    const tenantUser = localStorage.getItem("tenant-user")
    if (!tenantUser) {
      router.push("/login")
      return
    }

    try {
      const userData = JSON.parse(tenantUser)
      if (userData.tenant_id !== tenant.id) {
        router.push("/login")
        return
      }
      setUser(userData)
    } catch (error) {
      router.push("/login")
      return
    }

    setIsLoading(false)
  }, [router, isTenantDomain, tenant, tenantLoading])

  const handleSignOut = () => {
    localStorage.removeItem("tenant-user")
    toast({
      title: "Uitgelogd",
      description: "Je bent succesvol uitgelogd.",
    })
    router.push("/login")
  }

  if (tenantLoading || isLoading) {
    return (
      <div className="min-h-screen bg-[#F7F9FC] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#0065FF] mx-auto mb-4" />
          <p className="text-gray-600">Bezig met laden...</p>
        </div>
      </div>
    )
  }

  if (!user || !tenant) {
    return null
  }

  return (
    <div className="min-h-screen bg-[#F7F9FC]">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {tenant.logo_url ? (
              <div className="relative w-10 h-10">
                <Image
                  src={tenant.logo_url || "/placeholder.svg"}
                  alt={tenant.name}
                  fill
                  className="object-contain rounded-lg"
                />
              </div>
            ) : (
              <ShoppingCart className="h-8 w-8 text-[#0065FF]" />
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "Poppins" }}>
                {tenant.name}
              </h1>
              <p className="text-sm text-gray-600">Webshop Dashboard</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{user.username}</p>
              <p className="text-xs text-gray-600">{user.email}</p>
            </div>
            <Button onClick={handleSignOut} variant="outline" className="rounded-2xl bg-transparent">
              <LogOut className="mr-2 h-4 w-4" />
              Uitloggen
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-semibold text-gray-900 mb-2" style={{ fontFamily: "Poppins" }}>
              Welcome to the Webshop dashboard
            </h2>
            <p className="text-gray-600">Beheer je webshop, orders en klanten vanuit dit dashboard.</p>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Card className="rounded-2xl border-gray-200 shadow-sm hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-[#0065FF]" />
                  Orders Beheer
                </CardTitle>
                <CardDescription>Bekijk en beheer inkomende orders</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full rounded-2xl bg-[#0065FF] hover:bg-[#0052CC]">Orders Bekijken</Button>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-gray-200 shadow-sm hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-[#0065FF]" />
                  Producten
                </CardTitle>
                <CardDescription>Beheer je productcatalogus en voorraad</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full rounded-2xl bg-[#0065FF] hover:bg-[#0052CC]">Producten Bekijken</Button>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-gray-200 shadow-sm hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-[#0065FF]" />
                  Klanten
                </CardTitle>
                <CardDescription>Beheer klantgegevens en communicatie</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full rounded-2xl bg-[#0065FF] hover:bg-[#0052CC]">Klanten Bekijken</Button>
              </CardContent>
            </Card>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="rounded-2xl border-gray-200 shadow-sm">
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#0065FF] mb-2">-</div>
                  <div className="text-sm text-gray-600">Nieuwe Orders</div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-gray-200 shadow-sm">
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#0065FF] mb-2">-</div>
                  <div className="text-sm text-gray-600">Totale Klanten</div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-gray-200 shadow-sm">
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">€-</div>
                  <div className="text-sm text-gray-600">Omzet Deze Maand</div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-gray-200 shadow-sm">
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">-</div>
                  <div className="text-sm text-gray-600">Actieve Producten</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
