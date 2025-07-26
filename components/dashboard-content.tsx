"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Package, TrendingUp, Clock, MapPin, CreditCard } from "lucide-react"

interface DashboardStats {
  totalShipments: number
  pendingShipments: number
  deliveredShipments: number
  totalSpent: number
}

interface DashboardContentProps {
  stats: DashboardStats
  recentShipments: Array<{
    id: string
    recipient: string
    destination: string
    status: string
    date: string
    trackingCode: string
  }>
}

export function DashboardContent({ stats, recentShipments }: DashboardContentProps) {
  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-br from-[#2069ff] to-[#1557d4] rounded-2xl p-6 lg:p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12" />
        <div className="relative z-10">
          <h1 className="text-2xl lg:text-3xl font-bold mb-2">Verzend eenvoudig wereldwijd</h1>
          <p className="text-blue-100 mb-6">
            Maak verzendlabels, volg je zendingen en beheer je adresboek op één plek.
          </p>
          <Button className="bg-white text-[#2069ff] hover:bg-blue-50 font-semibold">
            <Plus className="w-4 h-4 mr-2" />
            Nieuwe zending maken
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-[#2069ff]/10 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Totaal Zendingen</CardTitle>
            <Package className="h-4 w-4 text-[#2069ff]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{stats.totalShipments}</div>
            <p className="text-xs text-slate-500">Deze maand</p>
          </CardContent>
        </Card>

        <Card className="border-[#2069ff]/10 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">In Transit</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{stats.pendingShipments}</div>
            <p className="text-xs text-slate-500">Onderweg</p>
          </CardContent>
        </Card>

        <Card className="border-[#2069ff]/10 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Afgeleverd</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{stats.deliveredShipments}</div>
            <p className="text-xs text-slate-500">Succesvol bezorgd</p>
          </CardContent>
        </Card>

        <Card className="border-[#2069ff]/10 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Uitgegeven</CardTitle>
            <CreditCard className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">€{stats.totalSpent}</div>
            <p className="text-xs text-slate-500">Deze maand</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Shipments */}
      <Card className="border-[#2069ff]/10">
        <CardHeader>
          <CardTitle className="text-slate-900">Recente Zendingen</CardTitle>
          <CardDescription>Je laatste verzendingen en hun status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentShipments.map((shipment) => (
              <div
                key={shipment.id}
                className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#2069ff] to-[#1557d4] rounded-lg flex items-center justify-center">
                    <Package className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="font-medium text-slate-900">{shipment.recipient}</div>
                    <div className="text-sm text-slate-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {shipment.destination}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div
                    className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                      shipment.status === "Afgeleverd"
                        ? "bg-green-100 text-green-700"
                        : shipment.status === "Onderweg"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {shipment.status}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">{shipment.date}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-[#2069ff]/10 hover:shadow-lg transition-all cursor-pointer group">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-[#2069ff] to-[#1557d4] rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <Plus className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">Nieuwe Zending</h3>
            <p className="text-sm text-slate-500">Maak een nieuw verzendlabel</p>
          </CardContent>
        </Card>

        <Card className="border-[#2069ff]/10 hover:shadow-lg transition-all cursor-pointer group">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">Adresboek</h3>
            <p className="text-sm text-slate-500">Beheer je adressen</p>
          </CardContent>
        </Card>

        <Card className="border-[#2069ff]/10 hover:shadow-lg transition-all cursor-pointer group">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-2">Rapporten</h3>
            <p className="text-sm text-slate-500">Bekijk je statistieken</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
