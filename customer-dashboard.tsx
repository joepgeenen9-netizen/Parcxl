"use client"

import { useState, useEffect } from "react"
import { CustomerLayout } from "@/components/customer-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Package,
  Plus,
  Search,
  Truck,
  Clock,
  CheckCircle,
  AlertCircle,
  MapPin,
  Calendar,
  User,
  Mail,
  Phone,
} from "lucide-react"
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

  const firstName = userData?.first_name || "Klant"

  return (
    <CustomerLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">Welkom terug, {firstName}!</h1>
          <p className="text-blue-100">Beheer je zendingen en bekijk je verzendhistorie.</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Actieve Zendingen</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">+2 deze week</p>
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
              <CardTitle className="text-sm font-medium">Totaal Kosten</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">€1,234</div>
              <p className="text-xs text-muted-foreground">Deze maand</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Tabs */}
        <Tabs defaultValue="shipments" className="space-y-4">
          <TabsList>
            <TabsTrigger value="shipments">Mijn Zendingen</TabsTrigger>
            <TabsTrigger value="create">Nieuwe Zending</TabsTrigger>
            <TabsTrigger value="history">Geschiedenis</TabsTrigger>
            <TabsTrigger value="profile">Profiel</TabsTrigger>
          </TabsList>

          <TabsContent value="shipments" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Actieve Zendingen</CardTitle>
                    <CardDescription>Overzicht van al je lopende zendingen</CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="Zoek zendingen..." className="pl-8 w-64" />
                    </div>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Nieuwe Zending
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      id: "PX789012345",
                      destination: "Amsterdam, Nederland",
                      status: "In Transit",
                      date: "2025-01-26",
                      statusColor: "bg-blue-500",
                    },
                    {
                      id: "PX789012346",
                      destination: "Rotterdam, Nederland",
                      status: "Processing",
                      date: "2025-01-25",
                      statusColor: "bg-yellow-500",
                    },
                    {
                      id: "PX789012347",
                      destination: "Utrecht, Nederland",
                      status: "Delivered",
                      date: "2025-01-24",
                      statusColor: "bg-green-500",
                    },
                    {
                      id: "PX789012348",
                      destination: "Den Haag, Nederland",
                      status: "Pending",
                      date: "2025-01-23",
                      statusColor: "bg-gray-500",
                    },
                  ].map((shipment, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`w-3 h-3 rounded-full ${shipment.statusColor}`}></div>
                        <div>
                          <p className="font-medium">{shipment.id}</p>
                          <p className="text-sm text-muted-foreground flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            {shipment.destination}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <Badge variant={shipment.status === "Delivered" ? "default" : "secondary"}>
                            {shipment.status}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1 flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {shipment.date}
                          </p>
                        </div>
                        <Button variant="ghost" size="sm">
                          Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="create" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Nieuwe Zending Aanmaken</CardTitle>
                <CardDescription>Vul de gegevens in voor je nieuwe zending</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Afzender</h3>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Naam</label>
                      <Input placeholder="Jouw naam" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Adres</label>
                      <Input placeholder="Straat en huisnummer" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Postcode</label>
                        <Input placeholder="1234AB" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Plaats</label>
                        <Input placeholder="Amsterdam" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Ontvanger</h3>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Naam</label>
                      <Input placeholder="Naam ontvanger" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Adres</label>
                      <Input placeholder="Straat en huisnummer" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Postcode</label>
                        <Input placeholder="5678CD" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Plaats</label>
                        <Input placeholder="Rotterdam" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t">
                  <h3 className="text-lg font-semibold mb-4">Pakket Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Gewicht (kg)</label>
                      <Input type="number" placeholder="2.5" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Lengte (cm)</label>
                      <Input type="number" placeholder="30" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Breedte (cm)</label>
                      <Input type="number" placeholder="20" />
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-2">
                  <Button variant="outline">Opslaan als Concept</Button>
                  <Button>Zending Aanmaken</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Verzendhistorie</CardTitle>
                <CardDescription>Alle je vorige zendingen</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Geschiedenis wordt geladen...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Profiel Instellingen</CardTitle>
                <CardDescription>Beheer je account gegevens</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center">
                        <User className="h-4 w-4 mr-2" />
                        Voornaam
                      </label>
                      <Input value={userData?.first_name || ""} placeholder="Voornaam" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center">
                        <User className="h-4 w-4 mr-2" />
                        Achternaam
                      </label>
                      <Input value={userData?.last_name || ""} placeholder="Achternaam" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center">
                      <Mail className="h-4 w-4 mr-2" />
                      E-mailadres
                    </label>
                    <Input type="email" placeholder="je@email.com" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center">
                      <Phone className="h-4 w-4 mr-2" />
                      Telefoonnummer
                    </label>
                    <Input type="tel" placeholder="+31 6 12345678" />
                  </div>

                  <div className="pt-4 border-t">
                    <Button>Profiel Bijwerken</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </CustomerLayout>
  )
}
