"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Users,
  Package,
  DollarSign,
  AlertTriangle,
  TrendingUp,
  Activity,
  Shield,
  Settings,
  UserPlus,
  BarChart3,
  Database,
  Bell,
} from "lucide-react"
import { BackgroundElements } from "@/components/background-elements"
import Image from "next/image"

export default function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Admin statistics
  const stats = [
    {
      title: "Totaal Klanten",
      value: "1,247",
      change: "+12%",
      changeType: "positive" as const,
      icon: Users,
      color: "bg-blue-500",
    },
    {
      title: "Actieve Zendingen",
      value: "3,891",
      change: "+8%",
      changeType: "positive" as const,
      icon: Package,
      color: "bg-green-500",
    },
    {
      title: "Maandelijkse Omzet",
      value: "€89,432",
      change: "+23%",
      changeType: "positive" as const,
      icon: DollarSign,
      color: "bg-purple-500",
    },
    {
      title: "Systeem Alerts",
      value: "7",
      change: "-2",
      changeType: "negative" as const,
      icon: AlertTriangle,
      color: "bg-red-500",
    },
  ]

  // Recent admin activities
  const recentActivities = [
    {
      id: 1,
      type: "user_created",
      message: "Nieuwe klant geregistreerd: TechCorp B.V.",
      time: "2 minuten geleden",
      icon: UserPlus,
      color: "text-green-600",
    },
    {
      id: 2,
      type: "system_alert",
      message: "Server load hoog - monitoring actief",
      time: "15 minuten geleden",
      icon: AlertTriangle,
      color: "text-red-600",
    },
    {
      id: 3,
      type: "backup_completed",
      message: "Database backup succesvol voltooid",
      time: "1 uur geleden",
      icon: Database,
      color: "text-blue-600",
    },
    {
      id: 4,
      type: "user_login",
      message: "Admin login: joep@admin.nl",
      time: "2 uur geleden",
      icon: Shield,
      color: "text-purple-600",
    },
  ]

  // Quick admin actions
  const quickActions = [
    {
      title: "Gebruikers Beheren",
      description: "Bekijk en beheer alle gebruikersaccounts",
      icon: Users,
      color: "bg-blue-500",
      href: "/admin/users",
    },
    {
      title: "Systeem Monitoring",
      description: "Monitor server prestaties en logs",
      icon: Activity,
      color: "bg-green-500",
      href: "/admin/monitoring",
    },
    {
      title: "API Configuratie",
      description: "Beheer API keys en integraties",
      icon: Settings,
      color: "bg-purple-500",
      href: "/admin/api",
    },
    {
      title: "Rapporten",
      description: "Genereer uitgebreide rapporten",
      icon: BarChart3,
      color: "bg-orange-500",
      href: "/admin/reports",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50 relative">
      <BackgroundElements />

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Admin Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full w-64 bg-white/80 backdrop-blur-md border-r border-white/20 shadow-xl z-50 transform transition-transform duration-300 ease-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-8">
            <div className="relative w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl p-2">
              <Image
                src="/images/parcxl-logo.png"
                alt="Parcxl Logo"
                width={24}
                height={24}
                className="w-full h-full object-contain filter brightness-0 invert"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Parcxl</h1>
              <div className="flex items-center space-x-1">
                <Shield className="w-3 h-3 text-purple-500" />
                <span className="text-xs text-purple-600 font-medium">Admin</span>
              </div>
            </div>
          </div>

          <nav className="space-y-2">
            {[
              { name: "Dashboard", icon: BarChart3, active: true },
              { name: "Klanten Beheer", icon: Users },
              { name: "Zendingen Overzicht", icon: Package },
              { name: "Facturen Beheer", icon: DollarSign },
              { name: "Systeem Beheer", icon: Settings },
              { name: "API Configuratie", icon: Database },
              { name: "Monitoring", icon: Activity },
              { name: "Support Tickets", icon: Bell },
            ].map((item) => (
              <a
                key={item.name}
                href="#"
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                  item.active
                    ? "bg-gradient-to-r from-purple-500 to-blue-600 text-white shadow-lg"
                    : "text-gray-600 hover:bg-white/60 hover:text-gray-900"
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
              </a>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Admin Navbar */}
        <header className="bg-white/80 backdrop-blur-md border-b border-white/20 shadow-sm">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </Button>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Admin Dashboard</h2>
                  <p className="text-sm text-gray-600">Beheer uw Parcxl platform</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="sm" className="relative">
                  <Bell className="w-5 h-5" />
                  <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center bg-red-500 text-white text-xs">
                    3
                  </Badge>
                </Button>

                <div className="flex items-center space-x-3">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src="/placeholder-user.jpg" />
                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-600 text-white">
                      JA
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:block">
                    <p className="text-sm font-medium text-gray-900">Joep</p>
                    <div className="flex items-center space-x-1">
                      <Shield className="w-3 h-3 text-purple-500" />
                      <p className="text-xs text-purple-600">Admin</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="p-6 space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <Card
                key={index}
                className="bg-white/60 backdrop-blur-sm border-white/20 hover:bg-white/80 transition-all duration-300 hover:scale-105"
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                      <div className="flex items-center mt-2">
                        <TrendingUp
                          className={`w-4 h-4 mr-1 ${
                            stat.changeType === "positive" ? "text-green-500" : "text-red-500"
                          }`}
                        />
                        <span
                          className={`text-sm font-medium ${
                            stat.changeType === "positive" ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {stat.change}
                        </span>
                      </div>
                    </div>
                    <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center`}>
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activities */}
            <Card className="bg-white/60 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="w-5 h-5 text-purple-600" />
                  <span>Recente Activiteiten</span>
                </CardTitle>
                <CardDescription>Laatste systeem gebeurtenissen en admin acties</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start space-x-3 p-3 rounded-lg bg-white/40 hover:bg-white/60 transition-colors"
                    >
                      <div
                        className={`w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center ${activity.color}`}
                      >
                        <activity.icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                        <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-white/60 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="w-5 h-5 text-blue-600" />
                  <span>Snelle Acties</span>
                </CardTitle>
                <CardDescription>Veelgebruikte admin functionaliteiten</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {quickActions.map((action, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      className="h-auto p-4 flex flex-col items-center space-y-2 hover:bg-white/60 transition-all duration-200 hover:scale-105"
                    >
                      <div className={`w-10 h-10 ${action.color} rounded-xl flex items-center justify-center`}>
                        <action.icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-900">{action.title}</p>
                        <p className="text-xs text-gray-500 mt-1">{action.description}</p>
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* System Status */}
          <Card className="bg-white/60 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-green-600" />
                  <span>Systeem Status</span>
                </div>
                <Badge className="bg-green-100 text-green-800">Alles Operationeel</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { name: "API Server", status: "Online", uptime: "99.9%", color: "text-green-600" },
                  { name: "Database", status: "Online", uptime: "99.8%", color: "text-green-600" },
                  { name: "Mail Service", status: "Online", uptime: "99.7%", color: "text-green-600" },
                ].map((service, index) => (
                  <div key={index} className="p-4 rounded-lg bg-white/40">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">{service.name}</span>
                      <span className={`text-sm font-medium ${service.color}`}>{service.status}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      Uptime: <span className="font-medium">{service.uptime}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}
