"use client"
import { useState, useEffect } from "react"
import type React from "react"

import {
  ArrowLeft,
  ChevronDown,
  RefreshCw,
  Plus,
  Package,
  Eye,
  Check,
  Search,
  AlertCircle,
  Tag,
  Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { FCLayout } from "../../../_components/fc-layout"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import Image from "next/image"
import { fetchBolProducts, importSelectedProducts, syncBolProducts } from "./actions"

interface TenantUser {
  id: string
  tenant_id: string
  username: string
  email: string
  is_admin: boolean
}

interface ClientDetails {
  id: string
  name: string
  email: string
  phone: string
  address: string
  city: string
  postal_code: string
  country: string
  status: string
  created_at: string
  updated_at: string
}

interface BolIntegration {
  id: string
  client_id: string
  tenant_id: string
  platform: string
  domain?: string
  shop_url?: string
  shop_name?: string
  api_key?: string
  api_secret?: string
  status?: string
  active?: boolean
  created_at: string
  updated_at?: string
}

interface BolProduct {
  id: string
  name: string
  sku: string
  price: number
  stock: number
  status: "new" | "existing" | "koppelen"
  image: string
  weight?: number
  dimensions?: {
    length: number
    width: number
    height: number
  }
  platform_product_id: string
  description?: string
  type: "simple" | "variable"
  parent_id?: number
  variation_id?: number
  attributes?: string
}

interface BolProductPageClientProps {
  tenant: any
  user: TenantUser
  clientDetails: ClientDetails
  clientId: string
  bolIntegrations: BolIntegration[]
}

export function BolProductPageClient({
  tenant,
  user,
  clientDetails,
  clientId,
  bolIntegrations,
}: BolProductPageClientProps) {
  // Set the first (oldest) integration as default
  const [selectedIntegration, setSelectedIntegration] = useState<BolIntegration | null>(
    bolIntegrations.length > 0 ? bolIntegrations[0] : null,
  )

  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [products, setProducts] = useState<BolProduct[]>([])
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [syncLogs, setSyncLogs] = useState<string[]>([])
  const [showDebugPanel, setShowDebugPanel] = useState(false)

  // Helper function to get domain from integration
  const getDomain = (integration: BolIntegration | null) => {
    if (!integration) return "bol.com Producten"

    // Try domain field first, then shop_url as fallback
    const domain = integration.domain || integration.shop_url

    if (!domain) return "bol.com Producten"

    // Clean up the domain (remove protocol, www, etc.)
    return domain
      .replace(/^https?:\/\//, "")
      .replace(/^www\./, "")
      .split("/")[0]
  }

  const hasMultipleIntegrations = bolIntegrations.length > 1

  // Load products when component mounts or integration changes
  useEffect(() => {
    if (selectedIntegration) {
      loadProducts()
    }
  }, [selectedIntegration])

  const loadProducts = async () => {
    if (!selectedIntegration) return

    setIsLoading(true)
    setError(null)
    setSyncLogs([])

    // Add initial log
    appendLog("info", "Bol.com import gestart", { integration: selectedIntegration.id })

    try {
      const { data, error } = await fetchBolProducts(clientId, user.tenant_id, selectedIntegration.id)

      if (error) {
        appendLog("error", "Import gefaald", { error })
        setError(error)
        setProducts([])
      } else {
        appendLog("success", "Import voltooid", { count: data?.length || 0 })
        setProducts(data || [])
        if (data && data.length > 0) {
          setShowDebugPanel(true)
        }
      }
    } catch (err) {
      const errorMessage = "Onverwachte fout bij laden van producten"
      appendLog("error", errorMessage, { error: err.message })
      setError(errorMessage)
      setProducts([])
    } finally {
      setIsLoading(false)
    }
  }

  // Helper function to append logs
  const appendLog = (level: string, message: string, meta: any = {}) => {
    const timestamp = new Date().toISOString()
    const logLine = `[${timestamp}] [${level.toUpperCase()}] ${message} ${JSON.stringify(meta)}`
    setSyncLogs((prev) => [...prev, logLine])
  }

  // Filter products based on status, type and search
  const filteredProducts = products.filter((product) => {
    const matchesStatus = statusFilter === "all" || product.status === statusFilter
    const matchesType = typeFilter === "all" || product.type === typeFilter
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.attributes && product.attributes.toLowerCase().includes(searchQuery.toLowerCase()))

    return matchesStatus && matchesType && matchesSearch
  })

  // Only allow selection of new products and products that can be linked
  const selectableProducts = filteredProducts.filter((p) => p.status === "new" || p.status === "koppelen")

  const handleSelectAll = () => {
    if (selectedProducts.size === selectableProducts.length) {
      setSelectedProducts(new Set())
    } else {
      setSelectedProducts(new Set(selectableProducts.map((p) => p.id)))
    }
  }

  const handleSelectProduct = (productId: string) => {
    const product = products.find((p) => p.id === productId)
    if (!product || product.status === "existing") return

    const newSelected = new Set(selectedProducts)
    if (newSelected.has(productId)) {
      newSelected.delete(productId)
    } else {
      newSelected.add(productId)
    }
    setSelectedProducts(newSelected)
  }

  const handleRowClick = (productId: string, e: React.MouseEvent) => {
    // Prevent row click when clicking on action buttons
    if ((e.target as HTMLElement).closest("button")) {
      return
    }
    handleSelectProduct(productId)
  }

  const handleSync = async () => {
    if (!selectedIntegration) return

    setIsLoading(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const { success, error } = await syncBolProducts(clientId, user.tenant_id, selectedIntegration.id)

      if (success) {
        await loadProducts() // Reload products after sync
        setSuccessMessage("Producten succesvol gesynchroniseerd")
      } else {
        setError(error || "Fout bij synchroniseren")
      }
    } catch (err) {
      setError("Onverwachte fout bij synchroniseren")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddProducts = async () => {
    if (selectedProducts.size === 0) return

    setIsImporting(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const { success, error, imported, linked } = await importSelectedProducts(
        clientId,
        user.tenant_id,
        Array.from(selectedProducts),
      )

      if (success) {
        const messages = []
        if (imported > 0) {
          messages.push(
            `${imported} nieuw${imported !== 1 ? "e" : ""} product${imported !== 1 ? "en" : ""} geïmporteerd`,
          )
        }
        if (linked > 0) {
          messages.push(`${linked} product${linked !== 1 ? "en" : ""} gekoppeld`)
        }

        setSuccessMessage(messages.join(" en "))
        setSelectedProducts(new Set())
        await loadProducts() // Reload to update status
      } else {
        setError(error || "Fout bij importeren producten")
      }
    } catch (err) {
      setError("Onverwachte fout bij importeren")
    } finally {
      setIsImporting(false)
    }
  }

  const getStatusBadge = (status: BolProduct["status"]) => {
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
          <Badge className="bg-gradient-to-r from-blue-100 to-sky-100 text-blue-800 border-blue-200 hover:from-blue-200 hover:to-sky-200 transition-all duration-300 shadow-sm">
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

  const getTypeBadge = (type: BolProduct["type"]) => {
    switch (type) {
      case "simple":
        return (
          <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200">
            Eenvoudig
          </Badge>
        )
      case "variable":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <Tag className="w-3 h-3 mr-1" />
            Variabel
          </Badge>
        )
      default:
        return <Badge variant="outline">Onbekend</Badge>
    }
  }

  // Count products by status for display
  const statusCounts = {
    new: products.filter((p) => p.status === "new").length,
    existing: products.filter((p) => p.status === "existing").length,
    koppelen: products.filter((p) => p.status === "koppelen").length,
  }

  return (
    <FCLayout user={user} tenant={tenant} searchPlaceholder="Zoek producten...">
      <div className="space-y-8 pb-16 md:pb-12">
        {/* Terug knop */}
        <div className="animate-in slide-in-from-left-5 duration-300">
          <Link href={`/dashboard/fc/klanten/${clientId}`}>
            <Button
              variant="ghost"
              className="p-0 h-auto text-slate-600 hover:text-slate-900 transition-all duration-200 hover:translate-x-1"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Terug naar klant
            </Button>
          </Link>
        </div>

        {/* Header met bol.com branding - Lighter blue gradient */}
        <div className="animate-in slide-in-from-top-5 duration-500 delay-100">
          <div className="bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 rounded-2xl p-8 border shadow-lg text-white">
            <div className="flex items-center gap-6">
              <Image src="/images/bol-logo.webp" alt="bol.com" width={80} height={80} className="w-20 h-20" />
              <div className="flex-1">
                {hasMultipleIntegrations ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="p-0 h-auto text-left justify-start hover:bg-white/10 focus:outline-none focus:ring-0 focus:border-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-white"
                      >
                        <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                          {getDomain(selectedIntegration)}
                          <ChevronDown className="w-6 h-6 text-white/80" />
                        </h1>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-80">
                      {bolIntegrations.map((integration) => (
                        <DropdownMenuItem
                          key={integration.id}
                          onClick={() => setSelectedIntegration(integration)}
                          className="cursor-pointer"
                        >
                          <div className="flex flex-col">
                            <span className="font-medium">{getDomain(integration)}</span>
                            {integration.shop_name && (
                              <span className="text-sm text-slate-500">{integration.shop_name}</span>
                            )}
                          </div>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <h1 className="text-3xl font-bold mb-2 text-white">{getDomain(selectedIntegration)}</h1>
                )}
                <p className="text-blue-100 text-lg mt-2">Import products from bol.com marketplace</p>

                {/* Status overview */}
                {products.length > 0 && (
                  <div className="flex gap-4 mt-4">
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                      <span className="text-blue-100">{statusCounts.new} nieuw</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                      <span className="text-blue-100">{statusCounts.koppelen} te koppelen</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-sky-400 rounded-full"></div>
                      <span className="text-blue-100">{statusCounts.existing} bestaand</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {successMessage && (
          <Alert className="border-green-200 bg-green-50">
            <Check className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{successMessage}</AlertDescription>
          </Alert>
        )}

        {/* Controls - Responsive */}
        <div className="animate-in slide-in-from-top-5 duration-500 delay-200">
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-lg p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-gradient-to-br from-blue-100 to-sky-100 rounded-xl">
                  <Package className="w-6 h-6 text-blue-600" />
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
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 w-full"
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

                {/* Type Filter */}
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-full sm:w-48 border-slate-200 rounded-xl focus:ring-0 focus:ring-offset-0">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle types</SelectItem>
                    <SelectItem value="simple">
                      <div className="flex items-center gap-2">
                        <Package className="w-3 h-3" />
                        Eenvoudig
                      </div>
                    </SelectItem>
                    <SelectItem value="variable">
                      <div className="flex items-center gap-2">
                        <Tag className="w-3 h-3" />
                        Variabel
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                {/* Process Products Button - Only show when products selected */}
                {selectedProducts.size > 0 && (
                  <Button
                    onClick={handleAddProducts}
                    disabled={isImporting}
                    className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-blue-700 to-sky-700 hover:from-blue-700 hover:via-blue-800 hover:to-sky-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed group"
                  >
                    {/* Animated background */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-sky-500 to-blue-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>

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
                      </div>
                    )}

                    <div className="relative flex items-center gap-2">
                      <div className="p-1 bg-white/20 rounded-md">
                        {isImporting ? (
                          <div className="relative">
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <Sparkles className="w-3 h-3 absolute -top-1 -right-1 text-yellow-300 animate-pulse" />
                          </div>
                        ) : (
                          <Plus className="w-4 h-4" />
                        )}
                      </div>
                      <span>
                        {isImporting
                          ? "Verwerken..."
                          : `${selectedProducts.size} Product${selectedProducts.size !== 1 ? "en" : ""} Verwerken`}
                      </span>
                    </div>

                    {/* Shimmer effect */}
                    {isImporting && (
                      <div className="absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>
                    )}
                  </Button>
                )}

                {/* Sync Button */}
                <Button
                  onClick={handleSync}
                  disabled={isLoading}
                  className="bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 rounded-xl whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                  {isLoading ? "Synchroniseren..." : "Synchroniseren"}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Producten tabel */}
        <div className="animate-in slide-in-from-bottom-5 duration-500 delay-300">
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-xl overflow-hidden">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="relative">
                  {/* Animated spinner */}
                  <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                  <div
                    className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-blue-400 rounded-full animate-spin"
                    style={{ animationDirection: "reverse", animationDuration: "1.5s" }}
                  ></div>
                </div>
                <div className="mt-6 text-center">
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">Producten importeren...</h3>
                  <p className="text-slate-600 mb-4">Dit kan enkele minuten duren</p>

                  {/* Progress steps */}
                  <div className="flex items-center justify-center gap-4 text-sm text-slate-500">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                      <span>Verbinden met Bol.com</span>
                    </div>
                    <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"
                        style={{ animationDelay: "0.5s" }}
                      ></div>
                      <span>Producten ophalen</span>
                    </div>
                    <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 bg-blue-300 rounded-full animate-pulse"
                        style={{ animationDelay: "1s" }}
                      ></div>
                      <span>Data verwerken</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Package className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">Geen producten gevonden</h3>
                  <p className="text-slate-600">
                    {products.length === 0
                      ? "Er zijn geen producten beschikbaar in deze bol.com integratie."
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
                          checked={selectedProducts.size === selectableProducts.length && selectableProducts.length > 0}
                          onChange={handleSelectAll}
                          className="w-4 h-4 text-blue-600 bg-white border-2 border-slate-300 rounded-md focus:ring-0 focus:outline-none transition-all duration-200 hover:border-blue-400"
                        />
                      </div>
                    </TableHead>
                    <TableHead className="w-20 font-semibold text-slate-700">Afbeelding</TableHead>
                    <TableHead className="font-semibold text-slate-700">Product</TableHead>
                    <TableHead className="font-semibold text-slate-700">SKU</TableHead>
                    <TableHead className="font-semibold text-slate-700">Prijs</TableHead>
                    <TableHead className="font-semibold text-slate-700">Type</TableHead>
                    <TableHead className="font-semibold text-slate-700 pr-6">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product, index) => (
                    <TableRow
                      key={product.id}
                      onClick={(e) => handleRowClick(product.id, e)}
                      className={`
                        group transition-all duration-500 ease-out hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-sky-50/50 
                        ${product.status === "existing" ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}
                        ${
                          selectedProducts.has(product.id)
                            ? "bg-gradient-to-r from-blue-50/80 to-sky-50/80 border-l-4 border-l-blue-500 shadow-lg transform scale-[1.01]"
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
                              checked={selectedProducts.has(product.id)}
                              onChange={() => handleSelectProduct(product.id)}
                              onClick={(e) => e.stopPropagation()}
                              disabled={product.status === "existing"}
                              className="w-4 h-4 text-blue-600 bg-white border-2 border-slate-300 rounded-md focus:ring-0 focus:outline-none transition-all duration-300 hover:border-blue-400 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                            {selectedProducts.has(product.id) && (
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
                            src={product.image || "/placeholder.svg?height=60&width=60"}
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
                          <div className="font-semibold text-slate-900 group-hover:text-blue-700 transition-colors duration-300">
                            {product.name}
                          </div>
                          {product.weight && (
                            <div className="text-sm text-slate-500 flex items-center gap-1">
                              <span className="w-1 h-1 bg-slate-400 rounded-full"></span>
                              Gewicht: {product.weight}kg
                            </div>
                          )}
                          {product.attributes && (
                            <div className="text-xs text-slate-400 flex items-center gap-1">
                              <Tag className="w-3 h-3" />
                              {product.attributes}
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
                      <TableCell>{getTypeBadge(product.type)}</TableCell>
                      <TableCell className="pr-6">{getStatusBadge(product.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
        {/* Debug Log Panel */}
        {syncLogs.length > 0 && (
          <div className="animate-in slide-in-from-bottom-5 duration-500 delay-400">
            <div className="bg-white rounded-2xl border border-slate-200/60 shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-slate-100 to-slate-50 px-6 py-4 border-b border-slate-200/60">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-200 rounded-xl">
                      <AlertCircle className="w-5 h-5 text-slate-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">Sync Logs</h3>
                      <p className="text-sm text-slate-600">Gedetailleerde informatie over de import</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowDebugPanel(!showDebugPanel)}
                    className="text-slate-600 hover:text-slate-900"
                  >
                    {showDebugPanel ? "Verberg" : "Toon"} Details
                  </Button>
                </div>
              </div>

              {showDebugPanel && (
                <div className="p-6">
                  <div className="bg-slate-900 rounded-xl p-4 max-h-96 overflow-y-auto">
                    <pre className="text-sm text-green-400 font-mono whitespace-pre-wrap">{syncLogs.join("\n")}</pre>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(syncLogs.join("\n"))
                        // You could add a toast notification here
                      }}
                      className="text-slate-600 hover:text-slate-900"
                    >
                      Kopieer Logs
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
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
