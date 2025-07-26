"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Users,
  Package,
  TrendingUp,
  AlertTriangle,
  Server,
  Database,
  Activity,
  Shield,
  Settings,
  Bell,
  Eye,
  UserPlus,
  FileText,
  BarChart3,
  Globe,
  Zap,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
} from "lucide-react"
import { BackgroundElements } from "@/components/background-elements"

interface AdminStats {
  totalUsers: number
  activeUsers: number
  totalShipments: number
  revenue: number
  systemHealth: number
  apiCalls: number
}

interface SystemStatus {
  api: "operational" | "degraded" | "down"
  database: "operational" | "degraded" | "down"
  payments: "operational" | "degraded" | "down"
  shipping: "operational" | "degraded" | "down"
}

interface RecentActivity {
  id: string
  type: "user_signup" | "shipment_created" | "payment_processed" | "system_alert"
  description: string
  timestamp: string
  severity: "low" | "medium" | "high"
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalShipments: 0,
    revenue: 0,
    systemHealth: 0,
    apiCalls: 0,
  })

  const [systemStatus] = useState<SystemStatus>({
    api: "operational",
    database: "operational",
    payments: "operational",
    shipping: "degraded",
  })

  const [recentActivities] = useState<RecentActivity[]>([
    {
      id: "1",
      type: "user_signup",
      description: "Nieuwe gebruiker geregistreerd: john.doe@example.com",
      timestamp: "2 minuten geleden",
      severity: "low",
    },
    {
      id: "2",
      type: "shipment_created",
      description: "Bulk zending aangemaakt: 150 pakketten",
      timestamp: "5 minuten geleden",
      severity: "medium",
    },
    {
      id: "3",
      type: "system_alert",
      description: "Hoge API response tijd gedetecteerd",
      timestamp: "12 minuten geleden",
      severity: "high",
    },
    {
      id: "4",
      type: "payment_processed",
      description: "Betaling verwerkt: €2,847.50",
      timestamp: "18 minuten geleden",
      severity: "low",
    },
  ])

  // Animate counters
  useEffect(() => {
    const targetStats = {
      totalUsers: 12847,
      activeUsers: 8934,
      totalShipments: 156789,
      revenue: 2847650,
      systemHealth: 98.7,
      apiCalls: 1247893,
    }

    const duration = 2000
    const steps = 60
    const stepDuration = duration / steps

    let currentStep = 0
    const interval = setInterval(() => {
      currentStep++
      const progress = currentStep / steps

      setStats({
        totalUsers: Math.floor(targetStats.totalUsers * progress),
        activeUsers: Math.floor(targetStats.activeUsers * progress),
        totalShipments: Math.floor(targetStats.totalShipments * progress),
        revenue: Math.floor(targetStats.revenue * progress),
        systemHealth: Math.floor(targetStats.systemHealth * progress * 100) / 100,
        apiCalls: Math.floor(targetStats.apiCalls * progress),
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
      case "operational":
        return "text-green-600 bg-green-100"
      case "degraded":
        return "text-yellow-600 bg-yellow-100"
      case "down":
        return "text-red-600 bg-red-100"
      default:
        return "text-gray-600 bg-gray-100"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "operational":
        return <CheckCircle className="w-4 h-4" />
      case "degraded":
        return <Clock className="w-4 h-4" />
      case "down":
        return <XCircle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "user_signup":
        return <UserPlus className="w-4 h-4 text-blue-600" />
      case "shipment_created":
        return <Package className="w-4 h-4 text-green-600" />
      case "payment_processed":
        return <DollarSign className="w-4 h-4 text-purple-600" />
      case "system_alert":
        return <AlertTriangle className="w-4 h-4 text-red-600" />
      default:
        return <Activity className="w-4 h-4 text-gray-600" />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "border-l-red-500 bg-red-50"
      case "medium":
        return "border-l-yellow-500 bg-yellow-50"
      case "low":
        return "border-l-green-500 bg-green-50"
      default:
        return "border-l-gray-500 bg-gray-50"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 relative overflow-hidden">
      <BackgroundElements />

      <div className="relative z-10 p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">Systeemoverzicht en beheer</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" size="sm">
              <Eye className="w-4 h-4 mr-2" />
              Logs bekijken
            </Button>
            <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
              <Settings className="w-4 h-4 mr-2" />
              Instellingen
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Totaal Gebruikers</CardTitle>
              <Users className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.totalUsers.toLocaleString()}</div>
              <p className="text-xs text-green-600 flex items-center mt-1">
                <TrendingUp className="w-3 h-3 mr-1" />
                +8.2% deze maand
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Actieve Gebruikers</CardTitle>
              <Activity className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.activeUsers.toLocaleString()}</div>
              <p className="text-xs text-gray-500 mt-1">Laatste 30 dagen</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Totaal Zendingen</CardTitle>
              <Package className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.totalShipments.toLocaleString()}</div>
              <p className="text-xs text-blue-600 mt-1">Alle tijd</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Omzet</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">€{(stats.revenue / 100).toLocaleString()}</div>
              <p className="text-xs text-green-600 mt-1">Deze maand</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Systeemstatus</CardTitle>
              <Server className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.systemHealth}%</div>
              <p className="text-xs text-green-600 mt-1">Operationeel</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">API Calls</CardTitle>
              <Zap className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.apiCalls.toLocaleString()}</div>
              <p className="text-xs text-gray-500 mt-1">Vandaag</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* System Status */}
          <div className="lg:col-span-2">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                  <Shield className="w-5 h-5 mr-2" />
                  Systeemstatus
                </CardTitle>
                <CardDescription>Real-time status van alle systemen</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Globe className="w-5 h-5 text-gray-600" />
                      <div>
                        <p className="font-medium text-gray-900">API Gateway</p>
                        <p className="text-sm text-gray-600">Hoofdsysteem</p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(systemStatus.api)}>
                      {getStatusIcon(systemStatus.api)}
                      <span className="ml-1 capitalize">{systemStatus.api}</span>
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Database className="w-5 h-5 text-gray-600" />
                      <div>
                        <p className="font-medium text-gray-900">Database</p>
                        <p className="text-sm text-gray-600">PostgreSQL Cluster</p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(systemStatus.database)}>
                      {getStatusIcon(systemStatus.database)}
                      <span className="ml-1 capitalize">{systemStatus.database}</span>
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <DollarSign className="w-5 h-5 text-gray-600" />
                      <div>
                        <p className="font-medium text-gray-900">Betalingen</p>
                        <p className="text-sm text-gray-600">Stripe Integration</p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(systemStatus.payments)}>
                      {getStatusIcon(systemStatus.payments)}
                      <span className="ml-1 capitalize">{systemStatus.payments}</span>
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Package className="w-5 h-5 text-gray-600" />
                      <div>
                        <p className="font-medium text-gray-900">Verzending</p>
                        <p className="text-sm text-gray-600">Carrier APIs</p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(systemStatus.shipping)}>
                      {getStatusIcon(systemStatus.shipping)}
                      <span className="ml-1 capitalize">{systemStatus.shipping}</span>
                    </Badge>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Algemene Systeemstatus</p>
                      <p className="text-sm text-gray-600">Laatste update: 2 minuten geleden</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">{stats.systemHealth}%</div>
                      <Progress value={stats.systemHealth} className="w-24 h-2 mt-1" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">Snelle Acties</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start bg-purple-600 hover:bg-purple-700">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Gebruiker toevoegen
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Analytics bekijken
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <FileText className="w-4 h-4 mr-2" />
                  Rapporten genereren
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <Settings className="w-4 h-4 mr-2" />
                  Systeeminstellingen
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                  <Bell className="w-4 h-4 mr-2" />
                  Systeemmeldingen
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg border-l-4 border-red-500">
                  <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Hoge server load</p>
                    <p className="text-xs text-gray-600">CPU gebruik &gt; 85%</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
                  <Clock className="w-4 h-4 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Backup in uitvoering</p>
                    <p className="text-xs text-gray-600">Database backup 67% voltooid</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                  <Zap className="w-4 h-4 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Update beschikbaar</p>
                    <p className="text-xs text-gray-600">Nieuwe versie 2.1.4 beschikbaar</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Activities */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
              <Activity className="w-5 h-5 mr-2" />
              Recente Activiteiten
            </CardTitle>
            <CardDescription>Laatste systeemgebeurtenissen en gebruikersacties</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div
                  key={activity.id}
                  className={`flex items-start space-x-4 p-4 rounded-lg border-l-4 ${getSeverityColor(activity.severity)}`}
                >
                  <div className="flex-shrink-0 mt-0.5">{getActivityIcon(activity.type)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                    <p className="text-xs text-gray-500 mt-1">{activity.timestamp}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {activity.severity}
                  </Badge>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t">
              <Button variant="outline" className="w-full bg-transparent">
                Alle activiteiten bekijken
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default AdminDashboard
export { AdminDashboard }
