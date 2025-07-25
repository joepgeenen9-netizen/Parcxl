"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Loader2,
  AlertCircle,
  Zap,
  Shield,
  Globe,
  Key,
  Store,
  ExternalLink,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import FCLayout from "../../../_components/fc-layout"

interface TenantUser {
  id: string
  tenant_id: string
  username: string
  email: string
  is_admin: boolean
}

interface Client {
  id: string
  company_name: string
  contact_person?: string
  email?: string
  phone?: string
  status: string
  created_at: string
}

interface Integration {
  id: string
  client_id: string
  platform: string
  domain?: string
  api_key?: string
  active: boolean
  created_at: string
}

interface ShopifySetupClientProps {
  tenant: any
  user: TenantUser
  client: Client
  existingIntegration?: Integration | null
}

export function ShopifySetupClient({ tenant, user, client, existingIntegration }: ShopifySetupClientProps) {
  const router = useRouter()
  const { toast } = useToast()

  const [domain, setDomain] = useState(existingIntegration?.domain || "")
  const [accessToken, setAccessToken] = useState("")
  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<"idle" | "testing" | "success" | "error">("idle")
  const [connectionError, setConnectionError] = useState("")
  const [shopInfo, setShopInfo] = useState<any>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)

  // Show form with animation after component mounts
  useEffect(() => {
    const timer = setTimeout(() => setShowForm(true), 100)
    return () => clearTimeout(timer)
  }, [])

  // Auto-test connection when both fields are filled
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (domain.trim() && accessToken.trim() && connectionStatus !== "testing") {
        testConnection()
      }
    }, 1000)

    return () => clearTimeout(timeoutId)
  }, [domain, accessToken])

  const testConnection = async () => {
    if (!domain.trim() || !accessToken.trim()) {
      return
    }

    setIsTestingConnection(true)
    setConnectionStatus("testing")
    setConnectionError("")
    setShopInfo(null)

    try {
      const response = await fetch("/api/test-shopify-connection", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          domain: domain.trim(),
          accessToken: accessToken.trim(),
        }),
      })

      const result = await response.json()

      if (result.success) {
        setConnectionStatus("success")
        setShopInfo(result.shopInfo)
        toast({
          title: "🎉 Verbinding succesvol!",
          description: `Verbonden met ${result.shopInfo?.name || "je Shopify winkel"}`,
        })
      } else {
        setConnectionStatus("error")
        setConnectionError(result.error || "Onbekende fout")
        toast({
          title: "❌ Verbinding mislukt",
          description: result.error || "Kon geen verbinding maken met Shopify API",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      setConnectionStatus("error")
      setConnectionError("Netwerkfout - controleer je internetverbinding")
      toast({
        title: "❌ Verbinding mislukt",
        description: "Netwerkfout - controleer je internetverbinding",
        variant: "destructive",
      })
    } finally {
      setIsTestingConnection(false)
    }
  }

  const handleSaveIntegration = async () => {
    if (connectionStatus !== "success") {
      toast({
        title: "⚠️ Kan integratie niet opslaan",
        description: "Test eerst de verbinding voordat je de integratie opslaat.",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)

    try {
      const response = await fetch("/api/save-shopify-integration", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clientId: client.id,
          domain: domain.trim(),
          accessToken: accessToken.trim(),
          shopInfo,
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "🚀 Integratie toegevoegd!",
          description: "Shopify integratie is succesvol geconfigureerd.",
        })
        router.push(`/dashboard/fc/klanten/${client.id}`)
      } else {
        toast({
          title: "❌ Fout bij opslaan",
          description: result.error || "Kon integratie niet opslaan",
          variant: "destructive",
        })
        setIsSaving(false)
      }
    } catch (error: any) {
      toast({
        title: "❌ Fout bij opslaan",
        description: "Netwerkfout - probeer het opnieuw",
        variant: "destructive",
      })
      setIsSaving(false)
    }
  }

  const normalizeDomain = (value: string) => {
    let cleanValue = value.replace(/\/+$/, "")
    if (cleanValue && !cleanValue.includes(".myshopify.com") && !cleanValue.startsWith("http")) {
      cleanValue = cleanValue + ".myshopify.com"
    }
    if (cleanValue && !cleanValue.startsWith("http://") && !cleanValue.startsWith("https://")) {
      cleanValue = "https://" + cleanValue
    }
    return cleanValue
  }

  return (
    <FCLayout user={user} tenant={tenant} searchPlaceholder="Zoek in klantgegevens...">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50/30 to-emerald-50/50 -m-4 lg:-m-10 p-4 lg:p-10">
        <div className="space-y-8 pb-8 md:pb-12">
          {/* Header */}
          <div className="flex items-center justify-between animate-in slide-in-from-top-4 duration-700">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/dashboard/fc/klanten/${client.id}`)}
              className="group flex items-center gap-2 bg-white/80 backdrop-blur-sm border-white/20 hover:bg-white hover:border-green-200/50 hover:shadow-lg transition-all duration-300 hover:scale-105"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
              Terug naar {client.company_name}
            </Button>
          </div>

          {/* Hero Section */}
          <div
            className={`transition-all duration-1000 ${showForm ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          >
            <div className="relative overflow-hidden bg-gradient-to-br from-white via-green-50/50 to-emerald-100/30 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl shadow-green-500/10">
              {/* Animated Background Elements */}
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-green-400/20 to-emerald-600/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-emerald-400/20 to-green-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
              </div>

              <div className="relative p-12">
                <div className="flex items-center justify-center mb-8">
                  {/* Large Shopify Logo */}
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
                    <div className="relative w-20 h-20 bg-white rounded-2xl shadow-lg flex items-center justify-center p-3 group-hover:scale-110 transition-transform duration-300">
                      <img
                        src="https://zffyxtcwojwyqppjlrdi.supabase.co/storage/v1/object/sign/integratie-logo/Web-Ready-Large-Shopify-icon-1536x1536.webp?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9hZDkxMTA5Zi1kMDMyLTRhOWQtOTJmMC1iZjc2ZjI2NzBhZGMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbnRlZ3JhdGllLWxvZ28vV2ViLVJlYWR5LUxhcmdlLVNob3BpZnktaWNvbi0xNTM2eDE1MzYud2VicCIsImlhdCI6MTc1MjAwNDUzMCwiZXhwIjoxOTA5Njg0NTMwfQ.LDLl5qlby1nmYm2lsEjrV7hPgUydaiVoIouQs9waidk"
                        alt="Shopify logo"
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.style.display = "none"
                          target.nextElementSibling?.classList.remove("hidden")
                        }}
                      />
                      <Store className="w-12 h-12 text-green-600 hidden" />
                    </div>
                  </div>
                </div>

                <div className="text-center space-y-4">
                  <h1 className="text-5xl font-bold bg-gradient-to-r from-slate-900 via-green-800 to-emerald-900 bg-clip-text text-transparent animate-in slide-in-from-bottom-4 duration-700 delay-200">
                    Shopify Integratie
                  </h1>
                  <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed animate-in slide-in-from-bottom-4 duration-700 delay-300">
                    Verbind je Shopify winkel met{" "}
                    <span className="font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                      {client.company_name}
                    </span>{" "}
                    voor automatische ordersynchronisatie
                  </p>

                  {/* Feature Pills */}
                  <div className="flex flex-wrap justify-center gap-3 mt-8 animate-in slide-in-from-bottom-4 duration-700 delay-500">
                    <div className="flex items-center gap-2 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full border border-white/30 hover:bg-white/80 transition-all duration-300 hover:scale-105">
                      <Zap className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm font-medium text-slate-700">Realtime sync</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full border border-white/30 hover:bg-white/80 transition-all duration-300 hover:scale-105">
                      <Shield className="w-4 h-4 text-green-500" />
                      <span className="text-sm font-medium text-slate-700">Veilig & betrouwbaar</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full border border-white/30 hover:bg-white/80 transition-all duration-300 hover:scale-105">
                      <Globe className="w-4 h-4 text-green-500" />
                      <span className="text-sm font-medium text-slate-700">Automatische updates</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Connection Status */}
          {domain.trim() && accessToken.trim() && (
            <div
              className={`transition-all duration-500 ${showForm ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
            >
              <div
                className={`relative overflow-hidden rounded-2xl border backdrop-blur-xl transition-all duration-500 ${
                  connectionStatus === "success"
                    ? "bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200/50 shadow-lg shadow-emerald-500/10"
                    : connectionStatus === "error"
                      ? "bg-gradient-to-r from-red-50 to-rose-50 border-red-200/50 shadow-lg shadow-red-500/10"
                      : "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200/50 shadow-lg shadow-green-500/10"
                }`}
              >
                <div className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      {connectionStatus === "testing" && (
                        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                          <Loader2 className="w-6 h-6 text-green-600 animate-spin" />
                        </div>
                      )}
                      {connectionStatus === "success" && (
                        <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center animate-in zoom-in-50 duration-300">
                          <CheckCircle className="w-6 h-6 text-emerald-600" />
                        </div>
                      )}
                      {connectionStatus === "error" && (
                        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center animate-in zoom-in-50 duration-300">
                          <XCircle className="w-6 h-6 text-red-600" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      {connectionStatus === "testing" && (
                        <div className="space-y-1">
                          <p className="font-semibold text-green-800">🔄 Verbinding testen...</p>
                          <p className="text-sm text-green-600">Even geduld, we controleren je Shopify API gegevens</p>
                        </div>
                      )}
                      {connectionStatus === "success" && (
                        <div className="space-y-1">
                          <p className="font-bold text-emerald-800">🎉 Verbinding succesvol!</p>
                          <p className="text-sm text-emerald-600">
                            {shopInfo
                              ? `Verbonden met ${shopInfo.name} (${shopInfo.domain})`
                              : "Shopify API reageert perfect en is klaar voor gebruik"}
                          </p>
                        </div>
                      )}
                      {connectionStatus === "error" && (
                        <div className="space-y-1">
                          <p className="font-bold text-red-800">❌ Verbinding mislukt</p>
                          {connectionError && <p className="text-sm text-red-600">{connectionError}</p>}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Form Section */}
          <div
            className={`transition-all duration-700 delay-200 ${showForm ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          >
            <div className="relative overflow-hidden bg-white/80 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl shadow-slate-500/10">
              <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-green-50/30"></div>

              <div className="relative p-8 lg:p-12">
                <div className="max-w-2xl mx-auto space-y-8">
                  <div className="text-center space-y-2">
                    <h2 className="text-2xl font-bold text-slate-900">API Configuratie</h2>
                    <p className="text-slate-600">Voer je Shopify API gegevens in om de integratie te activeren</p>
                  </div>

                  <div className="space-y-6">
                    {/* Domain Field */}
                    <div className="group space-y-3">
                      <Label htmlFor="domain" className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                        <Globe className="w-4 h-4 text-green-500" />
                        Shop Domein
                        <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <Input
                          id="domain"
                          type="text"
                          placeholder="mijnwinkel.myshopify.com"
                          value={domain}
                          onChange={(e) => setDomain(normalizeDomain(e.target.value))}
                          className="h-14 text-base pl-4 pr-12 border-2 border-slate-200 focus:border-green-400 focus:ring-4 focus:ring-green-100 transition-all duration-300 rounded-xl bg-white/50 backdrop-blur-sm group-hover:border-slate-300"
                          required
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                          <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                            <Globe className="w-3 h-3 text-green-600" />
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Je Shopify winkel domein (bijvoorbeeld: mijnwinkel.myshopify.com)
                      </p>
                    </div>

                    {/* Access Token Field */}
                    <div className="group space-y-3">
                      <Label
                        htmlFor="accessToken"
                        className="flex items-center gap-2 text-sm font-semibold text-slate-700"
                      >
                        <Key className="w-4 h-4 text-green-500" />
                        Access Token
                        <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <Input
                          id="accessToken"
                          type="password"
                          placeholder="shpat_1234567890abcdef1234567890abcdef"
                          value={accessToken}
                          onChange={(e) => setAccessToken(e.target.value.trim())}
                          className="h-14 text-base font-mono pl-4 pr-12 border-2 border-slate-200 focus:border-green-400 focus:ring-4 focus:ring-green-100 transition-all duration-300 rounded-xl bg-white/50 backdrop-blur-sm group-hover:border-slate-300"
                          required
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                          <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                            <Key className="w-3 h-3 text-green-600" />
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Je Shopify Admin API Access Token
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-center gap-4 pt-8 border-t border-slate-100">
                    <Button
                      onClick={testConnection}
                      disabled={!domain.trim() || !accessToken.trim() || isTestingConnection}
                      variant="outline"
                      className="group h-12 px-8 bg-white/80 backdrop-blur-sm border-2 border-slate-200 hover:border-green-300 hover:bg-green-50 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                    >
                      {isTestingConnection ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Testen...
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4 mr-2 group-hover:text-green-600 transition-colors" />
                          Test Verbinding
                        </>
                      )}
                    </Button>

                    {connectionStatus === "success" && (
                      <Button
                        onClick={handleSaveIntegration}
                        disabled={isSaving}
                        className="group h-12 px-8 bg-gradient-to-r from-green-600 via-emerald-600 to-green-600 hover:from-green-700 hover:via-emerald-700 hover:to-green-700 text-white shadow-xl shadow-green-500/25 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-green-500/40 border-0"
                      >
                        {isSaving ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Opslaan...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                            Integratie Toevoegen
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Help Section */}
          <div
            className={`transition-all duration-700 delay-400 ${showForm ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          >
            <div className="relative overflow-hidden bg-gradient-to-br from-slate-50/80 via-white/50 to-green-50/80 backdrop-blur-xl rounded-3xl border border-white/20 shadow-xl">
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-green-50/20 to-emerald-50/30"></div>

              <div className="relative p-8 lg:p-12">
                <div className="max-w-5xl mx-auto">
                  <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 mb-6 shadow-lg shadow-green-500/25">
                      <AlertCircle className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-3xl font-bold text-slate-900 mb-4">Hoe krijg ik mijn Shopify API gegevens?</h3>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                      Volg deze eenvoudige stappen om je API sleutels te verkrijgen
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                    {[
                      {
                        step: 1,
                        title: "Log in op je Shopify Admin",
                        description: "Ga naar je Shopify admin panel en log in met je beheerdersaccount.",
                        icon: Globe,
                        color: "green",
                      },
                      {
                        step: 2,
                        title: "Maak een Private App",
                        description: "Ga naar Apps → App and sales channel settings → Develop apps → Create an app",
                        icon: Key,
                        color: "blue",
                      },
                      {
                        step: 3,
                        title: "Configureer API toegang",
                        description: "Stel de juiste Admin API scopes in en genereer je API credentials.",
                        icon: Shield,
                        color: "purple",
                      },
                      {
                        step: 4,
                        title: "Kopieer je Access Token",
                        description: "Kopieer je Admin API Access Token naar dit formulier.",
                        icon: CheckCircle,
                        color: "emerald",
                      },
                    ].map((item, index) => (
                      <div
                        key={item.step}
                        className="group relative bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/30 hover:bg-white/80 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 text-white font-bold flex items-center justify-center text-lg shadow-lg shadow-green-500/25 group-hover:scale-110 transition-transform duration-300">
                            {item.step}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-slate-800 mb-2 group-hover:text-slate-900 transition-colors">
                              {item.title}
                            </h4>
                            <p className="text-sm text-slate-600 leading-relaxed">{item.description}</p>
                          </div>
                          <item.icon className="w-6 h-6 text-green-500 group-hover:scale-110 transition-transform duration-300" />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-12 bg-gradient-to-r from-green-50 via-emerald-50 to-green-50 border border-green-200/50 rounded-2xl p-8 shadow-inner">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shrink-0 shadow-lg">
                        <AlertCircle className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 mb-3 text-lg">💡 Belangrijke tips</h4>
                        <ul className="space-y-2 text-sm text-slate-700">
                          <li className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                            Zorg ervoor dat je private app de juiste scopes heeft (products, inventory, orders)
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                            Bewaar je API gegevens veilig - deze geven toegang tot je winkel data
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                            Test altijd de verbinding voordat je de integratie opslaat
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                            Je winkel domein moet eindigen op .myshopify.com
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Quick Links */}
                  <div className="mt-8 flex justify-center">
                    <Button
                      variant="outline"
                      className="group bg-white/80 backdrop-blur-sm border-green-200 hover:bg-green-50 hover:border-green-300 transition-all duration-300"
                      onClick={() => window.open("https://help.shopify.com/en/manual/apps/private-apps", "_blank")}
                    >
                      <ExternalLink className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                      Shopify Documentatie
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes ripple {
          to {
            transform: scale(4);
            opacity: 0;
          }
        }
        
        .animate-in {
          animation-fill-mode: both;
        }
        
        .slide-in-from-top-4 {
          animation: slideInFromTop 0.5s ease-out;
        }
        
        .slide-in-from-bottom-4 {
          animation: slideInFromBottom 0.5s ease-out;
        }
        
        .zoom-in-50 {
          animation: zoomIn 0.3s ease-out;
        }
        
        @keyframes slideInFromTop {
          from {
            opacity: 0;
            transform: translateY(-16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideInFromBottom {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes zoomIn {
          from {
            opacity: 0;
            transform: scale(0.5);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </FCLayout>
  )
}
