"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
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
  ExternalLink,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import FCLayout from "../../../_components/fc-layout"
import { testBolConnection, saveBolIntegration } from "./actions"

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
  email: string
  phone: string
  contact_person: string
  logo_url: string
  status: string
  created_at: string
  address_city?: string
  address_country?: string
}

interface BolSetupClientProps {
  tenant: any
  user: TenantUser
  client: Client
  existingIntegration: any
}

export function BolSetupClient({ tenant, user, client, existingIntegration }: BolSetupClientProps) {
  const router = useRouter()
  const { toast } = useToast()

  const [apiKey, setApiKey] = useState(existingIntegration?.api_key || "")
  const [apiSecret, setApiSecret] = useState(existingIntegration?.api_secret || "")
  const [accessToken, setAccessToken] = useState("")
  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<"idle" | "testing" | "success" | "error">("idle")
  const [connectionError, setConnectionError] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)

  // Show form with animation after component mounts
  useEffect(() => {
    const timer = setTimeout(() => setShowForm(true), 100)
    return () => clearTimeout(timer)
  }, [])

  // Set initial connection status if existing integration
  useEffect(() => {
    if (existingIntegration?.active) {
      setConnectionStatus("success")
      setAccessToken(existingIntegration.access_token || "")
    }
  }, [existingIntegration])

  const testConnection = async () => {
    if (!apiKey.trim() || !apiSecret.trim()) {
      toast({
        title: "⚠️ Ontbrekende gegevens",
        description: "Voer zowel API Key als API Secret in.",
        variant: "destructive",
      })
      return
    }

    setIsTestingConnection(true)
    setConnectionStatus("testing")
    setConnectionError("")

    try {
      const result = await testBolConnection({
        clientId: apiKey.trim(),
        clientSecret: apiSecret.trim(),
      })

      if (result.success && result.accessToken) {
        setConnectionStatus("success")
        setAccessToken(result.accessToken)
        toast({
          title: "🎉 Verbinding succesvol!",
          description: "bol.com API verbinding is getest en werkt perfect.",
        })
      } else {
        setConnectionStatus("error")
        setConnectionError(result.error || "Onbekende fout bij het testen van de verbinding.")
        toast({
          title: "❌ Verbinding mislukt",
          description: result.error || "Controleer je API gegevens en probeer opnieuw.",
          variant: "destructive",
        })
      }
    } catch (error) {
      setConnectionStatus("error")
      setConnectionError("Netwerkfout bij het testen van de verbinding.")
      toast({
        title: "❌ Verbinding mislukt",
        description: "Netwerkfout. Probeer het later opnieuw.",
        variant: "destructive",
      })
    } finally {
      setIsTestingConnection(false)
    }
  }

  // Auto-test connection when all fields are filled (only for new integrations)
  useEffect(() => {
    if (!existingIntegration?.active) {
      const timeoutId = setTimeout(() => {
        if (apiKey.trim() && apiSecret.trim() && connectionStatus !== "testing" && connectionStatus !== "success") {
          testConnection()
        }
      }, 1000)

      return () => clearTimeout(timeoutId)
    }
  }, [apiKey, apiSecret, existingIntegration])

  const handleSaveIntegration = async () => {
    if (connectionStatus !== "success" || !accessToken) {
      toast({
        title: "⚠️ Kan integratie niet opslaan",
        description: "Test eerst de verbinding voordat je de integratie opslaat.",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)

    try {
      const result = await saveBolIntegration({
        clientId: client.id,
        tenantId: tenant.id,
        apiKey: apiKey.trim(),
        apiSecret: apiSecret.trim(),
        accessToken: accessToken,
      })

      if (result.success) {
        toast({
          title: "🚀 Integratie opgeslagen!",
          description: "bol.com integratie is succesvol geconfigureerd.",
        })

        // Redirect back to client details after a short delay
        setTimeout(() => {
          router.push(`/dashboard/fc/klanten/${client.id}`)
        }, 2000)
      } else {
        toast({
          title: "❌ Opslaan mislukt",
          description: result.error || "Er is een fout opgetreden bij het opslaan.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "❌ Opslaan mislukt",
        description: "Onverwachte fout bij het opslaan van de integratie.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Helper function to get step background classes
  const getStepClasses = (step: number) => {
    switch (step) {
      case 1:
        return "bg-gradient-to-br from-[#003D82] to-blue-600"
      case 2:
        return "bg-gradient-to-br from-blue-500 to-blue-600"
      case 3:
        return "bg-gradient-to-br from-indigo-500 to-indigo-600"
      case 4:
        return "bg-gradient-to-br from-emerald-500 to-emerald-600"
      default:
        return "bg-gradient-to-br from-gray-500 to-gray-600"
    }
  }

  // Helper function to get icon classes
  const getIconClasses = (step: number) => {
    switch (step) {
      case 1:
        return "text-[#003D82]"
      case 2:
        return "text-blue-500"
      case 3:
        return "text-indigo-500"
      case 4:
        return "text-emerald-500"
      default:
        return "text-gray-500"
    }
  }

  return (
    <FCLayout user={user} tenant={tenant} searchPlaceholder="Zoek in klantgegevens...">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 -m-4 lg:-m-10 p-4 lg:p-10">
        <div className="space-y-8 pb-8 md:pb-12">
          {/* Animated Header */}
          <div className="flex items-center justify-between animate-in slide-in-from-top-4 duration-700">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/dashboard/fc/klanten/${client.id}`)}
              className="group flex items-center gap-2 bg-white/80 backdrop-blur-sm border-white/20 hover:bg-white hover:border-blue-200/50 hover:shadow-lg transition-all duration-300 hover:scale-105"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
              Terug naar {client.company_name}
            </Button>
          </div>

          {/* Hero Section */}
          <div
            className={`transition-all duration-1000 ${showForm ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          >
            <div className="relative overflow-hidden bg-gradient-to-br from-white via-blue-50/50 to-[#003D82]/5 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl shadow-[#003D82]/10">
              {/* Animated Background Elements */}
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-[#003D82]/20 to-blue-600/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-[#003D82]/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
              </div>

              <div className="relative p-12">
                <div className="flex items-center justify-center mb-8">
                  {/* Large bol.com Logo - No Border */}
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#003D82] to-blue-600 rounded-3xl blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-300 scale-110"></div>
                    <div className="relative group-hover:scale-110 transition-transform duration-300">
                      <Image
                        src="/images/bol-logo.webp"
                        alt="bol.com logo"
                        width={120}
                        height={80}
                        className="object-contain drop-shadow-lg"
                      />
                    </div>
                  </div>
                </div>

                <div className="text-center space-y-4">
                  <h1 className="text-5xl font-bold bg-gradient-to-r from-slate-900 via-[#003D82] to-blue-900 bg-clip-text text-transparent animate-in slide-in-from-bottom-4 duration-700 delay-200">
                    bol.com Integratie
                  </h1>
                  <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed animate-in slide-in-from-bottom-4 duration-700 delay-300">
                    Verbind je bol.com Partner account met{" "}
                    <span className="font-bold bg-gradient-to-r from-[#003D82] to-blue-600 bg-clip-text text-transparent">
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
                      <Globe className="w-4 h-4 text-[#003D82]" />
                      <span className="text-sm font-medium text-slate-700">Automatische updates</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Section */}
          <div
            className={`transition-all duration-700 delay-200 ${showForm ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          >
            <div className="relative overflow-hidden bg-white/80 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl shadow-slate-500/10">
              <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-[#003D82]/5"></div>

              <div className="relative p-8 lg:p-12">
                <div className="max-w-2xl mx-auto space-y-8">
                  <div className="text-center space-y-2">
                    <h2 className="text-2xl font-bold text-slate-900">API Configuratie</h2>
                    <p className="text-slate-600">
                      Voer je bol.com Partner API gegevens in om de integratie te activeren
                    </p>
                  </div>

                  <div className="space-y-6">
                    {/* API Key Field */}
                    <div className="group space-y-3">
                      <Label htmlFor="apiKey" className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                        <Key className="w-4 h-4 text-[#003D82]" />
                        API Key (Client ID)
                        <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <Input
                          id="apiKey"
                          type="text"
                          placeholder="Voer je bol.com API Key in"
                          value={apiKey}
                          onChange={(e) => {
                            setApiKey(e.target.value.trim())
                            setConnectionStatus("idle")
                            setConnectionError("")
                          }}
                          className="h-14 text-base font-mono pl-4 pr-12 border-2 border-slate-200 focus:border-[#003D82] focus:ring-4 focus:ring-[#003D82]/10 transition-all duration-300 rounded-xl bg-white/50 backdrop-blur-sm group-hover:border-slate-300"
                          required
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                          <div className="w-6 h-6 rounded-full bg-[#003D82]/10 flex items-center justify-center">
                            <Key className="w-3 h-3 text-[#003D82]" />
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Je bol.com Partner API Key (Client ID)
                      </p>
                    </div>

                    {/* API Secret Field */}
                    <div className="group space-y-3">
                      <Label
                        htmlFor="apiSecret"
                        className="flex items-center gap-2 text-sm font-semibold text-slate-700"
                      >
                        <Shield className="w-4 h-4 text-blue-500" />
                        API Secret (Client Secret)
                        <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <Input
                          id="apiSecret"
                          type="password"
                          placeholder="Voer je bol.com API Secret in"
                          value={apiSecret}
                          onChange={(e) => {
                            setApiSecret(e.target.value.trim())
                            setConnectionStatus("idle")
                            setConnectionError("")
                          }}
                          className="h-14 text-base font-mono pl-4 pr-12 border-2 border-slate-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all duration-300 rounded-xl bg-white/50 backdrop-blur-sm group-hover:border-slate-300"
                          required
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                          <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                            <Shield className="w-3 h-3 text-blue-600" />
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Je bol.com Partner API Secret (Client Secret)
                      </p>
                    </div>
                  </div>

                  {/* Connection Status - Subtly placed under the form */}
                  {(apiKey.trim() && apiSecret.trim()) || connectionStatus !== "idle" ? (
                    <div className="transition-all duration-500">
                      <div
                        className={`relative overflow-hidden rounded-lg border backdrop-blur-sm transition-all duration-500 ${
                          connectionStatus === "success"
                            ? "bg-gradient-to-r from-emerald-50/60 to-green-50/60 border-emerald-200/30"
                            : connectionStatus === "error"
                              ? "bg-gradient-to-r from-red-50/60 to-rose-50/60 border-red-200/30"
                              : "bg-gradient-to-r from-blue-50/60 to-[#003D82]/5 border-[#003D82]/10"
                        }`}
                      >
                        <div className="p-3">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              {connectionStatus === "testing" && (
                                <div className="w-6 h-6 rounded-full bg-[#003D82]/10 flex items-center justify-center">
                                  <Loader2 className="w-3 h-3 text-[#003D82] animate-spin" />
                                </div>
                              )}
                              {connectionStatus === "success" && (
                                <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center animate-in zoom-in-50 duration-300">
                                  <CheckCircle className="w-3 h-3 text-emerald-600" />
                                </div>
                              )}
                              {connectionStatus === "error" && (
                                <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center animate-in zoom-in-50 duration-300">
                                  <XCircle className="w-3 h-3 text-red-600" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1">
                              {connectionStatus === "testing" && (
                                <div className="space-y-1">
                                  <p className="text-xs font-medium text-[#003D82]">Verbinding testen...</p>
                                  <p className="text-xs text-[#003D82]/70">
                                    Even geduld, we controleren je API gegevens
                                  </p>
                                </div>
                              )}
                              {connectionStatus === "success" && (
                                <div className="space-y-1">
                                  <p className="text-xs font-medium text-emerald-800">Verbinding succesvol!</p>
                                  <p className="text-xs text-emerald-600">
                                    bol.com Partner API reageert perfect en is klaar voor gebruik
                                  </p>
                                </div>
                              )}
                              {connectionStatus === "error" && (
                                <div className="space-y-1">
                                  <p className="text-xs font-medium text-red-800">Verbinding mislukt</p>
                                  {connectionError && <p className="text-xs text-red-600">{connectionError}</p>}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {/* Action Buttons */}
                  <div className="flex items-center justify-center gap-4 pt-8 border-t border-slate-100">
                    <Button
                      onClick={testConnection}
                      disabled={!apiKey.trim() || !apiSecret.trim() || isTestingConnection}
                      variant="outline"
                      className="group h-12 px-8 bg-white/80 backdrop-blur-sm border-2 border-slate-200 hover:border-[#003D82]/30 hover:bg-[#003D82]/5 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                    >
                      {isTestingConnection ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Testen...
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4 mr-2 group-hover:text-[#003D82] transition-colors" />
                          Test Verbinding
                        </>
                      )}
                    </Button>

                    {connectionStatus === "success" && (
                      <Button
                        onClick={handleSaveIntegration}
                        disabled={isSaving}
                        className="group h-12 px-8 bg-gradient-to-r from-[#003D82] via-blue-600 to-[#003D82] hover:from-[#003D82]/90 hover:via-blue-700 hover:to-[#003D82]/90 text-white shadow-xl shadow-[#003D82]/25 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-[#003D82]/40 border-0"
                      >
                        {isSaving ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Opslaan...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                            Integratie Opslaan
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
            <div className="relative overflow-hidden bg-gradient-to-br from-slate-50/80 via-white/50 to-[#003D82]/5 backdrop-blur-xl rounded-3xl border border-white/20 shadow-xl">
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-[#003D82]/5 to-blue-50/30"></div>

              <div className="relative p-8 lg:p-12">
                <div className="max-w-5xl mx-auto">
                  <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#003D82] to-blue-600 mb-6 shadow-lg shadow-[#003D82]/25">
                      <AlertCircle className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-3xl font-bold text-slate-900 mb-4">Hoe krijg ik mijn bol.com API gegevens?</h3>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                      Volg deze eenvoudige stappen om je Partner API sleutels te verkrijgen
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                    {[
                      {
                        step: 1,
                        title: "Log in op bol.com Partner Portal",
                        description: "Ga naar partner.bol.com en log in met je partner account.",
                        icon: Globe,
                      },
                      {
                        step: 2,
                        title: "Ga naar Instellingen",
                        description: "Navigeer naar Instellingen → Diensten → API Instellingen",
                        icon: Key,
                      },
                      {
                        step: 3,
                        title: "Maak Client Credentials aan",
                        description:
                          "Bij 'Client Credentials Retailer API' klik op 'Aanmaken' en kopieer zowel de Client ID als Client Secret.",
                        icon: Shield,
                      },
                      {
                        step: 4,
                        title: "Kopieer naar formulier",
                        description:
                          "Plak de Client ID en Client Secret in de bovenstaande formuliervelden om de integratie te activeren.",
                        icon: CheckCircle,
                      },
                    ].map((item, index) => (
                      <div
                        key={item.step}
                        className="group relative bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/30 hover:bg-white/80 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <div className="flex items-start gap-4">
                          <div
                            className={`w-12 h-12 rounded-xl ${getStepClasses(item.step)} text-white font-bold flex items-center justify-center text-lg shadow-lg shadow-[#003D82]/25 group-hover:scale-110 transition-transform duration-300`}
                          >
                            {item.step}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-slate-800 mb-2 group-hover:text-slate-900 transition-colors">
                              {item.title}
                            </h4>
                            <p className="text-sm text-slate-600 leading-relaxed">{item.description}</p>
                          </div>
                          <item.icon
                            className={`w-6 h-6 ${getIconClasses(item.step)} group-hover:scale-110 transition-transform duration-300`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-12 bg-gradient-to-r from-[#003D82]/5 via-blue-50 to-[#003D82]/5 border border-[#003D82]/20 rounded-2xl p-8 shadow-inner">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#003D82] to-blue-600 flex items-center justify-center shrink-0 shadow-lg">
                        <AlertCircle className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 mb-3 text-lg">💡 Belangrijke tips</h4>
                        <ul className="space-y-2 text-sm text-slate-700">
                          <li className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-[#003D82] rounded-full"></div>
                            Bewaar je API gegevens veilig - deze geven toegang tot je bol.com data
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                            Test altijd de verbinding voordat je de integratie opslaat
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
                            Bij problemen, controleer of je Partner account actief is
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 text-center">
                    <Button
                      variant="outline"
                      size="sm"
                      className="group bg-white/60 backdrop-blur-sm border-[#003D82]/20 hover:bg-white/80 hover:border-[#003D82]/30 transition-all duration-300 hover:scale-105"
                      onClick={() => window.open("https://partner.bol.com", "_blank")}
                    >
                      <ExternalLink className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform duration-300" />
                      <span className="font-medium">bol.com Partner Portal</span>
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
