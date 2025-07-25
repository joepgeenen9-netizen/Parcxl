"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Truck, Package, Clock, CheckCircle, AlertCircle, Plus, Search, Filter } from "lucide-react"
import { useTenant } from "@/contexts/tenant-context"
import FCLayout from "../_components/fc-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface TenantUser {
  id: string
  tenant_id: string
  username: string
  email: string
  is_admin: boolean
}

interface Delivery {
  id: string
  delivery_number: string
  client_name: string
  destination: string
  status: "pending" | "in_transit" | "delivered" | "failed"
  created_at: string
  scheduled_date: string
  packages_count: number
  total_weight: number
  tracking_code?: string
  driver?: string
}

// Mock data for deliveries
const mockDeliveries: Delivery[] = [
  {
    id: "1",
    delivery_number: "LEV-2025-001",
    client_name: "TechStore Amsterdam",
    destination: "Amsterdam, Noord-Holland",
    status: "delivered",
    created_at: "2025-01-19T08:30:00Z",
    scheduled_date: "2025-01-19T14:00:00Z",
    packages_count: 12,
    total_weight: 15.5,
    tracking_code: "TRK-001-2025",
    driver: "Jan van der Berg",
  },
  {
    id: "2",
    delivery_number: "LEV-2025-002",
    client_name: "Fashion Boutique Utrecht",
    destination: "Utrecht, Utrecht",
    status: "in_transit",
    created_at: "2025-01-19T09:15:00Z",
    scheduled_date: "2025-01-19T16:30:00Z",
    packages_count: 8,
    total_weight: 12.3,
    tracking_code: "TRK-002-2025",
    driver: "Maria Jansen",
  },
  {
    id: "3",
    delivery_number: "LEV-2025-003",
    client_name: "Electronics World Rotterdam",
    destination: "Rotterdam, Zuid-Holland",
    status: "pending",
    created_at: "2025-01-19T10:45:00Z",
    scheduled_date: "2025-01-20T10:00:00Z",
    packages_count: 25,
    total_weight: 45.8,
    tracking_code: "TRK-003-2025",
  },
  {
    id: "4",
    delivery_number: "LEV-2025-004",
    client_name: "Home & Garden Den Haag",
    destination: "Den Haag, Zuid-Holland",
    status: "failed",
    created_at: "2025-01-19T11:20:00Z",
    scheduled_date: "2025-01-19T15:45:00Z",
    packages_count: 6,
    total_weight: 8.9,
    tracking_code: "TRK-004-2025",
    driver: "Piet Bakker",
  },
  {
    id: "5",
    delivery_number: "LEV-2025-005",
    client_name: "Sports Equipment Eindhoven",
    destination: "Eindhoven, Noord-Brabant",
    status: "pending",
    created_at: "2025-01-19T12:00:00Z",
    scheduled_date: "2025-01-20T11:30:00Z",
    packages_count: 18,
    total_weight: 32.1,
    tracking_code: "TRK-005-2025",
  },
]

function DeliveryStats() {
  const stats = [
    {
      title: "Totale Leveringen",
      value: "247",
      change: "+12%",
      changeType: "positive" as const,
      icon: Truck,
      color: "blue",
    },
    {
      title: "In Transit",
      value: "18",
      change: "+3",
      changeType: "positive" as const,
      icon: Clock,
      color: "orange",
    },
    {
      title: "Afgeleverd Vandaag",
      value: "32",
      change: "+8",
      changeType: "positive" as const,
      icon: CheckCircle,
      color: "green",
    },
    {
      title: "Mislukte Leveringen",
      value: "2",
      change: "-1",
      changeType: "negative" as const,
      icon: AlertCircle,
      color: "red",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => {
        const IconComponent = stat.icon
        return (
          <Card key={index} className="relative overflow-hidden border-0 shadow-sm bg-white/90 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
                  <p
                    className={`text-sm font-medium mt-1 ${
                      stat.changeType === "positive" ? "text-emerald-600" : "text-red-600"
                    }`}
                  >
                    {stat.change} vs gisteren
                  </p>
                </div>
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    stat.color === "blue"
                      ? "bg-blue-100"
                      : stat.color === "orange"
                        ? "bg-orange-100"
                        : stat.color === "green"
                          ? "bg-emerald-100"
                          : "bg-red-100"
                  }`}
                >
                  <IconComponent
                    className={`w-6 h-6 ${
                      stat.color === "blue"
                        ? "text-blue-600"
                        : stat.color === "orange"
                          ? "text-orange-600"
                          : stat.color === "green"
                            ? "text-emerald-600"
                            : "text-red-600"
                    }`}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

function DeliveryTable({ deliveries }: { deliveries: Delivery[] }) {
  const getStatusBadge = (status: Delivery["status"]) => {
    const statusConfig = {
      pending: {
        label: "Wachtend",
        variant: "secondary" as const,
        className: "bg-yellow-100 text-yellow-800 border-yellow-200",
      },
      in_transit: {
        label: "Onderweg",
        variant: "default" as const,
        className: "bg-blue-100 text-blue-800 border-blue-200",
      },
      delivered: {
        label: "Afgeleverd",
        variant: "default" as const,
        className: "bg-emerald-100 text-emerald-800 border-emerald-200",
      },
      failed: {
        label: "Mislukt",
        variant: "destructive" as const,
        className: "bg-red-100 text-red-800 border-red-200",
      },
    }

    const config = statusConfig[status]
    return (
      <Badge variant={config.variant} className={config.className}>
        {config.label}
      </Badge>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("nl-NL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <Card className="border-0 shadow-sm bg-white/90 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold text-slate-900">Recente Leveringen</CardTitle>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input placeholder="Zoek leveringen..." className="pl-10 w-64 bg-white/80 border-slate-200" />
            </div>
            <Button variant="outline" size="sm" className="bg-white/80 border-slate-200">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-200">
                <TableHead className="font-semibold text-slate-700">Leveringsnummer</TableHead>
                <TableHead className="font-semibold text-slate-700">Klant</TableHead>
                <TableHead className="font-semibold text-slate-700">Bestemming</TableHead>
                <TableHead className="font-semibold text-slate-700">Status</TableHead>
                <TableHead className="font-semibold text-slate-700">Pakketten</TableHead>
                <TableHead className="font-semibold text-slate-700">Gewicht</TableHead>
                <TableHead className="font-semibold text-slate-700">Gepland</TableHead>
                <TableHead className="font-semibold text-slate-700">Chauffeur</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deliveries.map((delivery) => (
                <TableRow key={delivery.id} className="border-slate-100 hover:bg-slate-50/50 cursor-pointer">
                  <TableCell className="font-medium text-slate-900">{delivery.delivery_number}</TableCell>
                  <TableCell className="text-slate-700">{delivery.client_name}</TableCell>
                  <TableCell className="text-slate-600">{delivery.destination}</TableCell>
                  <TableCell>{getStatusBadge(delivery.status)}</TableCell>
                  <TableCell className="text-slate-700">
                    <div className="flex items-center gap-1">
                      <Package className="w-4 h-4 text-slate-400" />
                      {delivery.packages_count}
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-700">{delivery.total_weight} kg</TableCell>
                  <TableCell className="text-slate-600 text-sm">{formatDate(delivery.scheduled_date)}</TableCell>
                  <TableCell className="text-slate-700">{delivery.driver || "-"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

export default function LeveringenPage() {
  const router = useRouter()
  const { tenant, isTenantDomain, isLoading: tenantLoading } = useTenant()
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<TenantUser | null>(null)
  const [deliveries, setDeliveries] = useState<Delivery[]>([])

  useEffect(() => {
    if (tenantLoading) return

    // Redirect if this is not a tenant domain
    if (!isTenantDomain) {
      router.push("/login")
      return
    }

    // Check if tenant is FC type
    if (tenant?.type !== "FC") {
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
      setDeliveries(mockDeliveries)
    } catch (error) {
      router.push("/login")
      return
    }

    setIsLoading(false)
  }, [router, isTenantDomain, tenant, tenantLoading])

  if (tenantLoading || isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#2069ff] mx-auto mb-4" />
          <p className="text-gray-600">Bezig met laden...</p>
        </div>
      </div>
    )
  }

  if (!user || !tenant) {
    return null
  }

  return (
    <FCLayout user={user} tenant={tenant} searchPlaceholder="Zoek leveringen...">
      <div className="space-y-8">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Leveringen</h1>
            <p className="text-slate-600 mt-2">Beheer en volg al je leveringen</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="bg-white/80 border-slate-200">
              <Truck className="w-4 h-4 mr-2" />
              Route Planner
            </Button>
            <Button
              className="bg-gradient-to-r from-[#2069ff] to-[#1557d4] hover:from-[#1557d4] hover:to-[#0f4cb8] text-white shadow-lg"
              onClick={() => router.push("/dashboard/fc/leveringen/new")}
            >
              <Plus className="w-4 h-4 mr-2" />
              Nieuwe Levering
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <DeliveryStats />

        {/* Deliveries Table */}
        <DeliveryTable deliveries={deliveries} />
      </div>
    </FCLayout>
  )
}
