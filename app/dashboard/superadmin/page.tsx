"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Users, Building2, Settings, TrendingUp, Globe, UserCheck, Calendar } from "lucide-react"
import { useTenant } from "@/contexts/tenant-context"
import Link from "next/link"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts"

interface DashboardStats {
  totalTenants: number
  totalUsers: number
  activeTenants: number
  totalDomains: number
  fcTenants: number
  wsTenants: number
  averageUsersPerTenant: number
  recentSignups: number
}

interface ChartData {
  tenantsByType: Array<{ name: string; value: number; color: string }>
  userGrowth: Array<{ month: string; users: number; tenants: number }>
  tenantActivity: Array<{ name: string; users: number; domains: number }>
}

const COLORS = {
  primary: "#0065FF",
  secondary: "#FF8200",
  primaryLight: "#E9F2FF",
  secondaryLight: "#FFF4E6",
}

export default function SuperadminDashboard() {
  const router = useRouter()
  const { toast } = useToast()
  const { isTenantDomain, isLoading: tenantLoading } = useTenant()
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authChecked, setAuthChecked] = useState(false)
  const [stats, setStats] = useState<DashboardStats>({
    totalTenants: 0,
    totalUsers: 0,
    activeTenants: 0,
    totalDomains: 0,
    fcTenants: 0,
    wsTenants: 0,
    averageUsersPerTenant: 0,
    recentSignups: 0,
  })
  const [chartData, setChartData] = useState<ChartData>({
    tenantsByType: [],
    userGrowth: [],
    tenantActivity: [],
  })
  const [dataLoading, setDataLoading] = useState(true)

  useEffect(() => {
    if (tenantLoading || authChecked) return

    // Redirect if this is a tenant domain
    if (isTenantDomain) {
      router.replace("/login")
      return
    }

    const checkAuth = async () => {
      try {
        // Get current session
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession()

        if (sessionError) {
          console.error("Session error:", sessionError)
          router.replace("/login")
          return
        }

        if (!session?.user) {
          console.log("No session found, redirecting to login")
          router.replace("/login")
          return
        }

        // Check if user is super-admin
        const { data: superAdmin, error: adminError } = await supabase
          .from("super_admins")
          .select("id")
          .eq("id", session.user.id)
          .single()

        if (adminError || !superAdmin) {
          console.log("User is not a super admin, signing out")
          await supabase.auth.signOut({ scope: "global" })
          router.replace("/login")
          return
        }

        console.log("Authentication successful")
        setIsAuthenticated(true)
        await loadDashboardData()
      } catch (error) {
        console.error("Auth check error:", error)
        router.replace("/login")
      } finally {
        setIsLoading(false)
        setAuthChecked(true)
      }
    }

    checkAuth()
  }, [router, isTenantDomain, tenantLoading, authChecked])

  const loadDashboardData = async () => {
    try {
      setDataLoading(true)

      // Fetch tenants data
      const { data: tenants, error: tenantsError } = await supabase.from("tenants").select("id, name, type, created_at")

      if (tenantsError) throw tenantsError

      // Fetch tenant users data
      const { data: tenantUsers, error: usersError } = await supabase
        .from("tenant_users")
        .select("id, tenant_id, created_at")

      if (usersError) throw usersError

      // Fetch domains data
      const { data: domains, error: domainsError } = await supabase
        .from("tenant_domains")
        .select("id, tenant_id, domain")

      if (domainsError) throw domainsError

      // Calculate statistics
      const totalTenants = tenants?.length || 0
      const totalUsers = tenantUsers?.length || 0
      const activeTenants = totalTenants
      const totalDomains = domains?.length || 0
      const fcTenants = tenants?.filter((t) => t.type === "FC").length || 0
      const wsTenants = tenants?.filter((t) => t.type === "WS").length || 0
      const averageUsersPerTenant = totalTenants > 0 ? Math.round((totalUsers / totalTenants) * 10) / 10 : 0

      // Recent signups (last 30 days)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      const recentSignups = tenantUsers?.filter((u) => new Date(u.created_at) > thirtyDaysAgo).length || 0

      setStats({
        totalTenants,
        totalUsers,
        activeTenants,
        totalDomains,
        fcTenants,
        wsTenants,
        averageUsersPerTenant,
        recentSignups,
      })

      // Prepare chart data
      const tenantsByType = [
        { name: "Fulfillment Centers", value: fcTenants, color: COLORS.primary },
        { name: "Webshops", value: wsTenants, color: COLORS.secondary },
      ]

      // Mock user growth data
      const userGrowth = [
        { month: "Jan", users: Math.max(0, totalUsers - 150), tenants: Math.max(0, totalTenants - 8) },
        { month: "Feb", users: Math.max(0, totalUsers - 120), tenants: Math.max(0, totalTenants - 6) },
        { month: "Mar", users: Math.max(0, totalUsers - 90), tenants: Math.max(0, totalTenants - 5) },
        { month: "Apr", users: Math.max(0, totalUsers - 60), tenants: Math.max(0, totalTenants - 3) },
        { month: "May", users: Math.max(0, totalUsers - 30), tenants: Math.max(0, totalTenants - 2) },
        { month: "Jun", users: totalUsers, tenants: totalTenants },
      ]

      // Tenant activity data
      const tenantActivity =
        tenants?.slice(0, 6).map((tenant) => {
          const userCount = tenantUsers?.filter((u) => u.tenant_id === tenant.id).length || 0
          const domainCount = domains?.filter((d) => d.tenant_id === tenant.id).length || 0
          return {
            name: tenant.name.length > 12 ? tenant.name.substring(0, 12) + "..." : tenant.name,
            users: userCount,
            domains: domainCount,
          }
        }) || []

      setChartData({
        tenantsByType,
        userGrowth,
        tenantActivity,
      })
    } catch (error) {
      console.error("Error loading dashboard data:", error)
      toast({
        title: "Fout bij laden data",
        description: "Er is een fout opgetreden bij het laden van de dashboard gegevens.",
        variant: "destructive",
      })
    } finally {
      setDataLoading(false)
    }
  }

  if (tenantLoading || isLoading || !authChecked) {
    return (
      <div className="flex-1 p-4 md:p-6 bg-gray-50 min-h-0 overflow-auto font-poppins">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#0065FF] mx-auto mb-4" />
            <p className="text-gray-600 font-poppins font-medium">Bezig met laden...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="flex-1 p-4 md:p-6 bg-gray-50 min-h-0 overflow-auto font-poppins">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-2 font-poppins">Platform Overzicht</h1>
        <p className="text-sm md:text-base text-gray-600 font-poppins font-medium">
          Realtime statistieken en inzichten van het Packway platform.
        </p>
      </div>

      {/* Key Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
        <Card className="rounded-2xl border-gray-200 shadow-sm hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-200">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 font-poppins">Totaal Tenants</p>
                <p className="text-2xl md:text-3xl font-bold text-[#0065FF] font-poppins">
                  {dataLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats.totalTenants}
                </p>
              </div>
              <Building2 className="h-8 w-8 text-[#0065FF] opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-gray-200 shadow-sm hover:shadow-lg hover:shadow-orange-500/10 transition-all duration-200">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 font-poppins">Totaal Gebruikers</p>
                <p className="text-2xl md:text-3xl font-bold text-[#FF8200] font-poppins">
                  {dataLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats.totalUsers}
                </p>
              </div>
              <Users className="h-8 w-8 text-[#FF8200] opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-gray-200 shadow-sm hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-200">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 font-poppins">Actieve Tenants</p>
                <p className="text-2xl md:text-3xl font-bold text-[#0065FF] font-poppins">
                  {dataLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats.activeTenants}
                </p>
              </div>
              <UserCheck className="h-8 w-8 text-[#0065FF] opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-gray-200 shadow-sm hover:shadow-lg hover:shadow-orange-500/10 transition-all duration-200">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 font-poppins">Domeinen</p>
                <p className="text-2xl md:text-3xl font-bold text-[#FF8200] font-poppins">
                  {dataLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats.totalDomains}
                </p>
              </div>
              <Globe className="h-8 w-8 text-[#FF8200] opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
        <Card className="rounded-2xl border-gray-200 shadow-sm">
          <CardContent className="p-4 md:p-6">
            <div className="text-center">
              <TrendingUp className="h-8 w-8 text-[#0065FF] mx-auto mb-2" />
              <p className="text-2xl font-bold text-[#0065FF] mb-1 font-poppins">
                {dataLoading ? <Loader2 className="h-6 w-6 animate-spin mx-auto" /> : stats.averageUsersPerTenant}
              </p>
              <p className="text-sm text-gray-600 font-poppins font-medium">Gem. Gebruikers per Tenant</p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-gray-200 shadow-sm">
          <CardContent className="p-4 md:p-6">
            <div className="text-center">
              <Calendar className="h-8 w-8 text-[#FF8200] mx-auto mb-2" />
              <p className="text-2xl font-bold text-[#FF8200] mb-1 font-poppins">
                {dataLoading ? <Loader2 className="h-6 w-6 animate-spin mx-auto" /> : stats.recentSignups}
              </p>
              <p className="text-sm text-gray-600 font-poppins font-medium">Nieuwe Gebruikers (30d)</p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-gray-200 shadow-sm">
          <CardContent className="p-4 md:p-6">
            <div className="text-center">
              <div className="flex justify-center space-x-4 mb-2">
                <div className="text-center">
                  <p className="text-lg font-bold text-[#0065FF] font-poppins">{dataLoading ? "-" : stats.fcTenants}</p>
                  <p className="text-xs text-gray-600 font-poppins font-medium">FC</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-[#FF8200] font-poppins">{dataLoading ? "-" : stats.wsTenants}</p>
                  <p className="text-xs text-gray-600 font-poppins font-medium">WS</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 font-poppins font-medium">Tenant Types</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Tenant Types Pie Chart */}
        <Card className="rounded-2xl border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 font-poppins">Tenant Verdeling</CardTitle>
            <CardDescription className="font-poppins font-medium">
              Verdeling tussen Fulfillment Centers en Webshops
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {dataLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-8 w-8 animate-spin text-[#0065FF]" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData.tenantsByType}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {chartData.tenantsByType.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="flex justify-center space-x-6 mt-4">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-[#0065FF] rounded-full mr-2"></div>
                <span className="text-sm text-gray-600 font-poppins font-medium">FC ({stats.fcTenants})</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-[#FF8200] rounded-full mr-2"></div>
                <span className="text-sm text-gray-600 font-poppins font-medium">WS ({stats.wsTenants})</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Growth Chart */}
        <Card className="rounded-2xl border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 font-poppins">Groei Overzicht</CardTitle>
            <CardDescription className="font-poppins font-medium">
              Gebruikers en tenants groei over tijd
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {dataLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-8 w-8 animate-spin text-[#0065FF]" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData.userGrowth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="users"
                      stackId="1"
                      stroke={COLORS.primary}
                      fill={COLORS.primary}
                      fillOpacity={0.6}
                    />
                    <Area
                      type="monotone"
                      dataKey="tenants"
                      stackId="2"
                      stroke={COLORS.secondary}
                      fill={COLORS.secondary}
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tenant Activity Chart */}
      <Card className="rounded-2xl border-gray-200 shadow-sm mb-8">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900 font-poppins">Tenant Activiteit</CardTitle>
          <CardDescription className="font-poppins font-medium">Gebruikers en domeinen per tenant</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            {dataLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-[#0065FF]" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.tenantActivity}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="users" fill={COLORS.primary} name="Gebruikers" />
                  <Bar dataKey="domains" fill={COLORS.secondary} name="Domeinen" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="rounded-2xl border-gray-200 shadow-sm hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-poppins font-semibold">
              <Users className="h-5 w-5 text-[#0065FF]" />
              Gebruikers Beheer
            </CardTitle>
            <CardDescription className="font-poppins font-medium">
              Beheer super-admin gebruikers en toegang
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              asChild
              className="w-full rounded-2xl bg-[#0065FF] hover:bg-[#0052CC] shadow-lg shadow-blue-500/25 font-poppins font-semibold"
            >
              <Link href="/admin/users">Gebruikers Bekijken</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-gray-200 shadow-sm hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-poppins font-semibold">
              <Building2 className="h-5 w-5 text-[#0065FF]" />
              Tenants Beheer
            </CardTitle>
            <CardDescription className="font-poppins font-medium">
              Beheer alle tenants en hun configuraties
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              asChild
              className="w-full rounded-2xl bg-[#0065FF] hover:bg-[#0052CC] shadow-lg shadow-blue-500/25 font-poppins font-semibold"
            >
              <Link href="/admin/tenants">Tenants Bekijken</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-gray-200 shadow-sm hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-poppins font-semibold">
              <Settings className="h-5 w-5 text-[#0065FF]" />
              Systeem Instellingen
            </CardTitle>
            <CardDescription className="font-poppins font-medium">
              Configureer platform instellingen en API's
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              asChild
              className="w-full rounded-2xl bg-[#0065FF] hover:bg-[#0052CC] shadow-lg shadow-blue-500/25 font-poppins font-semibold"
            >
              <Link href="/admin/settings">Instellingen Bekijken</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
