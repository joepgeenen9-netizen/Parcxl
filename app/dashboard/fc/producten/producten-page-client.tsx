"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import {
  Search,
  Filter,
  Package,
  MapPin,
  Calendar,
  TrendingDown,
  X,
  ChevronDown,
  ChevronUp,
  Eye,
  Building2,
  Plus,
  FileText,
  Upload,
  Database,
  Trash2,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import type { ProductWithClient, ProductStats } from "./actions"
import { deleteProducts } from "./actions"

interface ProductenPageClientProps {
  products: ProductWithClient[]
  stats: ProductStats
}

type SortField = "name" | "sku" | "stock" | "client_company_name" | "created_at"
type SortDirection = "asc" | "desc"

export function ProductenPageClient({ products, stats }: ProductenPageClientProps) {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [clientFilter, setClientFilter] = useState<string>("all")
  const [stockFilter, setStockFilter] = useState<string>("all")
  const [platformFilter, setPlatformFilter] = useState<string>("all")
  const [sortField, setSortField] = useState<SortField>("created_at")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")

  // Selection state
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set())
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteResult, setDeleteResult] = useState<{ success: boolean; message: string } | null>(null)

  // Get unique values for filters
  const uniqueClients = useMemo(() => {
    const clients = products
      .map((product) => ({
        id: product.client_id,
        name: product.client_company_name,
      }))
      .filter((client, index, self) => self.findIndex((c) => c.id === client.id) === index)
    return clients.sort((a, b) => a.name.localeCompare(b.name))
  }, [products])

  const uniquePlatforms = useMemo(() => {
    const platforms = new Set<string>()
    products.forEach((product) => {
      if (product.platform) platforms.add(product.platform)
      if (product.platform_2) platforms.add(product.platform_2)
      if (product.platform_3) platforms.add(product.platform_3)
      if (product.platform_4) platforms.add(product.platform_4)
      if (product.platform_5) platforms.add(product.platform_5)
      if (product.platform_6) platforms.add(product.platform_6)
    })
    return Array.from(platforms).sort()
  }, [products])

  // Get platforms for a product
  const getProductPlatforms = (product: ProductWithClient): string[] => {
    const platforms: string[] = []
    if (product.platform) platforms.push(product.platform)
    if (product.platform_2) platforms.push(product.platform_2)
    if (product.platform_3) platforms.push(product.platform_3)
    if (product.platform_4) platforms.push(product.platform_4)
    if (product.platform_5) platforms.push(product.platform_5)
    if (product.platform_6) platforms.push(product.platform_6)
    return platforms
  }

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    const filtered = products.filter((product) => {
      const matchesSearch =
        searchTerm === "" ||
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.client_company_name.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesClient = clientFilter === "all" || product.client_id === clientFilter

      const matchesStock =
        stockFilter === "all" ||
        (stockFilter === "low" && product.stock <= 10) ||
        (stockFilter === "out" && product.stock === 0) ||
        (stockFilter === "in" && product.stock > 10)

      const productPlatforms = getProductPlatforms(product)
      const matchesPlatform = platformFilter === "all" || productPlatforms.includes(platformFilter)

      return matchesSearch && matchesClient && matchesStock && matchesPlatform
    })

    // Sort the filtered results
    filtered.sort((a, b) => {
      let aValue: string | number
      let bValue: string | number

      switch (sortField) {
        case "name":
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
          break
        case "sku":
          aValue = a.sku.toLowerCase()
          bValue = b.sku.toLowerCase()
          break
        case "stock":
          aValue = a.stock
          bValue = b.stock
          break
        case "client_company_name":
          aValue = a.client_company_name.toLowerCase()
          bValue = b.client_company_name.toLowerCase()
          break
        case "created_at":
          aValue = new Date(a.created_at).getTime()
          bValue = new Date(b.created_at).getTime()
          break
        default:
          return 0
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1
      return 0
    })

    return filtered
  }, [products, searchTerm, clientFilter, stockFilter, platformFilter, sortField, sortDirection])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const clearFilters = () => {
    setSearchTerm("")
    setClientFilter("all")
    setStockFilter("all")
    setPlatformFilter("all")
  }

  const hasActiveFilters =
    searchTerm !== "" || clientFilter !== "all" || stockFilter !== "all" || platformFilter !== "all"

  // Selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedProducts(new Set(filteredAndSortedProducts.map((p) => p.id)))
    } else {
      setSelectedProducts(new Set())
    }
  }

  const handleSelectProduct = (productId: string, checked: boolean) => {
    const newSelected = new Set(selectedProducts)
    if (checked) {
      newSelected.add(productId)
    } else {
      newSelected.delete(productId)
    }
    setSelectedProducts(newSelected)
  }

  const isAllSelected =
    filteredAndSortedProducts.length > 0 && filteredAndSortedProducts.every((p) => selectedProducts.has(p.id))
  const isIndeterminate = selectedProducts.size > 0 && !isAllSelected

  // Delete handlers
  const handleDeleteSelected = async () => {
    if (selectedProducts.size === 0) return

    setIsDeleting(true)
    setDeleteResult(null)

    try {
      // Get tenant ID from the first product (assuming all products belong to the same tenant)
      const tenantId = products[0]?.tenant_id
      if (!tenantId) {
        throw new Error("Tenant ID not found")
      }

      const result = await deleteProducts(tenantId, Array.from(selectedProducts))

      if (result.success) {
        setDeleteResult({
          success: true,
          message: `${result.deletedCount} product${result.deletedCount !== 1 ? "en" : ""} succesvol verwijderd`,
        })
        setSelectedProducts(new Set())
        // Refresh the page to show updated data
        router.refresh()
      } else {
        setDeleteResult({
          success: false,
          message: result.error || "Er is een fout opgetreden bij het verwijderen",
        })
      }
    } catch (error) {
      setDeleteResult({
        success: false,
        message: "Er is een onverwachte fout opgetreden",
      })
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  const getStockColor = (stock: number) => {
    if (stock === 0) return "bg-red-100 text-red-800 border-red-200"
    if (stock <= 10) return "bg-yellow-100 text-yellow-800 border-yellow-200"
    return "bg-green-100 text-green-800 border-green-200"
  }

  const getStockText = (stock: number) => {
    if (stock === 0) return "Uitverkocht"
    if (stock <= 10) return "Laag"
    return "Op voorraad"
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

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return null
    return sortDirection === "asc" ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />
  }

  const getPlatformColor = (platform: string) => {
    const colors: Record<string, string> = {
      woocommerce: "bg-purple-100 text-purple-800 border-purple-200",
      shopify: "bg-green-100 text-green-800 border-green-200",
      bol: "bg-blue-100 text-blue-800 border-blue-200",
      ccv: "bg-indigo-100 text-indigo-800 border-indigo-200",
    }
    return colors[platform.toLowerCase()] || "bg-gray-100 text-gray-800 border-gray-200"
  }

  const handleAddProduct = (method: string) => {
    switch (method) {
      case "handmatig":
        // Navigate to manual product creation
        console.log("Navigate to manual product creation")
        break
      case "csv":
        // Handle CSV import
        console.log("Handle CSV import")
        break
      case "lyra":
        // Handle Lyra import
        console.log("Handle Lyra import")
        break
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6 pb-8 md:pb-12 px-1 sm:px-0">
      {/* Delete Result Alert */}
      {deleteResult && (
        <Alert className={`${deleteResult.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}>
          {deleteResult.success ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : (
            <XCircle className="h-4 w-4 text-red-600" />
          )}
          <AlertDescription className={deleteResult.success ? "text-green-800" : "text-red-800"}>
            {deleteResult.message}
          </AlertDescription>
        </Alert>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 truncate">Producten</h1>
          <p className="text-slate-600 mt-1 text-sm sm:text-base">Beheer alle producten van je fulfillment klanten</p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
          {/* Bulk Actions - Show when products are selected */}
          {selectedProducts.size > 0 && (
            <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 bg-gradient-to-r from-red-50 to-red-100/80 border border-red-200 rounded-xl order-2 sm:order-1">
              <span className="text-xs sm:text-sm font-medium text-red-800 truncate">
                {selectedProducts.size} product{selectedProducts.size !== 1 ? "en" : ""} geselecteerd
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDeleteDialog(true)}
                className="bg-white hover:bg-red-50 border-red-200 text-red-600 hover:text-red-700 hover:border-red-300 text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2 h-8 sm:h-9 flex-shrink-0"
              >
                <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden xs:inline">Verwijder geselecteerde</span>
                <span className="xs:hidden">Verwijder</span>
              </Button>
            </div>
          )}

          {/* Add Products Dropdown Button */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="group relative bg-gradient-to-r from-[#0065FF] to-[#0052CC] hover:from-[#0052CC] hover:to-[#0065FF] text-white shadow-[0_4px_12px_rgba(0,101,255,0.3)] hover:shadow-[0_6px_20px_rgba(0,101,255,0.4)] transition-all duration-300 hover:transform hover:translate-y-[-1px] px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-medium text-sm sm:text-base h-10 sm:h-auto order-1 sm:order-2">
                <Plus className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform duration-300" />
                <span className="hidden xs:inline">Producten toevoegen</span>
                <span className="xs:hidden">Toevoegen</span>
                <ChevronDown className="w-4 h-4 ml-2 group-hover:rotate-180 transition-transform duration-300" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56 sm:w-64 bg-white/95 backdrop-blur-[20px] border border-[#0065FF]/10 shadow-[0_20px_40px_rgba(0,101,255,0.15)] rounded-2xl p-2 mt-2"
            >
              <DropdownMenuItem
                onClick={() => handleAddProduct("handmatig")}
                className="group flex items-center gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-xl hover:bg-gradient-to-r hover:from-[#0065FF]/5 hover:to-[#0052CC]/5 transition-all duration-300 cursor-pointer border-0 focus:bg-gradient-to-r focus:from-[#0065FF]/5 focus:to-[#0052CC]/5"
              >
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-[#0065FF]/10 to-[#0052CC]/5 flex items-center justify-center group-hover:from-[#0065FF]/20 group-hover:to-[#0052CC]/10 transition-all duration-300">
                  <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-[#0065FF] group-hover:scale-110 transition-transform duration-300" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-slate-900 group-hover:text-[#0065FF] transition-colors duration-300 text-sm sm:text-base">
                    Handmatig
                  </div>
                  <div className="text-xs text-slate-500 group-hover:text-slate-600 transition-colors duration-300 truncate">
                    Voeg producten één voor één toe
                  </div>
                </div>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => handleAddProduct("csv")}
                className="group flex items-center gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-xl hover:bg-gradient-to-r hover:from-green-500/5 hover:to-emerald-500/5 transition-all duration-300 cursor-pointer border-0 focus:bg-gradient-to-r focus:from-green-500/5 focus:to-emerald-500/5"
              >
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/5 flex items-center justify-center group-hover:from-green-500/20 group-hover:to-emerald-500/10 transition-all duration-300">
                  <Upload className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 group-hover:scale-110 transition-transform duration-300" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-slate-900 group-hover:text-green-600 transition-colors duration-300 text-sm sm:text-base">
                    CSV
                  </div>
                  <div className="text-xs text-slate-500 group-hover:text-slate-600 transition-colors duration-300 truncate">
                    Importeer via CSV bestand
                  </div>
                </div>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => handleAddProduct("lyra")}
                className="group flex items-center gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-xl hover:bg-gradient-to-r hover:from-purple-500/5 hover:to-indigo-500/5 transition-all duration-300 cursor-pointer border-0 focus:bg-gradient-to-r focus:from-purple-500/5 focus:to-indigo-500/5"
              >
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-purple-500/10 to-indigo-500/5 flex items-center justify-center group-hover:from-purple-500/20 group-hover:to-indigo-500/10 transition-all duration-300">
                  <Database className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 group-hover:scale-110 transition-transform duration-300" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-slate-900 group-hover:text-purple-600 transition-colors duration-300 text-sm sm:text-base">
                    Importeren uit Lyra
                  </div>
                  <div className="text-xs text-slate-500 group-hover:text-slate-600 transition-colors duration-300 truncate">
                    Synchroniseer met Lyra systeem
                  </div>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Total Products Card */}
        <div className="group relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0065FF]/5 via-[#0065FF]/3 to-transparent rounded-2xl transform rotate-1 group-hover:rotate-2 transition-transform duration-500"></div>
          <div className="relative bg-gradient-to-br from-white via-white/95 to-[#0065FF]/5 backdrop-blur-[25px] rounded-2xl p-4 sm:p-6 border border-[#0065FF]/10 shadow-[0_8px_32px_rgba(0,101,255,0.08)] hover:shadow-[0_20px_60px_rgba(0,101,255,0.15)] transition-all duration-500 cursor-pointer hover:scale-[1.02] transform-gpu h-28 sm:h-32">
            <div className="flex items-center gap-3 sm:gap-4 h-full">
              <div className="relative flex-shrink-0">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-[#0065FF] to-[#0052CC] flex items-center justify-center shadow-[0_8px_24px_rgba(0,101,255,0.3)] group-hover:shadow-[0_12px_32px_rgba(0,101,255,0.4)] transition-all duration-300">
                  <Package className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-gradient-to-br from-[#00D4FF] to-[#0065FF] rounded-full flex items-center justify-center">
                  <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-white rounded-full animate-pulse"></div>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-1 sm:gap-2 mb-1">
                  <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-[#0065FF] to-[#0052CC] bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">
                    {stats.totalProducts}
                  </div>
                  <div className="text-xs sm:text-sm font-medium text-slate-500 group-hover:text-[#0065FF] transition-colors duration-300">
                    van {products.length}
                  </div>
                </div>
                <h3 className="text-sm sm:text-base font-bold text-slate-800 mb-1 group-hover:text-[#0065FF] transition-colors duration-300 truncate">
                  Totaal producten
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed truncate">Alle producten in het systeem</p>
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#0065FF] to-[#0052CC] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 rounded-b-2xl"></div>
          </div>
        </div>

        {/* Low Stock Card */}
        <div className="group relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-red-500/3 to-transparent rounded-2xl transform -rotate-1 group-hover:-rotate-2 transition-transform duration-500"></div>
          <div className="relative bg-gradient-to-br from-white via-white/95 to-red-50/50 backdrop-blur-[25px] rounded-2xl p-4 sm:p-6 border border-red-200/20 shadow-[0_8px_32px_rgba(239,68,68,0.08)] hover:shadow-[0_20px_60px_rgba(239,68,68,0.15)] transition-all duration-500 cursor-pointer hover:scale-[1.02] transform-gpu h-28 sm:h-32">
            <div className="flex items-center gap-3 sm:gap-4 h-full">
              <div className="relative flex-shrink-0">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-[0_8px_24px_rgba(239,68,68,0.3)] group-hover:shadow-[0_12px_32px_rgba(239,68,68,0.4)] transition-all duration-300">
                  <TrendingDown className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center">
                  <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-white rounded-full animate-pulse"></div>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-1 sm:gap-2 mb-1">
                  <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">
                    {stats.lowStockProducts}
                  </div>
                  <div className="text-xs sm:text-sm font-medium text-slate-500 group-hover:text-red-500 transition-colors duration-300">
                    kritiek niveau
                  </div>
                </div>
                <h3 className="text-sm sm:text-base font-bold text-slate-800 mb-1 group-hover:text-red-500 transition-colors duration-300 truncate">
                  Lage voorraad
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed truncate">
                  Producten die bijbesteld moeten worden
                </p>
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-red-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 rounded-b-2xl"></div>
          </div>
        </div>

        {/* New Products Card */}
        <div className="group relative overflow-hidden sm:col-span-2 lg:col-span-1">
          <div className="absolute inset-0 bg-gradient-to-br from-[#FF8200]/5 via-[#FF8200]/3 to-transparent rounded-2xl transform rotate-1 group-hover:rotate-2 transition-transform duration-500"></div>
          <div className="relative bg-gradient-to-br from-white via-white/95 to-orange-50/50 backdrop-blur-[25px] rounded-2xl p-4 sm:p-6 border border-orange-200/20 shadow-[0_8px_32px_rgba(255,130,0,0.08)] hover:shadow-[0_20px_60px_rgba(255,130,0,0.15)] transition-all duration-500 cursor-pointer hover:scale-[1.02] transform-gpu h-28 sm:h-32">
            <div className="flex items-center gap-3 sm:gap-4 h-full">
              <div className="relative flex-shrink-0">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-[#FF8200] to-[#FF6B00] flex items-center justify-center shadow-[0_8px_24px_rgba(255,130,0,0.3)] group-hover:shadow-[0_12px_32px_rgba(255,130,0,0.4)] transition-all duration-300">
                  <Calendar className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-gradient-to-br from-yellow-400 to-[#FF8200] rounded-full flex items-center justify-center">
                  <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-white rounded-full animate-pulse"></div>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-1 sm:gap-2 mb-1">
                  <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-[#FF8200] to-[#FF6B00] bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">
                    {stats.newProductsLast30Days}
                  </div>
                  <div className="text-xs sm:text-sm font-medium text-slate-500 group-hover:text-[#FF8200] transition-colors duration-300">
                    deze maand
                  </div>
                </div>
                <h3 className="text-sm sm:text-base font-bold text-slate-800 mb-1 group-hover:text-[#FF8200] transition-colors duration-300 truncate">
                  Nieuw deze maand
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed truncate">Recent toegevoegde producten</p>
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FF8200] to-[#FF6B00] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 rounded-b-2xl"></div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gradient-to-br from-white/95 to-white/90 backdrop-blur-[25px] rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 border border-[#0065FF]/[0.12] shadow-[0_8px_32px_rgba(0,101,255,0.08)] hover:shadow-[0_12px_40px_rgba(0,101,255,0.12)] transition-all duration-500">
        <div className="flex flex-col gap-4 sm:gap-6">
          {/* Search */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-[#0065FF]/5 to-[#0052CC]/5 rounded-xl sm:rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
            <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-[#0065FF]/60 group-hover:text-[#0065FF] transition-all duration-300 z-10" />
            <Input
              placeholder="Zoek op productnaam, SKU of klant..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 sm:pl-12 pr-4 py-3 sm:py-4 h-12 sm:h-14 border-2 border-[#0065FF]/15 hover:border-[#0065FF]/30 focus:border-[#0065FF] focus:ring-4 focus:ring-[#0065FF]/10 rounded-xl sm:rounded-2xl bg-white/80 backdrop-blur-sm text-slate-700 placeholder:text-slate-400 font-medium transition-all duration-300 shadow-sm hover:shadow-md relative z-10 text-sm sm:text-base"
            />
          </div>

          {/* Filter Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Client Filter */}
            <div className="group">
              <div className="absolute inset-0 bg-gradient-to-r from-[#0065FF]/5 to-[#0052CC]/5 rounded-xl sm:rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
              <Select value={clientFilter} onValueChange={setClientFilter}>
                <SelectTrigger className="w-full h-12 sm:h-14 border-2 border-[#0065FF]/15 hover:border-[#0065FF]/30 focus:border-[#0065FF] focus:ring-4 focus:ring-[#0065FF]/10 rounded-xl sm:rounded-2xl bg-white/80 backdrop-blur-sm font-medium text-slate-700 transition-all duration-300 shadow-sm hover:shadow-md relative z-10 text-sm sm:text-base">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Building2 className="w-4 h-4 text-[#0065FF]/70 flex-shrink-0" />
                    <SelectValue placeholder="Klant" />
                  </div>
                </SelectTrigger>
                <SelectContent className="border-[#0065FF]/20 bg-white/95 backdrop-blur-sm rounded-xl shadow-xl">
                  <SelectItem value="all" className="hover:bg-[#0065FF]/5 focus:bg-[#0065FF]/5">
                    Alle klanten
                  </SelectItem>
                  {uniqueClients.map((client) => (
                    <SelectItem key={client.id} value={client.id} className="hover:bg-[#0065FF]/5 focus:bg-[#0065FF]/5">
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Stock Filter */}
            <div className="group">
              <div className="absolute inset-0 bg-gradient-to-r from-[#0065FF]/5 to-[#0052CC]/5 rounded-xl sm:rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
              <Select value={stockFilter} onValueChange={setStockFilter}>
                <SelectTrigger className="w-full h-12 sm:h-14 border-2 border-[#0065FF]/15 hover:border-[#0065FF]/30 focus:border-[#0065FF] focus:ring-4 focus:ring-[#0065FF]/10 rounded-xl sm:rounded-2xl bg-white/80 backdrop-blur-sm font-medium text-slate-700 transition-all duration-300 shadow-sm hover:shadow-md relative z-10 text-sm sm:text-base">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Package className="w-4 h-4 text-[#0065FF]/70 flex-shrink-0" />
                    <SelectValue placeholder="Voorraad" />
                  </div>
                </SelectTrigger>
                <SelectContent className="border-[#0065FF]/20 bg-white/95 backdrop-blur-sm rounded-xl shadow-xl">
                  <SelectItem value="all" className="hover:bg-[#0065FF]/5 focus:bg-[#0065FF]/5">
                    Alle voorraad
                  </SelectItem>
                  <SelectItem value="in" className="hover:bg-[#0065FF]/5 focus:bg-[#0065FF]/5">
                    Op voorraad
                  </SelectItem>
                  <SelectItem value="low" className="hover:bg-[#0065FF]/5 focus:bg-[#0065FF]/5">
                    Lage voorraad
                  </SelectItem>
                  <SelectItem value="out" className="hover:bg-[#0065FF]/5 focus:bg-[#0065FF]/5">
                    Uitverkocht
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Platform Filter */}
            <div className="group">
              <div className="absolute inset-0 bg-gradient-to-r from-[#0065FF]/5 to-[#0052CC]/5 rounded-xl sm:rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
              <Select value={platformFilter} onValueChange={setPlatformFilter}>
                <SelectTrigger className="w-full h-12 sm:h-14 border-2 border-[#0065FF]/15 hover:border-[#0065FF]/30 focus:border-[#0065FF] focus:ring-4 focus:ring-[#0065FF]/10 rounded-xl sm:rounded-2xl bg-white/80 backdrop-blur-sm font-medium text-slate-700 transition-all duration-300 shadow-sm hover:shadow-md relative z-10 text-sm sm:text-base">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Filter className="w-4 h-4 text-[#0065FF]/70 flex-shrink-0" />
                    <SelectValue placeholder="Platform" />
                  </div>
                </SelectTrigger>
                <SelectContent className="border-[#0065FF]/20 bg-white/95 backdrop-blur-sm rounded-xl shadow-xl">
                  <SelectItem value="all" className="hover:bg-[#0065FF]/5 focus:bg-[#0065FF]/5">
                    Alle platforms
                  </SelectItem>
                  {uniquePlatforms.map((platform) => (
                    <SelectItem key={platform} value={platform} className="hover:bg-[#0065FF]/5 focus:bg-[#0065FF]/5">
                      {platform}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <div className="group sm:col-span-2 lg:col-span-1">
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="flex items-center justify-center gap-2 sm:gap-3 h-12 sm:h-14 px-4 sm:px-6 w-full bg-gradient-to-r from-red-50 to-red-50/80 hover:from-red-100 hover:to-red-100/90 border-2 border-red-200/60 hover:border-red-300 text-red-600 hover:text-red-700 font-medium rounded-xl sm:rounded-2xl transition-all duration-300 shadow-sm hover:shadow-md hover:scale-105 transform-gpu backdrop-blur-sm text-sm sm:text-base"
                >
                  <X className="w-4 h-4 flex-shrink-0" />
                  <span>Wissen</span>
                </Button>
              </div>
            )}
          </div>

          {/* Results Counter */}
          <div className="pt-4 sm:pt-6 border-t border-[#0065FF]/10">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-[#0065FF] to-[#0052CC] animate-pulse flex-shrink-0"></div>
                <span className="text-slate-600 font-medium text-sm sm:text-base">
                  <span className="text-[#0065FF] font-bold">{filteredAndSortedProducts.length}</span> van{" "}
                  <span className="text-slate-800 font-bold">{products.length}</span> producten
                  {hasActiveFilters && (
                    <span className="ml-2 px-2 sm:px-3 py-1 bg-gradient-to-r from-[#0065FF]/10 to-[#0052CC]/10 text-[#0065FF] text-xs sm:text-sm font-medium rounded-full border border-[#0065FF]/20">
                      gefilterd
                    </span>
                  )}
                </span>
              </div>
              {hasActiveFilters && (
                <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500">
                  <Filter className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span>Actieve filters</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white/90 backdrop-blur-[20px] rounded-xl sm:rounded-2xl border border-[#0065FF]/[0.08] overflow-hidden">
        {filteredAndSortedProducts.length === 0 ? (
          <div className="text-center py-8 sm:py-12 px-4">
            {hasActiveFilters ? (
              <>
                <Filter className="w-10 h-10 sm:w-12 sm:h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 mb-4 text-sm sm:text-base">
                  Geen producten gevonden met de huidige filters
                </p>
                <Button variant="outline" onClick={clearFilters} className="text-sm sm:text-base bg-transparent">
                  Filters wissen
                </Button>
              </>
            ) : (
              <>
                <Package className="w-10 h-10 sm:w-12 sm:h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 mb-4 text-sm sm:text-base">Nog geen producten toegevoegd</p>
                <Button onClick={() => router.push("/dashboard/fc/klanten")} className="text-sm sm:text-base">
                  <Building2 className="w-4 h-4 mr-2" />
                  Klanten beheren
                </Button>
              </>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-[#0065FF] to-[#0052CC]">
                  <tr>
                    <th className="text-left py-3 sm:py-4 px-3 sm:px-6 font-bold text-white w-12 sm:w-16 border-0">
                      <Checkbox
                        checked={isAllSelected}
                        onCheckedChange={handleSelectAll}
                        className="border-white/30 data-[state=checked]:bg-white data-[state=checked]:text-[#0065FF] data-[state=checked]:border-white hover:scale-110 transition-transform duration-200 transform-gpu w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0"
                        ref={(ref) => {
                          if (ref) {
                            ref.indeterminate = isIndeterminate
                          }
                        }}
                      />
                    </th>
                    <th className="text-left py-3 sm:py-4 px-3 sm:px-6 font-bold text-white w-16 sm:w-20 border-0"></th>
                    <th
                      className="text-left py-3 sm:py-4 px-3 sm:px-6 font-bold text-white cursor-pointer hover:text-blue-100 transition-colors duration-200 min-w-[180px] sm:min-w-[200px] border-0"
                      onClick={() => handleSort("name")}
                    >
                      <div className="flex items-center text-sm sm:text-base">
                        Product
                        {getSortIcon("name")}
                      </div>
                    </th>
                    <th
                      className="text-left py-3 sm:py-4 px-3 sm:px-6 font-bold text-white cursor-pointer hover:text-blue-100 transition-colors duration-200 min-w-[100px] sm:min-w-[120px] border-0"
                      onClick={() => handleSort("sku")}
                    >
                      <div className="flex items-center text-sm sm:text-base">
                        SKU
                        {getSortIcon("sku")}
                      </div>
                    </th>
                    <th
                      className="text-left py-3 sm:py-4 px-3 sm:px-6 font-bold text-white cursor-pointer hover:text-blue-100 transition-colors duration-200 min-w-[90px] sm:min-w-[100px] border-0"
                      onClick={() => handleSort("stock")}
                    >
                      <div className="flex items-center text-sm sm:text-base">
                        Voorraad
                        {getSortIcon("stock")}
                      </div>
                    </th>
                    <th className="text-left py-3 sm:py-4 px-3 sm:px-6 font-bold text-white min-w-[120px] sm:min-w-[150px] border-0 text-sm sm:text-base">
                      Platforms
                    </th>
                    <th
                      className="text-left py-3 sm:py-4 px-3 sm:px-6 font-bold text-white cursor-pointer hover:text-blue-100 transition-colors duration-200 min-w-[160px] sm:min-w-[200px] border-0"
                      onClick={() => handleSort("client_company_name")}
                    >
                      <div className="flex items-center text-sm sm:text-base">
                        Klant
                        {getSortIcon("client_company_name")}
                      </div>
                    </th>
                    <th
                      className="text-left py-3 sm:py-4 px-3 sm:px-6 font-bold text-white cursor-pointer hover:text-blue-100 transition-colors duration-200 min-w-[130px] sm:min-w-[150px] border-0"
                      onClick={() => handleSort("created_at")}
                    >
                      <div className="flex items-center text-sm sm:text-base">
                        Toegevoegd
                        {getSortIcon("created_at")}
                      </div>
                    </th>
                    <th className="text-left py-3 sm:py-4 px-3 sm:px-6 font-bold text-white w-20 sm:w-24 border-0 text-sm sm:text-base">
                      Acties
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAndSortedProducts.map((product, index) => (
                    <tr
                      key={product.id}
                      className={`border-b border-slate-100 hover:bg-[#0065FF]/[0.08] hover:shadow-[0_4px_12px_rgba(0,101,255,0.1)] transition-all duration-300 group cursor-pointer hover:border-[#0065FF]/20 ${
                        selectedProducts.has(product.id) ? "bg-[#0065FF]/[0.05] border-[#0065FF]/20" : ""
                      }`}
                      onClick={() => router.push(`/dashboard/fc/producten/${product.id}`)}
                    >
                      <td className="py-3 sm:py-4 px-3 sm:px-6 w-12 sm:w-16" onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedProducts.has(product.id)}
                          onCheckedChange={(checked) => handleSelectProduct(product.id, checked as boolean)}
                          className="data-[state=checked]:bg-[#0065FF] data-[state=checked]:border-[#0065FF] hover:scale-110 transition-transform duration-200 transform-gpu hover:shadow-md w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0"
                        />
                      </td>
                      <td className="py-3 sm:py-4 px-3 sm:px-6 w-16 sm:w-20">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg sm:rounded-xl bg-white border border-[#0065FF]/10 shadow-sm flex items-center justify-center p-1 sm:p-2 relative overflow-hidden">
                          {product.image_url ? (
                            <img
                              src={product.image_url || "/placeholder.svg"}
                              alt={`${product.name} afbeelding`}
                              className="w-full h-full object-contain"
                              sizes="64px"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement
                                target.style.display = "none"
                                const fallback = target.nextElementSibling as HTMLElement
                                if (fallback) fallback.classList.remove("hidden")
                              }}
                            />
                          ) : null}
                          <Package
                            className={`w-5 h-5 sm:w-6 sm:h-6 text-[#0065FF] ${product.image_url ? "hidden" : ""}`}
                          />
                        </div>
                      </td>
                      <td className="py-3 sm:py-4 px-3 sm:px-6 min-w-[180px] sm:min-w-[200px]">
                        <div className="font-medium text-slate-900 group-hover:text-[#0065FF] transition-colors duration-200 truncate text-sm sm:text-base">
                          {product.name}
                        </div>
                        {product.description && (
                          <div className="text-xs sm:text-sm text-slate-500 truncate mt-1">
                            {product.description.substring(0, 60)}...
                          </div>
                        )}
                      </td>
                      <td className="py-3 sm:py-4 px-3 sm:px-6 min-w-[100px] sm:min-w-[120px]">
                        <code className="bg-slate-100 px-2 py-1 rounded text-xs sm:text-sm font-mono">
                          {product.sku}
                        </code>
                      </td>
                      <td className="py-3 sm:py-4 px-3 sm:px-6 min-w-[90px] sm:min-w-[100px]">
                        <div className="flex items-center gap-1 sm:gap-2">
                          <Badge className={`${getStockColor(product.stock)} font-medium text-xs`}>
                            {getStockText(product.stock)}
                          </Badge>
                          <span className="text-xs sm:text-sm font-medium text-slate-700">{product.stock}</span>
                        </div>
                      </td>
                      <td className="py-3 sm:py-4 px-3 sm:px-6 min-w-[120px] sm:min-w-[150px]">
                        <div className="flex flex-wrap gap-1">
                          {getProductPlatforms(product)
                            .slice(0, 2)
                            .map((platform, idx) => (
                              <Badge key={idx} className={`${getPlatformColor(platform)} text-xs font-medium`}>
                                {platform}
                              </Badge>
                            ))}
                          {getProductPlatforms(product).length > 2 && (
                            <Badge className="bg-gray-100 text-gray-800 border-gray-200 text-xs font-medium">
                              +{getProductPlatforms(product).length - 2}
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="py-3 sm:py-4 px-3 sm:px-6 min-w-[160px] sm:min-w-[200px]">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-md sm:rounded-lg bg-white border border-[#0065FF]/10 shadow-sm flex items-center justify-center p-1 relative overflow-hidden flex-shrink-0">
                            {product.client_logo_url ? (
                              <img
                                src={product.client_logo_url || "/placeholder.svg"}
                                alt={`${product.client_company_name} logo`}
                                className="w-full h-full object-contain"
                                sizes="32px"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement
                                  target.style.display = "none"
                                  const fallback = target.nextElementSibling as HTMLElement
                                  if (fallback) fallback.classList.remove("hidden")
                                }}
                              />
                            ) : null}
                            <Building2
                              className={`w-3 h-3 sm:w-4 sm:h-4 text-[#0065FF] ${product.client_logo_url ? "hidden" : ""}`}
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-medium text-slate-900 group-hover:text-[#0065FF] transition-colors duration-200 truncate text-sm sm:text-base">
                              {product.client_company_name}
                            </div>
                            {product.client_address_city && product.client_address_country && (
                              <div className="flex items-center gap-1 text-xs text-slate-500">
                                <MapPin className="w-3 h-3 flex-shrink-0" />
                                <span className="truncate">
                                  {product.client_address_city}, {product.client_address_country}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 sm:py-4 px-3 sm:px-6 min-w-[130px] sm:min-w-[150px]">
                        <div className="flex items-center gap-1 sm:gap-2 text-slate-500">
                          <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                          <span className="text-xs sm:text-sm truncate">{formatDate(product.created_at)}</span>
                        </div>
                      </td>
                      <td className="py-3 sm:py-4 px-3 sm:px-6 w-20 sm:w-24" onClick={(e) => e.stopPropagation()}>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation()
                            router.push(`/dashboard/fc/producten/${product.id}`)
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-[#0065FF]/5 hover:border-[#0065FF]/20 hover:text-[#0065FF] w-8 h-8 sm:w-9 sm:h-9 p-0"
                        >
                          <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-md mx-4 sm:mx-0">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-base sm:text-lg">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
              </div>
              Producten verwijderen
            </DialogTitle>
            <DialogDescription className="text-slate-600 mt-2 text-sm sm:text-base">
              Weet je zeker dat je <span className="font-semibold text-slate-900">{selectedProducts.size}</span> product
              {selectedProducts.size !== 1 ? "en" : ""} wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-3 mt-6">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isDeleting}
              className="flex-1 text-sm sm:text-base"
            >
              Annuleren
            </Button>
            <Button
              onClick={handleDeleteSelected}
              disabled={isDeleting}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm sm:text-base"
            >
              {isDeleting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Verwijderen...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Verwijderen
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
