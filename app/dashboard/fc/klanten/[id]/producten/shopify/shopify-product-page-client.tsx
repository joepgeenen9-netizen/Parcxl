"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, RefreshCw, Package, Plus, Search, Tag, Eye, Check, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import FCLayout from "../../../_components/fc-layout"
import { fetchShopifyProducts, importSelectedShopifyProducts } from "./actions"
import Image from "next/image"

interface TenantUser {
  id: string
  tenant_id: string
  username: string
  email: string
  is_admin: boolean
}

interface ShopifyIntegration {
  id: string
  client_id: string
  tenant_id: string
  platform: string
  domain: string
  api_key: string
  active: boolean
  created_at: string
}

interface ProcessedProduct {
  name: string
  sku: string
  price: number
  weight: number
  weight_unit: string
  stock: number
  description: string
  image_url: string | null
  product_id: string
  platform: string
  status: "new" | "existing" | "koppelen"
  attributes?: string
  variant_title?: string
}

interface ShopifyProductPageClientProps {
  tenant: any
  user: TenantUser
  clientDetails: any
  clientId: string
  shopifyIntegrations: ShopifyIntegration[]
}

export function ShopifyProductPageClient({
  tenant,
  user,
  clientDetails,
  clientId,
  shopifyIntegrations,
}: ShopifyProductPageClientProps) {
  const router = useRouter()
  const { toast } = useToast()

  const [selectedIntegration, setSelectedIntegration] = useState<ShopifyIntegration | null>(
    shopifyIntegrations[0] || null,
  )
  const [products, setProducts] = useState<ProcessedProduct[]>([])
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "new" | "existing" | "koppelen">("all")

  // Auto-fetch products when component mounts or integration changes
  useEffect(() => {
    if (selectedIntegration) {
      handleFetchProducts()
    }
  }, [selectedIntegration])

  const handleFetchProducts = async () => {
    if (!selectedIntegration) return

    setIsLoading(true)
    try {
      const result = await fetchShopifyProducts(selectedIntegration.id, clientId, user.tenant_id)

      if (result.error) {
        toast({
          title: "Fout bij ophalen producten",
          description: result.error,
          variant: "destructive",
        })
      } else if (result.data) {
        setProducts(result.data)
        toast({
          title: "Producten opgehaald",
          description: `${result.data.length} producten gevonden van Shopify`,
        })
      }
    } catch (error) {
      toast({
        title: "Fout",
        description: "Er is een onverwachte fout opgetreden",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleImportProducts = async () => {
    if (selectedProducts.size === 0) {
      toast({
        title: "Geen producten geselecteerd",
        description: "Selecteer eerst producten om te importeren",
        variant: "destructive",
      })
      return
    }

    if (!selectedIntegration) return

    setIsImporting(true)
    try {
      const productsToImport = products.filter((p) => selectedProducts.has(p.sku))
      const result = await importSelectedShopifyProducts(
        productsToImport,
        selectedIntegration.id,
        clientId,
        user.tenant_id,
      )

      if (result.success) {
        toast({
          title: "Import voltooid",
          description: result.message,
        })
        setSelectedProducts(new Set())
        // Refresh products to update statuses
        await handleFetchProducts()
      } else {
        toast({
          title: "Import mislukt",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Fout",
        description: "Er is een onverwachte fout opgetreden tijdens het importeren",
        variant: "destructive",
      })
    } finally {
      setIsImporting(false)
    }
  }

  const handleSelectAll = () => {
    const selectableProducts = filteredProducts.filter((p) => p.status !== "existing")
    if (selectedProducts.size === selectableProducts.length) {
      setSelectedProducts(new Set())
    } else {
      setSelectedProducts(new Set(selectableProducts.map((p) => p.sku)))
    }
  }

  const handleProductSelect = (sku: string) => {
    const newSelected = new Set(selectedProducts)
    if (newSelected.has(sku)) {
      newSelected.delete(sku)
    } else {
      newSelected.add(sku)
    }
    setSelectedProducts(newSelected)
  }

  const handleRowClick = (sku: string, e: React.MouseEvent) => {
    // Prevent row click when clicking on action buttons
    if ((e.target as HTMLElement).closest("button")) {
      return
    }
    handleProductSelect(sku)
  }

  const getStatusBadge = (status: ProcessedProduct["status"]) => {
    switch (status) {
      case "new":
        return (
          <Badge className="bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 border-emerald-200 hover:from-emerald-200 hover:to-green-200 transition-all duration-300 shadow-sm">
            <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse"></div>
            Nieuw
          </Badge>
        )
      case "existing":
        return (
          <Badge className="bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border-blue-200 hover:from-blue-200 hover:to-indigo-200 transition-all duration-300 shadow-sm">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
            Bestaand
          </Badge>
        )
      case "koppelen":
        return (
          <Badge className="bg-gradient-to-r from-orange-100 to-amber-100 text-orange-800 border-orange-200 hover:from-orange-200 hover:to-amber-200 transition-all duration-300 shadow-sm">
            <Tag className="w-3 h-3 mr-2" />
            Koppelen
          </Badge>
        )
      default:
        return <Badge variant="secondary">Onbekend</Badge>
    }
  }

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || product.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const stats = {
    total: products.length,
    new: products.filter((p) => p.status === "new").length,
    existing: products.filter((p) => p.status === "existing").length,
    koppelen: products.filter((p) => p.status === "koppelen").length,
  }

  // Helper function to get clean domain name
  const getDisplayDomain = (integration: ShopifyIntegration | null) => {
    if (!integration?.domain) return "Shopify Producten"

    // Remove protocol and www if present
    return integration.domain
      .replace(/^https?:\/\//, "")
      .replace(/^www\./, "")
      .split("/")[0] // Remove any path
  }

  return (
    <FCLayout user={user} tenant={tenant} searchPlaceholder="Zoek producten...">
      <div className="space-y-8 pb-16 md:pb-12">
        {/* Terug knop */}
        <div className="animate-in slide-in-from-left-5 duration-300">
          <Button
            variant="ghost"
            onClick={() => router.push(`/dashboard/fc/klanten/${clientId}`)}
            className="p-0 h-auto text-slate-600 hover:text-slate-900 transition-all duration-200 hover:translate-x-1"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Terug naar klant
          </Button>
        </div>

        {/* Header met Shopify branding */}
        <div className="animate-in slide-in-from-top-5 duration-500 delay-100">
          <div className="bg-gradient-to-r from-green-50 via-emerald-50 to-green-50 rounded-2xl p-8 border shadow-lg relative overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-full transform translate-x-16 -translate-y-16 animate-pulse" />
            <div
              className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-emerald-500/10 to-green-500/10 rounded-full transform -translate-x-12 translate-y-12 animate-pulse"
              style={{ animationDelay: "1s" }}
            />

            <div className="relative z-10 flex items-center gap-6">
              <div className="rounded-xl p-2 bg-white/80 backdrop-blur-sm shadow-lg">
                <Image
                  src="https://zffyxtcwojwyqppjlrdi.supabase.co/storage/v1/object/sign/integratie-logo/Web-Ready-Large-Shopify-icon-1536x1536.webp?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9hZDkxMTA5Zi1kMDMyLTRhOWQtOTJmMC1iZjc2ZjI2NzBhZGMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbnRlZ3JhdGllLWxvZ28vV2ViLVJlYWR5LUxhcmdlLVNob3BpZnktaWNvbi0xNTM2eDE1MzYud2VicCIsImlhdCI6MTc1MjAwNDUzMCwiZXhwIjoxOTA5Njg0NTMwfQ.LDLl5qlby1nmYm2lsEjrV7hPgUydaiVoIouQs9waidk"
                  alt="Shopify"
                  width={64}
                  height={64}
                  className="w-16 h-16"
                />
              </div>
              <div className="flex-1">
                {/* Title with dropdown for multiple integrations */}
                {shopifyIntegrations.length > 1 ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="p-0 h-auto text-left justify-start hover:bg-transparent focus:outline-none focus:ring-0 focus:border-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                      >
                        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
                          {getDisplayDomain(selectedIntegration)}
                          <ChevronDown className="w-6 h-6 text-slate-600" />
                        </h1>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-80">
                      {shopifyIntegrations.map((integration) => (
                        <DropdownMenuItem
                          key={integration.id}
                          onClick={() => {
                            setSelectedIntegration(integration)
                            setProducts([])
                            setSelectedProducts(new Set())
                          }}
                          className="cursor-pointer"
                        >
                          <div className="flex flex-col">
                            <span className="font-medium">{getDisplayDomain(integration)}</span>
                            <span className="text-sm text-slate-500">Shopify Store</span>
                          </div>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <h1 className="text-3xl font-bold mb-2 text-slate-900">{getDisplayDomain(selectedIntegration)}</h1>
                )}

                <p className="text-slate-600 text-lg mt-2">
                  Import products from your Shopify store to {clientDetails.company_name || clientDetails.name}
                </p>

                {/* Status overview */}
                {products.length > 0 && (
                  <div className="flex gap-4 mt-4">
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                      <span className="text-slate-600">{stats.new} nieuw</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <span className="text-slate-600">{stats.koppelen} te koppelen</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-slate-600">{stats.existing} bestaand</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="animate-in slide-in-from-top-5 duration-500 delay-200">
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-lg p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl">
                  <Package className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">Beschikbare Producten</h2>
                  <p className="text-slate-600 text-sm sm:text-base">
                    Selecteer producten om toe te voegen of te koppelen aan je voorraad
                  </p>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center flex-1">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Zoek producten..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 w-full"
                  />
                </div>

                {/* Status Filter */}
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-48 border-slate-200 rounded-xl focus:ring-0 focus:ring-offset-0">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle statussen</SelectItem>
                    <SelectItem value="new">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                        Nieuw
                      </div>
                    </SelectItem>
                    <SelectItem value="koppelen">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        Te koppelen
                      </div>
                    </SelectItem>
                    <SelectItem value="existing">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        Bestaand
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                {/* Refresh Products Button - Shopify colors */}
                <Button
                  onClick={handleFetchProducts}
                  disabled={isLoading || !selectedIntegration}
                  className="relative overflow-hidden bg-gradient-to-r from-[#95BF47] via-[#7AB55C] to-[#5E8E3E] hover:from-[#7AB55C] hover:via-[#5E8E3E] hover:to-[#4A7C59] text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 rounded-xl whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  {/* Animated background */}
                  <div className="absolute inset-0 bg-gradient-to-r from-[#7AB55C] via-[#5E8E3E] to-[#4A7C59] opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>

                  {/* Loading sparkles */}
                  {isLoading && (
                    <div className="absolute inset-0 overflow-hidden">
                      <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-white rounded-full animate-ping"></div>
                      <div
                        className="absolute top-3/4 right-1/4 w-1 h-1 bg-white rounded-full animate-ping"
                        style={{ animationDelay: "0.3s" }}
                      ></div>
                      <div
                        className="absolute bottom-1/4 left-3/4 w-1 h-1 bg-white rounded-full animate-ping"
                        style={{ animationDelay: "0.6s" }}
                      ></div>
                    </div>
                  )}

                  <div className="relative flex items-center gap-2">
                    <div className="p-1 bg-white/20 rounded-md">
                      {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                    </div>
                    <span className="font-medium">{isLoading ? "Synchroniseren..." : "Synchroniseren"}</span>
                  </div>

                  {/* Shimmer effect when loading */}
                  {isLoading && (
                    <div className="absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
                  )}
                </Button>

                {/* Process Products Button - Shopify colors */}
                {selectedProducts.size > 0 && (
                  <Button
                    onClick={handleImportProducts}
                    disabled={isImporting}
                    className="relative overflow-hidden bg-gradient-to-r from-[#95BF47] via-[#7AB55C] to-[#5E8E3E] hover:from-[#7AB55C] hover:via-[#5E8E3E] hover:to-[#4A7C59] text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed group"
                  >
                    {/* Animated background */}
                    <div className="absolute inset-0 bg-gradient-to-r from-[#7AB55C] via-[#5E8E3E] to-[#4A7C59] opacity-0 group-hover:opacity-40 transition-opacity duration-300"></div>

                    {/* Sparkle animation when importing */}
                    {isImporting && (
                      <div className="absolute inset-0 overflow-hidden">
                        <div className="absolute top-1/2 left-1/4 w-1 h-1 bg-white rounded-full animate-ping"></div>
                        <div
                          className="absolute top-1/3 right-1/4 w-1 h-1 bg-white rounded-full animate-ping"
                          style={{ animationDelay: "0.5s" }}
                        ></div>
                        <div
                          className="absolute bottom-1/3 left-1/3 w-1 h-1 bg-white rounded-full animate-ping"
                          style={{ animationDelay: "1s" }}
                        ></div>
                        <div
                          className="absolute top-2/3 right-1/3 w-1 h-1 bg-yellow-200 rounded-full animate-ping"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                        <div
                          className="absolute bottom-1/2 left-2/3 w-1 h-1 bg-yellow-200 rounded-full animate-ping"
                          style={{ animationDelay: "0.8s" }}
                        ></div>
                      </div>
                    )}

                    <div className="relative flex items-center gap-2">
                      <div className="p-1 bg-white/30 rounded-md shadow-sm">
                        {isImporting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                      </div>
                      <span className="font-semibold">
                        {isImporting
                          ? "Verwerken..."
                          : `${selectedProducts.size} Product${selectedProducts.size !== 1 ? "en" : ""} Verwerken`}
                      </span>
                    </div>

                    {/* Enhanced shimmer effect */}
                    {isImporting && (
                      <div className="absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                    )}

                    {/* Glow effect */}
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#95BF47]/20 via-[#7AB55C]/20 to-[#5E8E3E]/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Producten tabel */}
        <div className="animate-in slide-in-from-bottom-5 duration-500 delay-300">
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-xl overflow-hidden">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center gap-3">
                  <RefreshCw className="w-6 h-6 animate-spin text-green-600" />
                  <span className="text-slate-600">Producten laden...</span>
                </div>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Package className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">Geen producten gevonden</h3>
                  <p className="text-slate-600">
                    {products.length === 0
                      ? "Producten worden automatisch geladen uit je Shopify winkel."
                      : "Geen producten gevonden die voldoen aan de filters."}
                  </p>
                </div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-slate-50/80 to-slate-100/80 hover:from-slate-100/80 hover:to-slate-150/80 border-b border-slate-200/60">
                    <TableHead className="w-12 pl-6">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={
                            selectedProducts.size === filteredProducts.filter((p) => p.status !== "existing").length &&
                            filteredProducts.filter((p) => p.status !== "existing").length > 0
                          }
                          onChange={handleSelectAll}
                          className="w-4 h-4 text-green-600 bg-white border-2 border-slate-300 rounded-md focus:ring-0 focus:outline-none transition-all duration-200 hover:border-green-400"
                        />
                      </div>
                    </TableHead>
                    <TableHead className="w-20 font-semibold text-slate-700">Afbeelding</TableHead>
                    <TableHead className="font-semibold text-slate-700">Product</TableHead>
                    <TableHead className="font-semibold text-slate-700">SKU</TableHead>
                    <TableHead className="font-semibold text-slate-700">Prijs</TableHead>
                    <TableHead className="font-semibold text-slate-700 pr-6">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product, index) => (
                    <TableRow
                      key={product.sku}
                      onClick={(e) => handleRowClick(product.sku, e)}
                      className={`
                       group transition-all duration-500 ease-out hover:bg-gradient-to-r hover:from-green-50/50 hover:to-emerald-50/50 
                       ${product.status === "existing" ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}
                       ${
                         selectedProducts.has(product.sku)
                           ? "bg-gradient-to-r from-green-50/80 to-emerald-50/80 border-l-4 border-l-green-500 shadow-lg transform scale-[1.01]"
                           : "hover:shadow-md"
                       }
                       animate-in slide-in-from-bottom-3 duration-500 border-b border-slate-100/60
                     `}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <TableCell className="pl-6">
                        <div className="flex items-center">
                          <div className="relative">
                            <input
                              type="checkbox"
                              checked={selectedProducts.has(product.sku)}
                              onChange={() => handleProductSelect(product.sku)}
                              onClick={(e) => e.stopPropagation()}
                              disabled={product.status === "existing"}
                              className="w-4 h-4 text-green-600 bg-white border-2 border-slate-300 rounded-md focus:ring-0 focus:outline-none transition-all duration-300 hover:border-green-400 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                            {selectedProducts.has(product.sku) && (
                              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <Check className="w-3 h-3 text-white" />
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="relative group/image">
                          <Image
                            src={product.image_url || "/placeholder.svg?height=60&width=60"}
                            alt={product.name}
                            width={60}
                            height={60}
                            className="rounded-xl object-cover shadow-md group-hover/image:shadow-xl transition-all duration-300 transform group-hover/image:scale-110 border border-slate-200/60"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover/image:opacity-100 rounded-xl transition-all duration-300 flex items-center justify-center">
                            <Eye className="w-5 h-5 text-white transform scale-0 group-hover/image:scale-100 transition-transform duration-300" />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-semibold text-slate-900 group-hover:text-green-700 transition-colors duration-300">
                            {product.name}
                          </div>
                          {product.weight && (
                            <div className="text-sm text-slate-500 flex items-center gap-1">
                              <span className="w-1 h-1 bg-slate-400 rounded-full"></span>
                              Gewicht: {product.weight} {product.weight_unit}
                            </div>
                          )}
                          {product.attributes && (
                            <div className="text-xs text-slate-400 flex items-center gap-1">
                              <Tag className="w-3 h-3" />
                              {product.attributes}
                            </div>
                          )}
                          {product.description && (
                            <div className="text-sm text-slate-500 truncate max-w-xs">
                              {product.description.substring(0, 100)}...
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="bg-gradient-to-r from-slate-100 to-slate-50 px-3 py-1.5 rounded-lg text-sm font-mono border border-slate-200/60 shadow-sm">
                          {product.sku}
                        </code>
                      </TableCell>
                      <TableCell>
                        <div className="font-bold text-slate-900 text-lg">€{product.price.toFixed(2)}</div>
                      </TableCell>
                      <TableCell className="pr-6">{getStatusBadge(product.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </div>

      {/* Custom CSS for shimmer animation */}
      <style jsx>{`
       @keyframes shimmer {
         0% {
           transform: translateX(-100%) skewX(-12deg);
         }
         100% {
           transform: translateX(200%) skewX(-12deg);
         }
       }
       .animate-shimmer {
         animation: shimmer 2s infinite;
       }
     `}</style>
    </FCLayout>
  )
}
