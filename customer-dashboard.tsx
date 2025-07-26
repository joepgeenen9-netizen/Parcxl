"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Package,
  Truck,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  MapPin,
  Calendar,
  BarChart3,
  Plus,
  Search,
  Filter,
  Download,
  Bell,
  User,
  CreditCard,
  FileText,
  HelpCircle,
  Zap,
  Globe,
  Shield,
} from "lucide-react"
import { BackgroundElements } from "@/components/background-elements"

interface ShipmentStats {
  total: number
  pending: number
  inTransit: number
  delivered: number
  delayed: number
}

interface RecentShipment {
  id: string
  recipient: string
  destination: string
  status: "pending" | "in-transit" | "delivered" | "delayed"
  date: string
  value: number
}

const CustomerDashboard = () => {
  const [stats, setStats] = useState<ShipmentStats>({
    total: 0,
    pending: 0,
    inTransit: 0,
    delivered: 0,
    delayed: 0,
  })

  const [recentShipments] = useState<RecentShipment[]>([
    {
      id: "PCX-2024-001",
      recipient: "Jan de Vries",
      destination: "Amsterdam, NL",
      status: "delivered",
      date: "2024-01-15",
      value: 45.5,
    },
    {
      id: "PCX-2024-002",
      recipient: "Marie Dubois",
      destination: "Paris, FR",
      status: "in-transit",
      date: "2024-01-14",
      value: 32.75,
    },
    {
      id: "PCX-2024-003",
      recipient: "Hans Mueller",
      destination: "Berlin, DE",
      status: "pending",
      date: "2024-01-13",
      value: 28.9,
    },
    {
      id: "PCX-2024-004",
      recipient: "Sofia Rossi",
      destination: "Rome, IT",
      status: "delayed",
      date: "2024-01-12",
      value: 67.25,
    },
  ])

  // Animate counters
  useEffect(() => {
    const targetStats = {
      total: 1247,
      pending: 23,
      inTransit: 156,
      delivered: 1052,
      delayed: 16,
    }

    const duration = 2000
    const steps = 60
    const stepDuration = duration / steps

    let currentStep = 0
    const interval = setInterval(() => {
      currentStep++
      const progress = currentStep / steps

      setStats({
        total: Math.floor(targetStats.total * progress),
        pending: Math.floor(targetStats.pending * progress),
        inTransit: Math.floor(targetStats.inTransit * progress),
        delivered: Math.floor(targetStats.delivered * progress),
        delayed: Math.floor(targetStats.delayed * progress),
      })

      if (currentStep >= steps) {
        clearInterval(interval)
        setStats(targetStats)
      }
    }, stepDuration)

    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-500"
      case "in-transit":
        return "bg-blue-500"
      case "pending":
        return "bg-yellow-500"
      case "delayed":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "delivered":
        return "Afgeleverd"
      case "in-transit":
        return "Onderweg"
      case "pending":
        return "In behandeling"
      case "delayed":
        return "Vertraagd"
      default:
        return "Onbekend"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 relative overflow-hidden">
      <BackgroundElements />

      <div className="relative z-10 p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">Overzicht van uw zendingen en activiteiten</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Nieuwe zending
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Totaal Zendingen</CardTitle>
              <Package className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.total.toLocaleString()}</div>
              <p className="text-xs text-green-600 flex items-center mt-1">
                <TrendingUp className="w-3 h-3 mr-1" />
                +12% deze maand
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">In behandeling</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.pending}</div>
              <p className="text-xs text-gray-500 mt-1">Wachten op verwerking</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Onderweg</CardTitle>
              <Truck className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.inTransit}</div>
              <p className="text-xs text-blue-600 mt-1">In transit naar bestemming</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Afgeleverd</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.delivered.toLocaleString()}</div>
              <p className="text-xs text-green-600 mt-1">Succesvol bezorgd</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Vertraagd</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.delayed}</div>
              <p className="text-xs text-red-600 mt-1">Aandacht vereist</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Shipments */}
          <div className="lg:col-span-2">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-semibold text-gray-900">Recente Zendingen</CardTitle>
                    <CardDescription>Overzicht van uw laatste verzendingen</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Filter className="w-4 h-4 mr-2" />
                      Filter
                    </Button>
                    <Button variant="outline" size="sm">
                      <Search className="w-4 h-4 mr-2" />
                      Zoeken
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentShipments.map((shipment) => (
                    <div
                      key={shipment.id}
                      className="flex items-center justify-between p-4 bg-gray-50/50 rounded-lg hover:bg-gray-100/50 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(shipment.status)}`} />
                        <div>
                          <p className="font-medium text-gray-900">{shipment.id}</p>
                          <p className="text-sm text-gray-600">{shipment.recipient}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center text-sm text-gray-600 mb-1">
                          <MapPin className="w-3 h-3 mr-1" />
                          {shipment.destination}
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {getStatusText(shipment.status)}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">€{shipment.value.toFixed(2)}</p>
                        <p className="text-xs text-gray-500">{shipment.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t">
                  <Button variant="outline" className="w-full bg-transparent">
                    Alle zendingen bekijken
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions & Stats */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">Snelle Acties</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Nieuwe zending
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Rapporten bekijken
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <User className="w-4 h-4 mr-2" />
                  Adresboek
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Facturatie
                </Button>
              </CardContent>
            </Card>

            {/* Performance */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">Prestaties</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Bezorgpercentage</span>
                    <span className="font-medium">98.7%</span>
                  </div>
                  <Progress value={98.7} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Op tijd bezorgd</span>
                    <span className="font-medium">94.2%</span>
                  </div>
                  <Progress value={94.2} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Klanttevredenheid</span>
                    <span className="font-medium">96.8%</span>
                  </div>
                  <Progress value={96.8} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                  <Bell className="w-4 h-4 mr-2" />
                  Meldingen
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Nieuwe integratie beschikbaar</p>
                    <p className="text-xs text-gray-600">WooCommerce plugin is nu beschikbaar</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Zending afgeleverd</p>
                    <p className="text-xs text-gray-600">PCX-2024-001 is succesvol bezorgd</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Factuur gereed</p>
                    <p className="text-xs text-gray-600">Maandfactuur januari is beschikbaar</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Overview */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                Maandoverzicht
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">€2,847</div>
                  <div className="text-sm text-gray-600">Verzendkosten</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">€156</div>
                  <div className="text-sm text-gray-600">Besparingen</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">247</div>
                  <div className="text-sm text-gray-600">Zendingen</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">12</div>
                  <div className="text-sm text-gray-600">Landen</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Support & Help */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                <HelpCircle className="w-4 h-4 mr-2" />
                Hulp & Ondersteuning
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <FileText className="w-4 h-4 mr-2" />
                Documentatie
              </Button>
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <Zap className="w-4 h-4 mr-2" />
                API Referentie
              </Button>
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <Globe className="w-4 h-4 mr-2" />
                Status Pagina
              </Button>
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <Shield className="w-4 h-4 mr-2" />
                Beveiliging
              </Button>
              <div className="pt-2 border-t">
                <Button className="w-full bg-green-600 hover:bg-green-700">Contact Opnemen</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default CustomerDashboard
export { CustomerDashboard }
