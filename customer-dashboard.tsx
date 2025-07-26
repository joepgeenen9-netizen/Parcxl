"use client"

import { useState, useEffect } from "react"
import { CustomerLayout } from "@/components/customer-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Package, Truck, Clock, CheckCircle, Plus, Search, Filter, Download, Eye } from "lucide-react"
import { createClient } from "@/lib/supabase"

interface UserData {
  first_name: string | null
  last_name: string | null
  user_type: "customer" | "admin"
}

export default function CustomerDashboard() {
  const [userData, setUserData] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function loadUserData() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("first_name, last_name, user_type")
            .eq("id", user.id)
            .single()

          if (profile) {
            setUserData(profile)
          }
        }
      } catch (error) {
        console.error("Error loading user data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadUserData()
  }, [supabase])

  if (isLoading) {
    return (
      <CustomerLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </CustomerLayout>
    )
  }

  const firstName = userData?.first_name || "Gebruiker"

  return (
    <CustomerLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">Welkom terug, {firstName}!</h1>
          <p className="text-blue-100">Hier is een overzicht van je zendingen en activiteiten.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Actieve Zendingen</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">+2 van vorige week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Transit</CardTitle>
              <Truck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">Onderweg naar bestemming</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Afgeleverd</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">156</div>
              <p className="text-xs text-muted-foreground">Deze maand</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Gemiddelde Tijd</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2.4d</div>
              <p className="text-xs text-muted-foreground">Leveringstijd</p>
            </CardContent>
          </Card>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Shipments */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Recente Zendingen</CardTitle>
                    <CardDescription>Je laatste verzendingen en hun status</CardDescription>
                  </div>
                  <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Nieuwe Zending
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      id: "PX-2024-001",
                      destination: "Amsterdam, NL",
                      status: "In Transit",
                      progress: 75,
                      statusColor: "bg-blue-500",
                    },
                    {
                      id: "PX-2024-002",
                      destination: "Rotterdam, NL",
                      status: "Delivered",
                      progress: 100,
                      statusColor: "bg-green-500",
                    },
                    {
                      id: "PX-2024-003",
                      destination: "Utrecht, NL",
                      status: "Processing",
                      progress: 25,
                      statusColor: "bg-yellow-500",
                    },
                    {
                      id: "PX-2024-004",
                      destination: "Den Haag, NL",
                      status: "Delayed",
                      progress: 60,
                      statusColor: "bg-red-500",
                    },
                  ].map((shipment) => (
                    <div key={shipment.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="font-medium">{shipment.id}</p>
                            <p className="text-sm text-muted-foreground">{shipment.destination}</p>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            <div className={`w-2 h-2 rounded-full ${shipment.statusColor} mr-2`}></div>
                            {shipment.status}
                          </Badge>
                        </div>
                        <Progress value={shipment.progress} className="h-2" />
                      </div>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Snelle Acties</CardTitle>
                <CardDescription>Veelgebruikte functies</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start bg-transparent" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Nieuwe Zending
                </Button>
                <Button className="w-full justify-start bg-transparent" variant="outline">
                  <Search className="h-4 w-4 mr-2" />
                  Track & Trace
                </Button>
                <Button className="w-full justify-start bg-transparent" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Labels Printen
                </Button>
                <Button className="w-full justify-start bg-transparent" variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Rapporten
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recente Activiteit</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { action: "Zending PX-2024-001 is onderweg", time: "2 uur geleden" },
                    { action: "Label geprint voor PX-2024-005", time: "4 uur geleden" },
                    { action: "Zending PX-2024-002 afgeleverd", time: "1 dag geleden" },
                    { action: "Nieuwe zending aangemaakt", time: "2 dagen geleden" },
                  ].map((activity, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <div className="flex-1">
                        <p className="text-sm">{activity.action}</p>
                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </CustomerLayout>
  )
}
