"use client"

import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table"

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Package,
  Printer,
  Edit,
  MapPin,
  Calendar,
  Barcode,
  Weight,
  Ruler,
  FileText,
  History,
  Building2,
  Mail,
  Phone,
  User,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { ProductDetail } from "./actions"
import { PrintLabelsModal } from "@/components/print-labels-modal"

interface ProductDetailPageClientProps {
  product: ProductDetail
}

// Add this after the imports at the top of the file
const animationStyles = `
  @keyframes ping {
    75%, 100% {
      transform: scale(2);
      opacity: 0;
    }
  }
  
  .animate-ping {
    animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
  }
  
  .animation-delay-300 {
    animation-delay: 300ms;
  }
`

export function ProductDetailPageClient({ product }: ProductDetailPageClientProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("voorraad")
  const [isDeleting, setIsDeleting] = useState(false)
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false)

  const handleBack = () => {
    router.push("/dashboard/fc/producten")
  }

  const handleEdit = () => {
    router.push(`/dashboard/fc/producten/${product.id}/edit`)
  }

  const handleDelete = async () => {
    if (!confirm("Weet je zeker dat je dit product wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.")) {
      return
    }

    setIsDeleting(true)
    try {
      // TODO: Implement delete functionality
      console.log("Delete product:", product.id)
    } catch (error) {
      console.error("Error deleting product:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  // Mock data for demonstration
  const stockLocations = [
    { id: "1", location_code: "A-01-01", quantity: 25 },
    { id: "2", location_code: "B-02-03", quantity: 15 },
    { id: "3", location_code: "C-01-05", quantity: 8 },
  ]

  const productLog = [
    {
      id: "1",
      date: "2024-01-15 14:30",
      user: "Jan Janssen",
      event: "Voorraad aangepast van 40 naar 48 stuks",
    },
    {
      id: "2",
      date: "2024-01-14 09:15",
      user: "Marie de Vries",
      event: "Product toegevoegd aan WooCommerce",
    },
    {
      id: "3",
      date: "2024-01-13 16:45",
      user: "Piet Bakker",
      event: "Productinformatie bijgewerkt",
    },
    {
      id: "4",
      date: "2024-01-12 11:20",
      user: "System",
      event: "Product aangemaakt",
    },
  ]

  // Get platforms for the product
  const getProductPlatforms = (): string[] => {
    const platforms: string[] = []
    if (product.platform) platforms.push(product.platform)
    if (product.platform_2) platforms.push(product.platform_2)
    if (product.platform_3) platforms.push(product.platform_3)
    if (product.platform_4) platforms.push(product.platform_4)
    if (product.platform_5) platforms.push(product.platform_5)
    if (product.platform_6) platforms.push(product.platform_6)
    return platforms
  }

  // Get platform logo
  const getPlatformLogo = (platform: string) => {
    const platformLogos: Record<string, string> = {
      "bol.com":
        "https://zffyxtcwojwyqppjlrdi.supabase.co/storage/v1/object/sign/integratie-logo/bol.webp?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9hZDkxMTA5Zi1kMDMyLTRhOWQtOTJmMC1iZjc2ZjI2NzBhZGMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbnRlZ3JhdGllLWxvZ28vYm9sLndlYnAiLCJpYXQiOjE3NTI3NTQ2NTcsImV4cCI6MTkxMDQzNDY1N30.bFaA8RwGz-__DlClfqiVnpm-e_LGOcGSZbOvG23VaHA",
      ccv: "https://zffyxtcwojwyqppjlrdi.supabase.co/storage/v1/object/sign/integratie-logo/CCV-icon.svg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9hZDkxMTA5Zi1kMDMyLTRhOWQtOTJmMC1iZjc2ZjI2NzBhZGMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbnRlZ3JhdGllLWxvZ28vQ0NWLWljb24uc3ZnIiwiaWF0IjoxNzUyNzU0Njc1LCJleHAiOjE5MTA0MzQ2NzV9.KIF3DH5IrQdJ38V__e8fCc11TmFwYTYPtLyY5LL5kNk",
      woocommerce:
        "https://zffyxtcwojwyqppjlrdi.supabase.co/storage/v1/object/sign/integratie-logo/woocommerce%20logo.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9hZDkxMTA5Zi1kMDMyLTRhOWQtOTJmMC1iZjc2ZjI2NzBhZGMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbnRlZ3JhdGllLWxvZ28vd29vY29tbWVyY2UgbG9nby5wbmciLCJpYXQiOjE3NTI3NTQ2OTgsImV4cCI6MTkxMDQzNDY5OH0.lV0k1IxXyNwtIhMR0vWSzGo2VbdnAjS4-R7GE-Rv2g4",
      shopify:
        "https://zffyxtcwojwyqppjlrdi.supabase.co/storage/v1/object/sign/integratie-logo/Web-Ready-Large-Shopify-icon-1536x1536.webp?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9hZDkxMTA5Zi1kMDMyLTRhOWQtOTJmMC1iZjc2ZjI2NzBhZGMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbnRlZ3JhdGllLWxvZ28vV2ViLVJlYWR5LUxhcmdlLVNob3BpZnktaWNvbi0xNTM2eDE1MzYud2VicCIsImlhdCI6MTc1Mjc1NDcxMCwiZXhwIjoxOTEwNDM0NzEwfQ.4Bg-ZvLZtmfNgVwve1_s5DDW_m_cb0zSG6aHGvaFnrw",
    }
    return platformLogos[platform.toLowerCase()] || "/placeholder.svg?height=32&width=120"
  }

  // Random badge for demonstration
  const getRandomBadge = () => {
    const badges = ["Brievenbuspakje", "Pakket"]
    return badges[Math.floor(Math.random() * badges.length)]
  }

  // Mock statistics
  const stats = {
    vrijeVoorraad: product.stock,
    pickbareVoorraad: Math.max(0, product.stock - 5),
    gereserveerd: 5,
    aantalKeerBesteld: Math.floor(Math.random() * 100) + 20,
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("nl-NL", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatDimensions = (dimensions: any) => {
    if (!dimensions) return "Niet opgegeven"
    if (typeof dimensions === "string") {
      try {
        dimensions = JSON.parse(dimensions)
      } catch {
        return dimensions
      }
    }
    if (dimensions.length && dimensions.width && dimensions.height) {
      return `${dimensions.length} × ${dimensions.width} × ${dimensions.height} cm`
    }
    return "Niet opgegeven"
  }

  const formatWeight = (weight: number | null) => {
    if (!weight) return "Niet opgegeven"
    return `${weight} gram`
  }

  const formatAddress = () => {
    const parts = []
    if (product.client_address_street && product.client_address_number) {
      parts.push(`${product.client_address_street} ${product.client_address_number}`)
    }
    if (product.client_address_postal_code && product.client_address_city) {
      parts.push(`${product.client_address_postal_code} ${product.client_address_city}`)
    }
    if (product.client_address_country) {
      parts.push(product.client_address_country)
    }
    return parts.length > 0 ? parts.join(", ") : "Geen adres opgegeven"
  }

  return (
    <div className="space-y-8 pb-8 md:pb-12">
      <style dangerouslySetInnerHTML={{ __html: animationStyles }} />
      {/* Breadcrumb */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          onClick={() => router.push("/dashboard/fc/producten")}
          className="text-[#0065FF] hover:text-[#0052CC] hover:bg-[#0065FF]/5 font-medium"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Terug naar producten
        </Button>
      </div>

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-4 mb-2">
            <h1 className="text-4xl font-bold text-slate-900">{product.name}</h1>
            <Badge className="bg-gradient-to-r from-[#0065FF] to-[#0052CC] text-white border-0 font-medium px-3 py-1">
              {getRandomBadge()}
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <Barcode className="w-4 h-4" />
            <span className="font-mono text-lg">{product.sku}</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            className="flex items-center gap-2 bg-transparent"
            onClick={() => setIsPrintModalOpen(true)}
          >
            <Printer className="w-4 h-4" />
            Labels printen
          </Button>
          <Button
            onClick={() => router.push(`/dashboard/fc/producten/${product.id}/edit`)}
            className="bg-gradient-to-r from-[#0065FF] to-[#0052CC] hover:from-[#0052CC] hover:to-[#0065FF] text-white shadow-[0_4px_12px_rgba(0,101,255,0.3)] hover:shadow-[0_6px_20px_rgba(0,101,255,0.4)] transition-all duration-300"
          >
            <Edit className="w-4 h-4 mr-2" />
            Product aanpassen
          </Button>
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Vrije Voorraad */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/50 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#0065FF] flex items-center justify-center">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">{stats.vrijeVoorraad}</div>
                <h3 className="text-sm font-semibold text-slate-900">Vrije voorraad</h3>
                <p className="text-xs text-slate-500">Direct beschikbaar</p>
              </div>
            </div>
          </div>
        </div>

        {/* Pickbare Voorraad */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/50 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-500 flex items-center justify-center">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">{stats.pickbareVoorraad}</div>
                <h3 className="text-sm font-semibold text-slate-900">Pickbare voorraad</h3>
                <p className="text-xs text-slate-500">Klaar voor verzending</p>
              </div>
            </div>
          </div>
        </div>

        {/* Gereserveerd */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/50 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-orange-500 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">{stats.gereserveerd}</div>
                <h3 className="text-sm font-semibold text-slate-900">Gereserveerd</h3>
                <p className="text-xs text-slate-500">Voor openstaande orders</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Two-Column Layout: Product Image & Selling Platforms */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Product Image with Animated Price Tag */}
        <div className="bg-gradient-to-br from-white/95 to-white/90 backdrop-blur-[25px] rounded-3xl p-8 border border-[#0065FF]/[0.12] shadow-[0_8px_32px_rgba(0,101,255,0.08)] hover:shadow-[0_12px_40px_rgba(0,101,255,0.12)] transition-all duration-500">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Productafbeelding</h2>
          <div className="relative aspect-square bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl overflow-hidden group">
            {/* Product Image */}
            <div className="absolute inset-0 flex items-center justify-center">
              {product.image_url ? (
                <img
                  src={product.image_url || "/placeholder.svg"}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.style.display = "none"
                    target.nextElementSibling?.classList.remove("hidden")
                  }}
                />
              ) : null}
              <div className={`${product.image_url ? "hidden" : ""} text-slate-400 text-center`}>
                <Package className="w-24 h-24 mx-auto mb-4 text-slate-300" />
                <p className="text-lg font-medium">Geen afbeelding beschikbaar</p>
              </div>
            </div>

            {/* Animated Price Tag */}
            <div className="absolute top-4 right-4 group-hover:animate-pulse">
              <div className="relative">
                {/* Price Tag Background */}
                <div className="bg-gradient-to-r from-[#0065FF] to-[#0052CC] text-white px-4 py-2 rounded-lg shadow-lg transform rotate-3 group-hover:rotate-6 transition-transform duration-300">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold">€</span>
                    <span className="text-lg font-bold">{(Math.random() * 100 + 10).toFixed(2)}</span>
                  </div>
                </div>

                {/* Price Tag Hole */}
                <div className="absolute -left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-white rounded-full border-2 border-[#0065FF]/20"></div>

                {/* Animated Sparkles */}
              </div>
            </div>

            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
        </div>

        {/* Right Column - Selling Platforms */}
        <div className="bg-gradient-to-br from-white/95 to-white/90 backdrop-blur-[25px] rounded-3xl p-8 border border-[#0065FF]/[0.12] shadow-[0_8px_32px_rgba(0,101,255,0.08)] hover:shadow-[0_12px_40px_rgba(0,101,255,0.12)] transition-all duration-500">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Verkoopplatforms</h2>
          <div className="space-y-6">
            {getProductPlatforms().length > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                {getProductPlatforms().map((platform, index) => (
                  <div
                    key={index}
                    className="group relative bg-white/50 backdrop-blur-sm rounded-2xl p-4 border border-[#0065FF]/10 hover:border-[#0065FF]/20 hover:shadow-lg transition-all duration-300 cursor-pointer"
                  >
                    <div className="flex flex-col items-center space-y-3">
                      <div className="w-16 h-16 flex items-center justify-center bg-white rounded-xl shadow-sm group-hover:shadow-md transition-shadow duration-300">
                        <img
                          src={getPlatformLogo(platform) || "/placeholder.svg?height=48&width=80"}
                          alt={`${platform} logo`}
                          className="h-12 w-auto object-contain group-hover:scale-110 transition-transform duration-300"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.src = "/placeholder.svg?height=48&width=80"
                          }}
                        />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-semibold text-slate-900 capitalize">{platform}</p>
                        <p className="text-xs text-slate-500 mt-1">Actief</p>
                      </div>
                    </div>

                    {/* Active Indicator */}
                    <div className="absolute top-2 right-2 w-3 h-3 bg-green-500 rounded-full shadow-sm animate-pulse"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Package className="w-8 h-8 text-slate-400" />
                </div>
                <p className="text-slate-500 italic">Geen verkoopplatforms geconfigureerd</p>
                <Button
                  variant="outline"
                  className="mt-4 text-[#0065FF] border-[#0065FF]/20 hover:bg-[#0065FF]/5 hover:border-[#0065FF]/30 bg-transparent"
                >
                  Platform toevoegen
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabbed Interface */}
      <div className="bg-white rounded-3xl border border-slate-200/50 shadow-[0_4px_20px_rgba(0,0,0,0.08)] overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Modern Tab Navigation */}
          <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50/50 to-white px-6 py-4">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 gap-2 bg-slate-100/50 p-1 rounded-2xl h-auto">
              <TabsTrigger
                value="voorraad"
                className="data-[state=active]:bg-white data-[state=active]:text-[#0065FF] data-[state=active]:shadow-sm font-medium rounded-xl px-4 py-3 text-sm transition-all duration-300 hover:bg-white/50 flex items-center justify-center gap-2 min-h-[48px]"
              >
                <Package className="w-4 h-4" />
                <span className="hidden sm:inline">Voorraad details</span>
                <span className="sm:hidden">Voorraad</span>
              </TabsTrigger>
              <TabsTrigger
                value="productinfo"
                className="data-[state=active]:bg-white data-[state=active]:text-[#0065FF] data-[state=active]:shadow-sm font-medium rounded-xl px-4 py-3 text-sm transition-all duration-300 hover:bg-white/50 flex items-center justify-center gap-2 min-h-[48px]"
              >
                <FileText className="w-4 h-4" />
                <span className="hidden sm:inline">Productinformatie</span>
                <span className="sm:hidden">Product</span>
              </TabsTrigger>
              <TabsTrigger
                value="klantinfo"
                className="data-[state=active]:bg-white data-[state=active]:text-[#0065FF] data-[state=active]:shadow-sm font-medium rounded-xl px-4 py-3 text-sm transition-all duration-300 hover:bg-white/50 flex items-center justify-center gap-2 min-h-[48px]"
              >
                <Building2 className="w-4 h-4" />
                <span className="hidden sm:inline">Klantinformatie</span>
                <span className="sm:hidden">Klant</span>
              </TabsTrigger>
              <TabsTrigger
                value="logboek"
                className="data-[state=active]:bg-white data-[state=active]:text-[#0065FF] data-[state=active]:shadow-sm font-medium rounded-xl px-4 py-3 text-sm transition-all duration-300 hover:bg-white/50 flex items-center justify-center gap-2 min-h-[48px]"
              >
                <History className="w-4 h-4" />
                <span className="hidden sm:inline">Logboek</span>
                <span className="sm:hidden">Log</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="voorraad" className="p-6 md:p-8">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-900">Voorraadlocaties</h3>
                <Button size="sm" className="bg-[#0065FF] hover:bg-[#0052CC] text-white shadow-sm">
                  <Package className="w-4 h-4 mr-2" />
                  Nieuwe locatie
                </Button>
              </div>

              {/* Mobile Card View */}
              <div className="block md:hidden space-y-4">
                {stockLocations.map((location) => (
                  <div key={location.id} className="bg-slate-50/50 rounded-2xl p-4 border border-slate-200/50">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#0065FF]/10 flex items-center justify-center">
                          <MapPin className="w-5 h-5 text-[#0065FF]" />
                        </div>
                        <div>
                          <p className="font-mono font-bold text-slate-900">{location.location_code}</p>
                          <p className="text-sm text-slate-500">Locatiecode</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-slate-900">{location.quantity}</p>
                        <p className="text-sm text-slate-500">Stuks</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 hover:bg-[#0065FF]/5 hover:border-[#0065FF]/20 hover:text-[#0065FF] bg-white"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Wijzigen
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 hover:bg-[#0065FF]/5 hover:border-[#0065FF]/20 hover:text-[#0065FF] bg-white"
                      >
                        <MapPin className="w-4 h-4 mr-2" />
                        Verplaatsen
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block bg-white rounded-2xl border border-slate-200/50 overflow-hidden shadow-sm">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gradient-to-r from-slate-50 to-slate-100/50 border-b border-slate-200">
                      <TableHead className="font-bold text-slate-900 py-4">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-[#0065FF]" />
                          Locatiecode
                        </div>
                      </TableHead>
                      <TableHead className="font-bold text-slate-900 py-4">
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-[#0065FF]" />
                          Aantal
                        </div>
                      </TableHead>
                      <TableHead className="font-bold text-slate-900 py-4">Acties</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stockLocations.map((location) => (
                      <TableRow
                        key={location.id}
                        className="hover:bg-slate-50/50 transition-colors duration-200 border-b border-slate-100/50"
                      >
                        <TableCell className="font-mono font-bold text-slate-900 py-4">
                          {location.location_code}
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-[#0065FF]/10 flex items-center justify-center">
                              <span className="text-sm font-bold text-[#0065FF]">{location.quantity}</span>
                            </div>
                            <span className="font-bold text-slate-900">{location.quantity} stuks</span>
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="hover:bg-[#0065FF]/5 hover:border-[#0065FF]/20 hover:text-[#0065FF] bg-white"
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Wijzigen
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="hover:bg-[#0065FF]/5 hover:border-[#0065FF]/20 hover:text-[#0065FF] bg-white"
                            >
                              <MapPin className="w-4 h-4 mr-2" />
                              Verplaatsen
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="productinfo" className="p-6 md:p-8">
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-slate-900">Productinformatie</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-white to-slate-50/50 rounded-2xl p-6 border border-slate-200/50 shadow-sm">
                    <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-[#0065FF]/10 flex items-center justify-center">
                        <FileText className="w-4 h-4 text-[#0065FF]" />
                      </div>
                      Basisinformatie
                    </h4>
                    <dl className="space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <dt className="text-sm font-medium text-slate-600 min-w-[120px]">Naam</dt>
                        <dd className="text-slate-900 font-medium">{product.name}</dd>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-start gap-2">
                        <dt className="text-sm font-medium text-slate-600 min-w-[120px]">Beschrijving</dt>
                        <dd className="text-slate-900">{product.description || "Geen beschrijving"}</dd>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <dt className="text-sm font-medium text-slate-600 min-w-[120px]">SKU</dt>
                        <dd className="font-mono text-slate-900 bg-slate-100 px-2 py-1 rounded text-sm">
                          {product.sku}
                        </dd>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <dt className="text-sm font-medium text-slate-600 min-w-[120px]">Artikelnummer</dt>
                        <dd className="font-mono text-slate-900 bg-slate-100 px-2 py-1 rounded text-sm">
                          {product.article_number || "Niet opgegeven"}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-white to-slate-50/50 rounded-2xl p-6 border border-slate-200/50 shadow-sm">
                    <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                        <Ruler className="w-4 h-4 text-green-600" />
                      </div>
                      Fysieke eigenschappen
                    </h4>
                    <dl className="space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <dt className="text-sm font-medium text-slate-600 flex items-center gap-2 min-w-[120px]">
                          <Weight className="w-4 h-4" />
                          Gewicht
                        </dt>
                        <dd className="text-slate-900 font-medium">
                          {product.weight_grams ? `${product.weight_grams}g` : "Niet opgegeven"}
                        </dd>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <dt className="text-sm font-medium text-slate-600 flex items-center gap-2 min-w-[120px]">
                          <Ruler className="w-4 h-4" />
                          Afmetingen
                        </dt>
                        <dd className="text-slate-900 font-medium">{formatDimensions(product.dimensions_cm)}</dd>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <dt className="text-sm font-medium text-slate-600 flex items-center gap-2 min-w-[120px]">
                          <Barcode className="w-4 h-4" />
                          Barcode
                        </dt>
                        <dd className="font-mono text-slate-900 bg-slate-100 px-2 py-1 rounded text-sm">
                          {product.barcode || "Niet opgegeven"}
                        </dd>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <dt className="text-sm font-medium text-slate-600 flex items-center gap-2 min-w-[120px]">
                          <MapPin className="w-4 h-4" />
                          Standaardlocatie
                        </dt>
                        <dd className="font-mono text-slate-900 bg-slate-100 px-2 py-1 rounded text-sm">
                          {product.location || "Niet opgegeven"}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="klantinfo" className="p-6 md:p-8">
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-slate-900">Klantinformatie</h3>
              <div className="bg-gradient-to-br from-white to-slate-50/50 rounded-2xl p-6 border border-slate-200/50 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-start gap-6">
                  {/* Client Logo */}
                  <div className="flex-shrink-0 mx-auto md:mx-0">
                    <div className="w-20 h-20 rounded-2xl bg-white border border-[#0065FF]/10 shadow-sm flex items-center justify-center p-3">
                      {product.client_logo_url ? (
                        <img
                          src={product.client_logo_url || "/placeholder.svg"}
                          alt={`${product.client_company_name} logo`}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.style.display = "none"
                            target.nextElementSibling?.classList.remove("hidden")
                          }}
                        />
                      ) : null}
                      <Building2 className={`w-10 h-10 text-[#0065FF] ${product.client_logo_url ? "hidden" : ""}`} />
                    </div>
                  </div>

                  {/* Client Details */}
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-xl font-bold text-slate-900 mb-2">{product.client_company_name}</h4>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Badge
                            className={`${
                              product.client_status === "active"
                                ? "bg-green-100 text-green-800 border-green-200"
                                : "bg-red-100 text-red-800 border-red-200"
                            } font-medium`}
                          >
                            {product.client_status === "active" ? "Actief" : "Inactief"}
                          </Badge>
                        </div>
                      </div>

                      {product.client_contact_person && (
                        <div className="flex items-center gap-2 text-slate-700">
                          <User className="w-4 h-4 text-[#0065FF]" />
                          <span className="font-medium">Contactpersoon:</span>
                          <span>{product.client_contact_person}</span>
                        </div>
                      )}

                      {product.client_email && (
                        <div className="flex items-center gap-2 text-slate-700">
                          <Mail className="w-4 h-4 text-[#0065FF]" />
                          <span className="font-medium">E-mail:</span>
                          <a
                            href={`mailto:${product.client_email}`}
                            className="text-[#0065FF] hover:text-[#0052CC] hover:underline"
                          >
                            {product.client_email}
                          </a>
                        </div>
                      )}

                      {product.client_phone && (
                        <div className="flex items-center gap-2 text-slate-700">
                          <Phone className="w-4 h-4 text-[#0065FF]" />
                          <span className="font-medium">Telefoon:</span>
                          <a
                            href={`tel:${product.client_phone}`}
                            className="text-[#0065FF] hover:text-[#0052CC] hover:underline"
                          >
                            {product.client_phone}
                          </a>
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center gap-2 text-slate-700 mb-2">
                          <MapPin className="w-4 h-4 text-[#0065FF]" />
                          <span className="font-medium">Adres:</span>
                        </div>
                        <div className="text-slate-600 text-sm leading-relaxed ml-6">{formatAddress()}</div>
                      </div>

                      <div className="pt-4">
                        <Button
                          variant="outline"
                          onClick={() => router.push(`/dashboard/fc/klanten/${product.client_id}`)}
                          className="w-full md:w-auto text-[#0065FF] border-[#0065FF]/20 hover:bg-[#0065FF]/5 hover:border-[#0065FF]/30"
                        >
                          <Building2 className="w-4 h-4 mr-2" />
                          Bekijk klantdetails
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="logboek" className="p-6 md:p-8">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-900">Productlogboek</h3>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-[#0065FF] border-[#0065FF]/20 hover:bg-[#0065FF]/5 bg-transparent"
                >
                  <History className="w-4 h-4 mr-2" />
                  Exporteren
                </Button>
              </div>

              {/* Mobile Card View */}
              <div className="block md:hidden space-y-4">
                {productLog.map((entry) => (
                  <div key={entry.id} className="bg-slate-50/50 rounded-2xl p-4 border border-slate-200/50">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                        <History className="w-5 h-5 text-purple-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-slate-700 text-sm mb-2">{entry.event}</p>
                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <span className="font-medium">{entry.user}</span>
                          <span className="font-mono">{entry.date}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block bg-white rounded-2xl border border-slate-200/50 overflow-hidden shadow-sm">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gradient-to-r from-slate-50 to-slate-100/50 border-b border-slate-200">
                      <TableHead className="font-bold text-slate-900 py-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-[#0065FF]" />
                          Datum
                        </div>
                      </TableHead>
                      <TableHead className="font-bold text-slate-900 py-4">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-[#0065FF]" />
                          Gebruiker
                        </div>
                      </TableHead>
                      <TableHead className="font-bold text-slate-900 py-4">
                        <div className="flex items-center gap-2">
                          <History className="w-4 h-4 text-[#0065FF]" />
                          Gebeurtenis
                        </div>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {productLog.map((entry) => (
                      <TableRow
                        key={entry.id}
                        className="hover:bg-slate-50/50 transition-colors duration-200 border-b border-slate-100/50"
                      >
                        <TableCell className="font-mono text-sm py-4 text-slate-600">{entry.date}</TableCell>
                        <TableCell className="font-medium py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                              <User className="w-4 h-4 text-purple-600" />
                            </div>
                            {entry.user}
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-700 py-4">{entry.event}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      {/* Print Labels Modal */}
      <PrintLabelsModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        product={{
          id: product.id,
          name: product.name,
          sku: product.sku,
          barcode: product.barcode,
        }}
      />
    </div>
  )
}
