"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Package,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  ArrowRight,
  Truck,
  Euro,
  Users,
  BarChart3,
} from "lucide-react"

interface DashboardContentProps {
  userType?: "customer" | "admin"
}

export function DashboardContent({ userType = "customer" }: DashboardContentProps) {
  const isAdmin = userType === "admin"

  const customerStats = [
    {
      title: "Actieve Zendingen",
      value: "12",
      change: "+2 deze week",
      icon: Package,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Bezorgd Vandaag",
      value: "8",
      change: "+15% vs gisteren",
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "In Transit",
      value: "4",
      change: "2 uur geleden",
      icon: Truck,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: "Deze Maand",
      value: "€1,247",
      change: "+8% vs vorige maand",
      icon: Euro,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ]

  const adminStats = [
    {
      title: "Totaal Klanten",
      value: "1,247",
      change: "+12 deze week",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Actieve Zendingen",
      value: "3,891",
      change: "+23% vs vorige week",
      icon: Package,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Maandelijkse Omzet",
      value: "€89,247",
      change: "+15% vs vorige maand",
      icon: Euro,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Systeem Alerts",
      value: "3",
      change: "2 nieuw vandaag",
      icon: AlertCircle,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
  ]

  const stats = isAdmin ? adminStats : customerStats

  const recentActivities = isAdmin
    ? [
        { id: 1, action: "Nieuwe klant geregistreerd", user: "Jan Bakker", time: "2 min geleden", type: "user" },
        { id: 2, action: "Systeem backup voltooid", user: "Systeem", time: "15 min geleden", type: "system" },
        { id: 3, action: "Zending #ZD-2024-001 bezorgd", user: "PostNL", time: "1 uur geleden", type: "delivery" },
        {
          id: 4,
          action: "Nieuwe factuur gegenereerd",
          user: "Factuur Systeem",
          time: "2 uur geleden",
          type: "invoice",
        },
        { id: 5, action: "API rate limit bereikt", user: "API Monitor", time: "3 uur geleden", type: "warning" },
      ]
    : [
        { id: 1, action: "Zending #ZD-2024-001 bezorgd", user: "PostNL", time: "2 min geleden", type: "delivery" },
        { id: 2, action: "Label geprint voor #ZD-2024-002", user: "Jij", time: "15 min geleden", type: "print" },
        { id: 3, action: "Nieuwe zending aangemaakt", user: "Jij", time: "1 uur geleden", type: "create" },
        { id: 4, action: "Factuur #F-2024-001 betaald", user: "Automatisch", time: "2 uur geleden", type: "payment" },
        { id: 5, action: "Adres toegevoegd aan adresboek", user: "Jij", time: "3 uur geleden", type: "address" },
      ]

  const quickActions = isAdmin
    ? [
        { title: "Gebruikers Beheren", description: "Beheer klant accounts", icon: Users, href: "/admin/users" },
        { title: "Systeem Monitor", description: "Bekijk systeem status", icon: BarChart3, href: "/admin/monitoring" },
        { title: "API Configuratie", description: "Beheer API instellingen", icon: Package, href: "/admin/api" },
      ]
    : [
        { title: "Nieuwe Zending", description: "Maak een nieuwe zending aan", icon: Plus, href: "/verzenden" },
        { title: "Track & Trace", description: "Volg je zendingen", icon: Package, href: "/orders" },
        { title: "Adresboek", description: "Beheer je adressen", icon: Users, href: "/adresboek" },
      ]

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{isAdmin ? "Admin Dashboard" : "Dashboard"}</h1>
          <p className="text-slate-600 mt-1">
            {isAdmin ? "Beheer het Parcxl platform" : "Welkom terug! Hier is een overzicht van je zendingen."}
          </p>
        </div>
        <Button className="bg-[#2069ff] hover:bg-[#1557cc] text-white">
          <Plus className="w-4 h-4 mr-2" />
          {isAdmin ? "Nieuwe Klant" : "Nieuwe Zending"}
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="relative overflow-hidden border-0 shadow-sm bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
                  <p className="text-xs text-slate-500 mt-1">{stat.change}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <Card className="lg:col-span-2 border-0 shadow-sm bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#2069ff]" />
              Recente Activiteit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center gap-4 p-3 rounded-lg bg-slate-50/50 hover:bg-slate-100/50 transition-colors"
                >
                  <div
                    className={`w-2 h-2 rounded-full ${
                      activity.type === "delivery"
                        ? "bg-green-500"
                        : activity.type === "warning"
                          ? "bg-red-500"
                          : activity.type === "system"
                            ? "bg-blue-500"
                            : "bg-slate-400"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900">{activity.action}</p>
                    <p className="text-xs text-slate-500">
                      {activity.user} • {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#2069ff]" />
              Snelle Acties
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {quickActions.map((action, index) => (
                <Button key={index} variant="ghost" className="w-full justify-start h-auto p-4 hover:bg-slate-100/50">
                  <div className="flex items-center gap-3 w-full">
                    <div className="p-2 rounded-lg bg-[#2069ff]/10">
                      <action.icon className="w-4 h-4 text-[#2069ff]" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-medium text-sm">{action.title}</p>
                      <p className="text-xs text-slate-500">{action.description}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Chart Placeholder */}
      <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#2069ff]" />
            {isAdmin ? "Platform Prestaties" : "Zending Overzicht"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center bg-slate-50/50 rounded-lg">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600 font-medium">Grafiek komt binnenkort</p>
              <p className="text-sm text-slate-500">
                {isAdmin ? "Platform statistieken en trends" : "Zending statistieken en trends"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default DashboardContent
