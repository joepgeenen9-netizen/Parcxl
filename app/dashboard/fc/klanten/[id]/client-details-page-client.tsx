"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Plus,
  Building2,
  Users,
  Package,
  Zap,
  MapPin,
  Calendar,
  Eye,
  Edit,
  ChevronDown,
  Trash2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import FCLayout from "../../_components/fc-layout"
import type { ClientDetailsData } from "@/types/client-details"
import { deleteClientIntegration } from "./actions"

interface TenantUser {
  id: string
  tenant_id: string
  username: string
  email: string
  is_admin: boolean
}

interface ClientDetailsPageClientProps {
  tenant: any
  user: TenantUser
  clientDetails: ClientDetailsData
}

export function ClientDetailsPageClient({
  tenant,
  user,
  clientDetails: initialClientDetails,
}: ClientDetailsPageClientProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [showIntegrationsDropdown, setShowIntegrationsDropdown] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [showProductsDropdown, setShowProductsDropdown] = useState(false)
  const [clientDetails, setClientDetails] = useState(initialClientDetails)
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean
    integrationId: string | null
    integrationName: string
  }>({
    open: false,
    integrationId: null,
    integrationName: "",
  })

  // Safely destructure with fallbacks
  const client = clientDetails?.client || {}
  const stats = clientDetails?.stats || {
    totalProducts: 0,
    totalUsers: 0,
    totalIntegrations: 0,
    activeIntegrations: 0,
  }
  const integrations = clientDetails?.integrations || []
  const products = clientDetails?.products || []
  const users = clientDetails?.users || []

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)

    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const formatDate = (dateString: string) => {
    if (!dateString) return "Onbekend"
    try {
      return new Date(dateString).toLocaleDateString("nl-NL", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    } catch (error) {
      console.error("Error formatting date:", error)
      return "Onbekend"
    }
  }

  const formatDateTime = (dateString: string) => {
    if (!dateString) return "Onbekend"
    try {
      return new Date(dateString).toLocaleDateString("nl-NL", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch (error) {
      console.error("Error formatting datetime:", error)
      return "Onbekend"
    }
  }

  const getPlatformIcon = (platform: string) => {
    if (!platform) return "🔌"
    switch (platform.toLowerCase()) {
      case "woocommerce":
        return "🛒"
      case "shopify":
        return "🛍️"
      case "bol.com":
        return "📦"
      case "ccv":
        return "🏪"
      case "magento":
        return "🏪"
      default:
        return "🔌"
    }
  }

  const getPlatformLogo = (platform: string) => {
    if (!platform) return null
    switch (platform.toLowerCase()) {
      case "shopify":
        return "https://zffyxtcwojwyqppjlrdi.supabase.co/storage/v1/object/sign/integratie-logo/Web-Ready-Large-Shopify-icon-1536x1536.webp?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9hZDkxMTA5Zi1kMDMyLTRhOWQtOTJmMC1iZjc2ZjI2NzBhZGMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbnRlZ3JhdGllLWxvZ28vV2ViLVJlYWR5LUxhcmdlLVNob3BpZnktaWNvbi0xNTM2eDE1MzYud2VicCIsImlhdCI6MTc1MjAwNDUzMCwiZXhwIjoxOTA5Njg0NTMwfQ.LDLl5qlby1nmYm2lsEjrV7hPgUydaiVoIouQs9waidk"
      case "woocommerce":
        return "/images/woocommerce-logo.png"
      case "bol.com":
        return "https://zffyxtcwojwyqppjlrdi.supabase.co/storage/v1/object/sign/integratie-logo/bol.webp?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9hZDkxMTA5Zi1kMDMyLTRhOWQtOTJmMC1iZjc2ZjI2NzBhZGMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbnRlZ3JhdGllLWxvZ28vYm9sLndlYnAiLCJpYXQiOjE3NTIwMDQ0ODIsImV4cCI6MTkwOTY4NDQ4Mn0.XjRrZesGZi1QiMZoVauQy79FbMr0N3vP-DyDyTXGaPU"
      case "ccv":
        return "https://zffyxtcwojwyqppjlrdi.supabase.co/storage/v1/object/sign/integratie-logo/CCV-icon.svg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9hZDkxMTA5Zi1kMDMyLTRhOWQtOTJmMC1iZjc2ZjI2NzBhZGMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbnRlZ3JhdGllLWxvZ28vQ0NWLWljb24uc3ZnIiwiaWF0IjoxNzUyMDA0NTA5LCJleHAiOjE5MDk2ODQ1MDl9.sA6qaARJDgXy5OeYFaEmKyAft3vgF0WPdjDqzllWQPA"
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    if (!status) return "bg-gray-100 text-gray-800 border-gray-200"
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200"
      case "inactive":
        return "bg-gray-100 text-gray-800 border-gray-200"
      case "suspended":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const availableIntegrations = [
    {
      name: "bol.com",
      logo: "https://zffyxtcwojwyqppjlrdi.supabase.co/storage/v1/object/sign/integratie-logo/bol.webp?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9hZDkxMTA5Zi1kMDMyLTRhOWQtOTJmMC1iZjc2ZjI2NzBhZGMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbnRlZ3JhdGllLWxvZ28vYm9sLndlYnAiLCJpYXQiOjE3NTIwMDQ0ODIsImV4cCI6MTkwOTY4NDQ4Mn0.XjRrZesGZi1QiMZoVauQy79FbMr0N3vP-DyDyTXGaPU",
    },
    {
      name: "CCV",
      logo: "https://zffyxtcwojwyqppjlrdi.supabase.co/storage/v1/object/sign/integratie-logo/CCV-icon.svg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9hZDkxMTA5Zi1kMDMyLTRhOWQtOTJmMC1iZjc2ZjI2NzBhZGMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbnRlZ3JhdGllLWxvZ28vQ0NWLWljb24uc3ZnIiwiaWF0IjoxNzUyMDA0NTA5LCJleHAiOjE5MDk2ODQ1MDl9.sA6qaARJDgXy5OeYFaEmKyAft3vgF0WPdjDqzllWQPA",
    },
    {
      name: "Shopify",
      logo: "https://zffyxtcwojwyqppjlrdi.supabase.co/storage/v1/object/sign/integratie-logo/Web-Ready-Large-Shopify-icon-1536x1536.webp?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9hZDkxMTA5Zi1kMDMyLTRhOWQtOTJmMC1iZjc2ZjI2NzBhZGMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbnRlZ3JhdGllLWxvZ28vV2ViLVJlYWR5LUxhcmdlLVNob3BpZnktaWNvbi0xNTM2eDE1MzYud2VicCIsImlhdCI6MTc1MjAwNDUzMCwiZXhwIjoxOTA5Njg0NTMwfQ.LDLl5qlby1nmYm2lsEjrV7hPgUydaiVoIouQs9waidk",
    },
    {
      name: "WooCommerce",
      logo: "/images/woocommerce-logo.png",
    },
  ]

  const getUniqueIntegrationPlatforms = () => {
    if (!Array.isArray(integrations)) return []

    try {
      const platforms = integrations
        .filter((integration) => integration && integration.active && integration.platform)
        .map((integration) => integration.platform.toLowerCase())

      // Remove duplicates and return unique platforms
      return [...new Set(platforms)]
    } catch (error) {
      console.error("Error getting unique integration platforms:", error)
      return []
    }
  }

  const handleDeleteIntegration = async () => {
    if (!deleteDialog.integrationId) return

    setIsLoading(true)
    try {
      const result = await deleteClientIntegration(deleteDialog.integrationId, tenant?.id)

      if (result?.success) {
        // Update the local state to remove the deleted integration
        const updatedIntegrations = integrations.filter((integration) => integration.id !== deleteDialog.integrationId)
        const updatedStats = {
          ...stats,
          totalIntegrations: updatedIntegrations.length,
          activeIntegrations: updatedIntegrations.filter((i) => i.active).length,
        }

        setClientDetails({
          ...clientDetails,
          integrations: updatedIntegrations,
          stats: updatedStats,
        })

        toast({
          title: "Integratie verwijderd",
          description: `${deleteDialog.integrationName} integratie is succesvol verwijderd.`,
        })
      } else {
        toast({
          title: "Fout bij verwijderen",
          description: result?.error || "Er is een fout opgetreden bij het verwijderen van de integratie.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting integration:", error)
      toast({
        title: "Fout bij verwijderen",
        description: "Er is een onverwachte fout opgetreden.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setDeleteDialog({ open: false, integrationId: null, integrationName: "" })
    }
  }

  const openDeleteDialog = (integrationId: string, integrationName: string) => {
    if (!integrationId || !integrationName) return

    setDeleteDialog({
      open: true,
      integrationId,
      integrationName,
    })
  }

  // Early return if no client data
  if (!client || !client.id) {
    return (
      <FCLayout user={user} tenant={tenant} searchPlaceholder="Zoek in klantgegevens...">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-slate-500">Klantgegevens konden niet worden geladen.</p>
            <Button onClick={() => router.push("/dashboard/fc/klanten")} className="mt-4">
              Terug naar overzicht
            </Button>
          </div>
        </div>
      </FCLayout>
    )
  }

  return (
    <FCLayout user={user} tenant={tenant} searchPlaceholder="Zoek in klantgegevens...">
      <div className="space-y-6 pb-8 md:pb-12">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/dashboard/fc/klanten")}
              className="flex items-center gap-2 hover:bg-[#0065FF]/5 hover:border-[#0065FF]/20 transition-all duration-200"
            >
              <ArrowLeft className="w-4 h-4" />
              Terug naar overzicht
            </Button>
          </div>
        </div>

        {/* Client Header */}
        <div className="bg-white/90 backdrop-blur-[20px] rounded-2xl p-8 border border-[#0065FF]/[0.08] shadow-[0_8px_30px_rgba(0,101,255,0.12)] relative overflow-hidden">
          {/* Animated background elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#0065FF]/5 to-[#FF8200]/5 rounded-full transform translate-x-16 -translate-y-16 animate-pulse" />
          <div
            className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-[#FF8200]/5 to-[#0065FF]/5 rounded-full transform -translate-x-12 translate-y-12 animate-pulse"
            style={{ animationDelay: "1s" }}
          />

          <div className="relative z-10 flex items-start gap-6">
            {/* Logo */}
            <div className="w-20 h-20 rounded-2xl bg-white border border-[#0065FF]/10 shadow-sm flex items-center justify-center p-3 flex-shrink-0">
              {client.logo_url ? (
                <img
                  src={client.logo_url || "/placeholder.svg"}
                  alt={`${client.company_name || "Client"} logo`}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.style.display = "none"
                    const nextElement = target.nextElementSibling as HTMLElement
                    if (nextElement) {
                      nextElement.classList.remove("hidden")
                    }
                  }}
                />
              ) : null}
              <Building2 className={`w-8 h-8 text-[#0065FF] ${client.logo_url ? "hidden" : ""}`} />
            </div>

            {/* Client Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-slate-900 mb-2">{client.company_name || "Onbekende klant"}</h1>
                  <div className="flex items-center gap-4 text-slate-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>Aangesloten op: {formatDate(client.created_at)}</span>
                    </div>
                    {client.address_city && client.address_country && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>
                          {client.address_city}, {client.address_country}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <Badge className={`${getStatusColor(client.status)} font-medium`}>
                  {client.status === "active" ? "Actief" : client.status === "inactive" ? "Inactief" : "Opgeschort"}
                </Badge>
              </div>

              {/* Contact Info */}
              {(client.contact_person || client.email || client.phone) && (
                <div className="bg-slate-50/80 rounded-xl p-4 space-y-2">
                  {client.contact_person && (
                    <div className="text-sm">
                      <span className="font-medium text-slate-700">Contactpersoon:</span>
                      <span className="ml-2 text-slate-600">{client.contact_person}</span>
                    </div>
                  )}
                  {client.email && (
                    <div className="text-sm">
                      <span className="font-medium text-slate-700">E-mail:</span>
                      <span className="ml-2 text-slate-600">{client.email}</span>
                    </div>
                  )}
                  {client.phone && (
                    <div className="text-sm">
                      <span className="font-medium text-slate-700">Telefoon:</span>
                      <span className="ml-2 text-slate-600">{client.phone}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/90 backdrop-blur-[20px] rounded-2xl p-6 border border-[#0065FF]/[0.08] transition-all duration-300 hover:transform hover:translate-y-[-4px] hover:shadow-[0_20px_40px_rgba(0,101,255,0.15)]">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FF8200]/10 to-[#FF8200]/5 flex items-center justify-center">
                <Package className="w-6 h-6 text-[#FF8200]" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">{stats.totalProducts}</div>
                <div className="text-sm text-slate-600">Producten</div>
              </div>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-[20px] rounded-2xl p-6 border border-[#0065FF]/[0.08] transition-all duration-300 hover:transform hover:translate-y-[-4px] hover:shadow-[0_20px_40px_rgba(0,101,255,0.15)]">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500/10 to-green-500/5 flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">{stats.totalUsers}</div>
                <div className="text-sm text-slate-600">Gebruikers</div>
              </div>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-[20px] rounded-2xl p-6 border border-[#0065FF]/[0.08] transition-all duration-300 hover:transform hover:translate-y-[-4px] hover:shadow-[0_20px_40px_rgba(0,101,255,0.15)]">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0065FF]/10 to-[#0065FF]/5 flex items-center justify-center">
                <Zap className="w-6 h-6 text-[#0065FF]" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">
                  {stats.activeIntegrations}/{stats.totalIntegrations}
                </div>
                <div className="text-sm text-slate-600">Integraties</div>
              </div>
            </div>
          </div>
        </div>

        {/* Integrations Section - Redesigned as Table */}
        <div className="bg-white/90 backdrop-blur-[20px] rounded-2xl border border-[#0065FF]/[0.08] overflow-hidden">
          <div className="p-6 border-b border-[#0065FF]/[0.08]">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Integraties</h2>
              <div className="relative">
                <Button
                  className="bg-gradient-to-r from-[#0065FF] to-[#0052CC] hover:from-[#0052CC] hover:to-[#0065FF] text-white shadow-[0_4px_12px_rgba(0,101,255,0.3)] transition-all duration-200 hover:shadow-[0_6px_20px_rgba(0,101,255,0.4)] hover:transform hover:translate-y-[-1px]"
                  onMouseEnter={() => setShowIntegrationsDropdown(true)}
                  onMouseLeave={() => setShowIntegrationsDropdown(false)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  <span className="hidden md:inline">Integratie toevoegen</span>
                  <span className="md:hidden">Toevoegen</span>
                  <ChevronDown className="w-4 h-4 ml-2" />
                </Button>

                {/* Custom Dropdown with hover bridge */}
                <div
                  className={`absolute top-full left-0 right-0 z-50 transition-all duration-300 ${
                    showIntegrationsDropdown
                      ? "opacity-100 visible transform translate-y-0"
                      : "opacity-0 invisible transform -translate-y-2"
                  }`}
                  onMouseEnter={() => setShowIntegrationsDropdown(true)}
                  onMouseLeave={() => setShowIntegrationsDropdown(false)}
                >
                  {/* Invisible bridge to maintain hover state */}
                  <div className="h-2 w-full" />

                  <div className="space-y-1.5">
                    {availableIntegrations.map((integration, index) => (
                      <div
                        key={integration.name}
                        className={`bg-white/95 backdrop-blur-[20px] border border-[#0065FF]/[0.08] shadow-[0_6px_16px_rgba(0,101,255,0.08)] rounded-lg p-2.5 cursor-pointer hover:bg-[#0065FF]/5 transition-all duration-300 hover:border-[#0065FF]/15 hover:shadow-[0_8px_20px_rgba(0,101,255,0.12)] hover:transform hover:translate-y-[-1px] ${
                          showIntegrationsDropdown
                            ? "animate-in slide-in-from-top-2 fade-in-0"
                            : "animate-out slide-out-to-top-2 fade-out-0"
                        }`}
                        style={{
                          animationDelay: showIntegrationsDropdown ? `${index * 60}ms` : "0ms",
                          animationDuration: "350ms",
                          animationFillMode: "both",
                        }}
                        onClick={() => {
                          if (integration.name === "WooCommerce") {
                            router.push(`/dashboard/fc/klanten/${client.id}/integraties/woocommerce`)
                          } else if (integration.name === "CCV") {
                            router.push(`/dashboard/fc/klanten/${client.id}/integraties/ccv`)
                          } else if (integration.name === "bol.com") {
                            router.push(`/dashboard/fc/klanten/${client.id}/integraties/bol`)
                          } else if (integration.name === "Shopify") {
                            router.push(`/dashboard/fc/klanten/${client.id}/integraties/shopify`)
                          } else {
                            console.log(`Selected integration: ${integration.name}`)
                          }
                          setShowIntegrationsDropdown(false)
                        }}
                      >
                        <div
                          className={`flex items-center ${
                            integration.name === "Shopify" || integration.name === "CCV" ? "gap-4 px-1" : "gap-2.5"
                          }`}
                        >
                          <img
                            src={integration.logo || "/placeholder.svg"}
                            alt={`${integration.name} logo`}
                            className={`object-contain flex-shrink-0 ${
                              integration.name === "Shopify" || integration.name === "CCV" ? "w-7 h-7" : "w-8 h-8"
                            }`}
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.style.display = "none"
                            }}
                          />
                          <div className="flex-1">
                            <span className="font-medium text-slate-900 text-sm">{integration.name}</span>
                          </div>
                          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#0065FF]/10 to-[#0065FF]/5 flex items-center justify-center opacity-60 hover:opacity-100 transition-all duration-200">
                            <Plus className="w-2.5 h-2.5 text-[#0065FF]" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Table Layout for Integrations */}
          <div className="p-6 min-h-[280px]">
            {integrations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Zap className="w-12 h-12 text-slate-300 mb-4" />
                <p className="text-slate-500">Nog geen integraties geconfigureerd</p>
              </div>
            ) : (
              <div className="space-y-3">
                {integrations.map((integration) => (
                  <div
                    key={integration.id}
                    className="flex items-center gap-4 p-4 border border-slate-200 rounded-xl hover:border-[#0065FF]/20 hover:shadow-[0_4px_12px_rgba(0,101,255,0.1)] transition-all duration-200 bg-white/50"
                  >
                    {/* Platform Logo */}
                    <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center">
                      {getPlatformLogo(integration.platform) ? (
                        <img
                          src={getPlatformLogo(integration.platform) || "/placeholder.svg"}
                          alt={`${integration.platform} logo`}
                          className="w-8 h-8 object-contain"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.style.display = "none"
                            const nextElement = target.nextElementSibling as HTMLElement
                            if (nextElement) {
                              nextElement.classList.remove("hidden")
                            }
                          }}
                        />
                      ) : null}
                      <span className={`text-2xl ${getPlatformLogo(integration.platform) ? "hidden" : ""}`}>
                        {getPlatformIcon(integration.platform)}
                      </span>
                    </div>

                    {/* Platform Name and Domain */}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-slate-900 capitalize text-base">{integration.platform}</div>
                      {integration.domain && (
                        <div className="text-sm text-slate-500 truncate">{integration.domain}</div>
                      )}
                    </div>

                    {/* Status Badge */}
                    <div className="flex-shrink-0">
                      <Badge
                        className={`${
                          integration.active
                            ? "bg-green-100 text-green-800 border-green-200"
                            : "bg-gray-100 text-gray-800 border-gray-200"
                        } font-medium`}
                      >
                        {integration.active ? "Actief" : "Inactief"}
                      </Badge>
                    </div>

                    {/* Added Date */}
                    <div className="flex-shrink-0 text-sm text-slate-400 min-w-0">
                      <div className="hidden sm:block">Toegevoegd: {formatDateTime(integration.created_at)}</div>
                      <div className="sm:hidden">{formatDateTime(integration.created_at)}</div>
                    </div>

                    {/* Delete Button */}
                    <div className="flex-shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        className="hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-all duration-200 bg-transparent"
                        onClick={() => openDeleteDialog(integration.id, integration.platform)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Products Section */}
        <div className="bg-white/90 backdrop-blur-[20px] rounded-2xl border border-[#0065FF]/[0.08] overflow-hidden">
          <div className="p-6 border-b border-[#0065FF]/[0.08]">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Producten</h2>
              <div className="relative">
                <Button
                  className="bg-gradient-to-r from-[#FF8200] to-[#E6730A] hover:from-[#E6730A] hover:to-[#FF8200] text-white shadow-[0_4px_12px_rgba(255,130,0,0.3)] transition-all duration-200 hover:shadow-[0_6px_20px_rgba(255,130,0,0.4)] hover:transform hover:translate-y-[-1px]"
                  onMouseEnter={() => setShowProductsDropdown(true)}
                  onMouseLeave={() => setShowProductsDropdown(false)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  <span className="hidden md:inline">Product toevoegen</span>
                  <span className="md:hidden">Toevoegen</span>
                  <ChevronDown className="w-4 h-4 ml-2" />
                </Button>

                {/* Products Dropdown */}
                <div
                  className={`absolute top-full left-0 right-0 z-50 transition-all duration-300 ${
                    showProductsDropdown
                      ? "opacity-100 visible transform translate-y-0"
                      : "opacity-0 invisible transform -translate-y-2"
                  }`}
                  onMouseEnter={() => setShowProductsDropdown(true)}
                  onMouseLeave={() => setShowProductsDropdown(false)}
                >
                  {/* Invisible bridge to maintain hover state */}
                  <div className="h-2 w-full" />

                  <div className="space-y-1.5">
                    {/* Manual option - always first */}
                    <div
                      className={`bg-white/95 backdrop-blur-[20px] border border-[#FF8200]/[0.08] shadow-[0_6px_16px_rgba(255,130,0,0.08)] rounded-lg p-2.5 cursor-pointer hover:bg-[#FF8200]/5 transition-all duration-300 hover:border-[#FF8200]/15 hover:shadow-[0_8px_20px_rgba(255,130,0,0.12)] hover:transform hover:translate-y-[-1px] ${
                        showProductsDropdown
                          ? "animate-in slide-in-from-top-2 fade-in-0"
                          : "animate-out slide-out-to-top-2 fade-out-0"
                      }`}
                      style={{
                        animationDelay: showProductsDropdown ? "0ms" : "0ms",
                        animationDuration: "350ms",
                        animationFillMode: "both",
                      }}
                      onClick={() => {
                        router.push(`/dashboard/fc/klanten/${client.id}/producten/handmatig`)
                        setShowProductsDropdown(false)
                      }}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FF8200]/10 to-[#FF8200]/5 flex items-center justify-center flex-shrink-0">
                          <Plus className="w-4 h-4 text-[#FF8200]" />
                        </div>
                        <div className="flex-1">
                          <span className="font-medium text-slate-900 text-sm">Handmatig</span>
                        </div>
                        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#FF8200]/10 to-[#FF8200]/5 flex items-center justify-center opacity-60 hover:opacity-100 transition-all duration-200">
                          <Plus className="w-2.5 h-2.5 text-[#FF8200]" />
                        </div>
                      </div>
                    </div>

                    {/* Integration-based options */}
                    {getUniqueIntegrationPlatforms().map((platform, index) => (
                      <div
                        key={platform}
                        className={`bg-white/95 backdrop-blur-[20px] border border-[#FF8200]/[0.08] shadow-[0_6px_16px_rgba(255,130,0,0.08)] rounded-lg p-2.5 cursor-pointer hover:bg-[#FF8200]/5 transition-all duration-300 hover:border-[#FF8200]/15 hover:shadow-[0_8px_20px_rgba(255,130,0,0.12)] hover:transform hover:translate-y-[-1px] ${
                          showProductsDropdown
                            ? "animate-in slide-in-from-top-2 fade-in-0"
                            : "animate-out slide-out-to-top-2 fade-out-0"
                        }`}
                        style={{
                          animationDelay: showProductsDropdown ? `${(index + 1) * 60}ms` : "0ms",
                          animationDuration: "350ms",
                          animationFillMode: "both",
                        }}
                        onClick={() => {
                          if (platform === "woocommerce") {
                            router.push(`/dashboard/fc/klanten/${client.id}/producten/woocommerce`)
                          } else if (platform === "shopify") {
                            router.push(`/dashboard/fc/klanten/${client.id}/producten/shopify`)
                          } else if (platform === "ccv") {
                            router.push(`/dashboard/fc/klanten/${client.id}/producten/ccv`)
                          } else {
                            console.log(`Import from ${platform} selected`)
                          }
                          setShowProductsDropdown(false)
                        }}
                      >
                        <div
                          className={`flex items-center ${
                            platform === "shopify" || platform === "ccv" ? "gap-4 px-1" : "gap-2.5"
                          }`}
                        >
                          {getPlatformLogo(platform) ? (
                            <img
                              src={getPlatformLogo(platform) || "/placeholder.svg"}
                              alt={`${platform} logo`}
                              className={`object-contain flex-shrink-0 ${
                                platform === "shopify" || platform === "ccv" ? "w-7 h-7" : "w-8 h-8"
                              }`}
                              onError={(e) => {
                                const target = e.target as HTMLImageElement
                                target.style.display = "none"
                              }}
                            />
                          ) : (
                            <span className="text-2xl">{getPlatformIcon(platform)}</span>
                          )}
                          <div className="flex-1">
                            <span className="font-medium text-slate-900 text-sm capitalize">
                              Importeren uit{" "}
                              {platform === "bol.com" ? "bol.com" : platform === "ccv" ? "CCV" : platform}
                            </span>
                          </div>
                          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#FF8200]/10 to-[#FF8200]/5 flex items-center justify-center opacity-60 hover:opacity-100 transition-all duration-200">
                            <Plus className="w-2.5 h-2.5 text-[#FF8200]" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="p-6 min-h-[280px]">
            {products.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 mb-4">Nog geen producten toegevoegd</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 px-4 font-medium text-slate-700">Product</th>
                      <th className="text-left py-3 px-4 font-medium text-slate-700">SKU</th>
                      <th className="text-left py-3 px-4 font-medium text-slate-700">Voorraad</th>
                      <th className="text-left py-3 px-4 font-medium text-slate-700">Locatie</th>
                      <th className="text-left py-3 px-4 font-medium text-slate-700">Acties</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr
                        key={product.id}
                        className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors duration-150"
                      >
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                              {product.image_url ? (
                                <img
                                  src={product.image_url || "/placeholder.svg"}
                                  alt={product.name}
                                  className="w-full h-full object-cover rounded-lg"
                                />
                              ) : (
                                <Package className="w-5 h-5 text-slate-400" />
                              )}
                            </div>
                            <div>
                              <div className="font-medium text-slate-900">{product.name}</div>
                              {product.description && (
                                <div className="text-sm text-slate-500 truncate max-w-xs">{product.description}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <code className="bg-slate-100 px-2 py-1 rounded text-sm font-mono">{product.sku}</code>
                        </td>
                        <td className="py-4 px-4">
                          <Badge
                            className={product.stock > 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                          >
                            {product.stock}
                          </Badge>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-slate-600">{product.location || "-"}</span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="hover:bg-[#0065FF]/5 hover:border-[#0065FF]/20 bg-transparent"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="hover:bg-[#FF8200]/5 hover:border-[#FF8200]/20 bg-transparent"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Users Section */}
        <div className="bg-white/90 backdrop-blur-[20px] rounded-2xl border border-[#0065FF]/[0.08] overflow-hidden">
          <div className="p-6 border-b border-[#0065FF]/[0.08]">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Gebruikers</h2>
              <Button
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-600 text-white shadow-[0_4px_12px_rgba(34,197,94,0.3)] transition-all duration-200 hover:shadow-[0_6px_20px_rgba(34,197,94,0.4)] hover:transform hover:translate-y-[-1px]"
                onClick={() => router.push(`/dashboard/fc/klanten/${client.id}/gebruikers/nieuw`)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Gebruiker toevoegen
              </Button>
            </div>
          </div>
          <div className="p-6">
            {users.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 mb-4">Nog geen gebruikers toegevoegd</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="border border-slate-200 rounded-xl p-4 hover:border-[#0065FF]/20 hover:shadow-[0_4px_12px_rgba(0,101,255,0.1)] transition-all duration-200"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0065FF] to-[#0052CC] flex items-center justify-center text-white font-bold text-sm">
                          {user.name ? user.name.substring(0, 2).toUpperCase() : "??"}
                        </div>
                        <div>
                          <div className="font-medium text-slate-900">{user.name}</div>
                          <div className="text-sm text-slate-500">{user.email}</div>
                          {user.position && <div className="text-xs text-slate-400">{user.position}</div>}
                        </div>
                      </div>
                      <Badge className={getStatusColor(user.status)}>
                        {user.status === "active" ? "Actief" : user.status === "inactive" ? "Inactief" : "Opgeschort"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">
                        {user.role}
                      </Badge>
                      <div className="text-xs text-slate-400">{formatDateTime(user.created_at)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Integratie verwijderen</DialogTitle>
              <DialogDescription>
                Weet je zeker dat je de <strong>{deleteDialog.integrationName}</strong> integratie wilt verwijderen?
                Deze actie kan niet ongedaan worden gemaakt.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDeleteDialog({ open: false, integrationId: null, integrationName: "" })}
                disabled={isLoading}
              >
                Annuleren
              </Button>
              <Button variant="destructive" onClick={handleDeleteIntegration} disabled={isLoading}>
                {isLoading ? "Verwijderen..." : "Verwijderen"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </FCLayout>
  )
}
