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
  Copy,
  ExternalLink,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { testCCVConnection, saveCCVIntegration } from "./actions"
import FCLayout from "../../../_components/fc-layout"

interface TenantUser {
  id: string
  tenant_id: string
  username: string
  email: string
  is_admin: boolean
}

interface CCVSetupClientProps {
  tenant: any
  user: TenantUser
  clientId: string
  clientName: string
}

interface SaveError {
  error: string
  details?: string
  errorCode?: string
}

export function CCVSetupClient({ tenant, user, clientId, clientName }: CCVSetupClientProps) {
  const router = useRouter()
  const { toast } = useToast()

  const [domain, setDomain] = useState("")
  const [apiKey, setApiKey] = useState("")
  const [apiSecret, setApiSecret] = useState("")
  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<"idle" | "testing" | "success" | "error">("idle")
  const [connectionError, setConnectionError] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<SaveError | null>(null)
  const [showForm, setShowForm] = useState(false)

  // Show form with animation after component mounts
  useEffect(() => {
    const timer = setTimeout(() => setShowForm(true), 100)
    return () => clearTimeout(timer)
  }, [])

  // Auto-test connection when all fields are filled
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (domain.trim() && apiKey.trim() && apiSecret.trim() && connectionStatus !== "testing") {
        testConnection()
      }
    }, 1000)

    return () => clearTimeout(timeoutId)
  }, [domain, apiKey, apiSecret])

  const testConnection = async () => {
    if (!domain.trim() || !apiKey.trim() || !apiSecret.trim()) {
      return
    }

    setIsTestingConnection(true)
    setConnectionStatus("testing")
    setConnectionError("")
    setSaveError(null)

    try {
      const result = await testCCVConnection(domain.trim(), apiKey.trim(), apiSecret.trim())

      if (result.success) {
        setConnectionStatus("success")
        toast({
          title: "🎉 Verbinding succesvol!",
          description: "CCV Shop API verbinding is getest en werkt perfect.",
        })
      } else {
        setConnectionStatus("error")
        setConnectionError(result.error || "Onbekende fout")
        toast({
          title: "❌ Verbinding mislukt",
          description: result.error || "Kon geen verbinding maken met CCV Shop API",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      setConnectionStatus("error")
      setConnectionError(error.message || "Onbekende fout")
      toast({
        title: "❌ Verbinding mislukt",
        description: error.message || "Kon geen verbinding maken met CCV Shop API",
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
    setSaveError(null)

    try {
      console.log("🚀 Starting integration save process from client...")
      const result = await saveCCVIntegration(tenant.id, clientId, domain.trim(), apiKey.trim(), apiSecret.trim())

      if (result.success) {
        toast({
          title: "🚀 Integratie toegevoegd!",
          description: "CCV Shop integratie is succesvol geconfigureerd.",
        })

        // Navigate back to client page
        setTimeout(() => {
          router.push(`/dashboard/fc/klanten/${clientId}`)
        }, 1000)
      } else {
        // Handle the detailed error response
        setSaveError({
          error: result.error || "Onbekende fout",
          details: result.details,
          errorCode: result.errorCode,
        })

        toast({
          title: "❌ Fout bij opslaan",
          description: result.error || "Onbekende fout bij het opslaan van de integratie",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      console.error("Save integration error:", error)

      let errorDetails: SaveError = {
        error: "Onbekende fout bij het opslaan van de integratie",
        details: error.message || "Er is een onverwachte fout opgetreden",
        errorCode: "UNKNOWN_ERROR",
      }

      // Try to parse JSON error message if it exists
      try {
        if (error.message && error.message.startsWith("{")) {
          const parsedError = JSON.parse(error.message)
          errorDetails = {
            error: parsedError.error || errorDetails.error,
            details: parsedError.details || errorDetails.details,
            errorCode: parsedError.errorCode || errorDetails.errorCode,
          }
        }
      } catch (parseError) {
        console.log("Could not parse error message as JSON")
      }

      setSaveError(errorDetails)

      toast({
        title: "❌ Fout bij opslaan",
        description: errorDetails.error,
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const normalizeDomain = (value: string) => {
    let cleanValue = value.replace(/\/+$/, "")
    if (cleanValue && !cleanValue.startsWith("http://") && !cleanValue.startsWith("https://")) {
      cleanValue = "https://" + cleanValue
    }
    return cleanValue
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "📋 Gekopieerd!",
      description: "Tekst is gekopieerd naar het klembord",
    })
  }

  const getErrorSolution = (errorCode?: string) => {
    switch (errorCode) {
      case "INVALID_TENANT_ID":
      case "INVALID_CLIENT_ID":
        return "Ververs de pagina en probeer opnieuw. Als het probleem aanhoudt, neem contact op met support."
      case "MISSING_DOMAIN":
      case "INVALID_DOMAIN_FORMAT":
        return "Controleer of je het volledige domein hebt ingevoerd, inclusief https://"
      case "MISSING_API_KEY":
      case "INVALID_API_KEY_LENGTH":
        return "Ga naar je CCV Shop admin en kopieer de juiste API Key"
      case "MISSING_API_SECRET":
      case "INVALID_API_SECRET_LENGTH":
        return "Ga naar je CCV Shop admin en kopieer de juiste API Secret"
      case "DATABASE_CONNECTION_FAILED":
        return "Dit is een technisch probleem. Probeer het over een paar minuten opnieuw."
      case "TENANT_NOT_FOUND":
      case "CLIENT_NOT_FOUND":
        return "Ververs de pagina. Als het probleem aanhoudt, neem contact op met support."
      case "DUPLICATE_INTEGRATION":
        return "Er bestaat al een CCV integratie. Ga terug naar de client pagina om deze te bekijken."
      case "INSUFFICIENT_PERMISSIONS":
        return "Neem contact op met de beheerder om de juiste rechten te krijgen."
      default:
        return "Probeer het opnieuw. Als het probleem aanhoudt, neem contact op met support."
    }
  }

  const getStepClasses = (step: number) => {
    switch (step) {
      case 1:
        return "w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white font-bold flex items-center justify-center text-lg shadow-lg shadow-blue-500/25 group-hover:scale-110 transition-transform duration-300"
      case 2:
        return "w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 text-white font-bold flex items-center justify-center text-lg shadow-lg shadow-green-500/25 group-hover:scale-110 transition-transform duration-300"
      case 3:
        return "w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 text-white font-bold flex items-center justify-center text-lg shadow-lg shadow-purple-500/25 group-hover:scale-110 transition-transform duration-300"
      case 4:
        return "w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white font-bold flex items-center justify-center text-lg shadow-lg shadow-emerald-500/25 group-hover:scale-110 transition-transform duration-300"
      default:
        return "w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white font-bold flex items-center justify-center text-lg shadow-lg shadow-blue-500/25 group-hover:scale-110 transition-transform duration-300"
    }
  }

  const getIconClasses = (step: number) => {
    switch (step) {
      case 1:
        return "w-6 h-6 text-blue-500 group-hover:scale-110 transition-transform duration-300"
      case 2:
        return "w-6 h-6 text-green-500 group-hover:scale-110 transition-transform duration-300"
      case 3:
        return "w-6 h-6 text-purple-500 group-hover:scale-110 transition-transform duration-300"
      case 4:
        return "w-6 h-6 text-emerald-500 group-hover:scale-110 transition-transform duration-300"
      default:
        return "w-6 h-6 text-blue-500 group-hover:scale-110 transition-transform duration-300"
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
              onClick={() => router.push(`/dashboard/fc/klanten/${clientId}`)}
              className="group flex items-center gap-2 bg-white/80 backdrop-blur-sm border-white/20 hover:bg-white hover:border-blue-200/50 hover:shadow-lg transition-all duration-300 hover:scale-105"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
              Terug naar {clientName}
            </Button>
          </div>

          {/* Hero Section */}
          <div
            className={`transition-all duration-1000 ${showForm ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          >
            <div className="relative overflow-hidden bg-gradient-to-br from-white via-blue-50/50 to-indigo-100/30 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl shadow-blue-500/10">
              {/* Animated Background Elements */}
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-indigo-600/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
              </div>

              <div className="relative p-12">
                <div className="flex items-center justify-center mb-8">
                  {/* Large CCV Logo */}
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
                    <img
                      src="https://zffyxtcwojwyqppjlrdi.supabase.co/storage/v1/object/sign/integratie-logo/CCV-icon.svg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9hZDkxMTA5Zi1kMDMyLTRhOWQtOTJmMC1iZjc2ZjI2NzBhZGMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbnRlZ3JhdGllLWxvZ28vQ0NWLWljb24uc3ZnIiwiaWF0IjoxNzUyMDA0NTA5LCJleHAiOjE5MDk2ODQ1MDl9.sA6qaARJDgXy5OeYFaEmKyAft3vgF0WPdjDqzllWQPA"
                      alt="CCV Shop logo"
                      className="relative w-20 h-20 object-contain group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                </div>

                <div className="text-center space-y-4">
                  <h1 className="text-5xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-900 bg-clip-text text-transparent animate-in slide-in-from-bottom-4 duration-700 delay-200">
                    CCV Shop Integratie
                  </h1>
                  <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed animate-in slide-in-from-bottom-4 duration-700 delay-300">
                    Verbind je CCV Shop met{" "}
                    <span className="font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      {clientName}
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
                      <Globe className="w-4 h-4 text-blue-500" />
                      <span className="text-sm font-medium text-slate-700">Automatische updates</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Connection Status */}
          {domain.trim() && apiKey.trim() && apiSecret.trim() && (
            <div
              className={`transition-all duration-500 ${showForm ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
            >
              <div
                className={`relative overflow-hidden rounded-2xl border backdrop-blur-xl transition-all duration-500 ${
                  connectionStatus === "success"
                    ? "bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200/50 shadow-lg shadow-emerald-500/10"
                    : connectionStatus === "error"
                      ? "bg-gradient-to-r from-red-50 to-rose-50 border-red-200/50 shadow-lg shadow-red-500/10"
                      : "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200/50 shadow-lg shadow-blue-500/10"
                }`}
              >
                <div className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      {connectionStatus === "testing" && (
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                          <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
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
                          <p className="font-semibold text-blue-800">🔄 Verbinding testen...</p>
                          <p className="text-sm text-blue-600">Even geduld, we controleren je API gegevens</p>
                        </div>
                      )}
                      {connectionStatus === "success" && (
                        <div className="space-y-1">
                          <p className="font-bold text-emerald-800">🎉 Verbinding succesvol!</p>
                          <p className="text-sm text-emerald-600">
                            CCV Shop API reageert perfect en is klaar voor gebruik
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

          {/* Detailed Save Error Display */}
          {saveError && (
            <div className="transition-all duration-500 opacity-100 translate-y-0">
              <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-r from-red-50 to-rose-50 border-red-200/50 shadow-lg shadow-red-500/10 backdrop-blur-xl">
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                      <AlertCircle className="w-6 h-6 text-red-600" />
                    </div>
                    <div className="flex-1 space-y-4">
                      <div>
                        <p className="font-bold text-red-800 mb-2">❌ {saveError.error}</p>
                        {saveError.details && (
                          <p className="text-sm text-red-700 leading-relaxed mb-3">{saveError.details}</p>
                        )}
                        {saveError.errorCode && (
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-xs font-mono bg-red-100 text-red-800 px-2 py-1 rounded">
                              {saveError.errorCode}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(saveError.errorCode!)}
                              className="h-6 px-2 text-xs text-red-600 hover:text-red-800"
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                        )}
                      </div>

                      <div className="p-4 bg-red-100/50 rounded-lg border border-red-200/50">
                        <p className="text-xs text-red-600 font-medium mb-2">💡 Aanbevolen oplossing:</p>
                        <p className="text-xs text-red-600 leading-relaxed">{getErrorSolution(saveError.errorCode)}</p>
                      </div>

                      {/* Technical Details (collapsible) */}
                      <details className="group">
                        <summary className="text-xs text-red-600 cursor-pointer hover:text-red-800 flex items-center gap-1">
                          <span>Technische details</span>
                          <ExternalLink className="w-3 h-3 group-open:rotate-90 transition-transform" />
                        </summary>
                        <div className="mt-2 p-3 bg-red-50 rounded border border-red-200/30">
                          <div className="space-y-2 text-xs text-red-700 font-mono">
                            <div>
                              <strong>Tenant ID:</strong> {tenant.id?.substring(0, 8)}...
                            </div>
                            <div>
                              <strong>Client ID:</strong> {clientId?.substring(0, 8)}...
                            </div>
                            <div>
                              <strong>Domain:</strong> {domain?.substring(0, 30)}...
                            </div>
                            <div>
                              <strong>Timestamp:</strong> {new Date().toISOString()}
                            </div>
                          </div>
                        </div>
                      </details>
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
              <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-blue-50/30"></div>

              <div className="relative p-8 lg:p-12">
                <div className="max-w-2xl mx-auto space-y-8">
                  <div className="text-center space-y-2">
                    <h2 className="text-2xl font-bold text-slate-900">API Configuratie</h2>
                    <p className="text-slate-600">Voer je CCV Shop API gegevens in om de integratie te activeren</p>
                  </div>

                  <div className="space-y-6">
                    {/* Domain Field */}
                    <div className="group space-y-3">
                      <Label htmlFor="domain" className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                        <Globe className="w-4 h-4 text-blue-500" />
                        Shop Domein
                        <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <Input
                          id="domain"
                          type="url"
                          placeholder="https://jouwshop.ccvshop.nl"
                          value={domain}
                          onChange={(e) => setDomain(normalizeDomain(e.target.value))}
                          className="h-14 text-base pl-4 pr-12 border-2 border-slate-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all duration-300 rounded-xl bg-white/50 backdrop-blur-sm group-hover:border-slate-300"
                          required
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                          <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                            <Globe className="w-3 h-3 text-blue-600" />
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Het volledige domein van je CCV Shop (inclusief https://)
                      </p>
                    </div>

                    {/* API Key Field */}
                    <div className="group space-y-3">
                      <Label htmlFor="apiKey" className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                        <Key className="w-4 h-4 text-green-500" />
                        API Key (Public Key)
                        <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <Input
                          id="apiKey"
                          type="text"
                          placeholder="bk808b8gqd1qn889"
                          value={apiKey}
                          onChange={(e) => setApiKey(e.target.value.trim())}
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
                        Je CCV Shop API Key (ook wel Public Key genoemd)
                      </p>
                    </div>

                    {/* API Secret Field */}
                    <div className="group space-y-3">
                      <Label
                        htmlFor="apiSecret"
                        className="flex items-center gap-2 text-sm font-semibold text-slate-700"
                      >
                        <Shield className="w-4 h-4 text-purple-500" />
                        API Secret (Private Key)
                        <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <Input
                          id="apiSecret"
                          type="password"
                          placeholder="6ctmej4npem4ktbm5it9qxnaqd9rocdx"
                          value={apiSecret}
                          onChange={(e) => setApiSecret(e.target.value.trim())}
                          className="h-14 text-base font-mono pl-4 pr-12 border-2 border-slate-200 focus:border-purple-400 focus:ring-4 focus:ring-purple-100 transition-all duration-300 rounded-xl bg-white/50 backdrop-blur-sm group-hover:border-slate-300"
                          required
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                          <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center">
                            <Shield className="w-3 h-3 text-purple-600" />
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Je CCV Shop API Secret (ook wel Private Key genoemd)
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-center gap-4 pt-8 border-t border-slate-100">
                    <Button
                      onClick={testConnection}
                      disabled={!domain.trim() || !apiKey.trim() || !apiSecret.trim() || isTestingConnection}
                      variant="outline"
                      className="group h-12 px-8 bg-white/80 backdrop-blur-sm border-2 border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                    >
                      {isTestingConnection ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Testen...
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4 mr-2 group-hover:text-blue-600 transition-colors" />
                          Test Verbinding
                        </>
                      )}
                    </Button>

                    {connectionStatus === "success" && (
                      <Button
                        onClick={handleSaveIntegration}
                        disabled={isSaving}
                        className="group h-12 px-8 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white shadow-xl shadow-blue-500/25 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/40 border-0"
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
            <div className="relative overflow-hidden bg-gradient-to-br from-slate-50/80 via-white/50 to-blue-50/80 backdrop-blur-xl rounded-3xl border border-white/20 shadow-xl">
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-blue-50/20 to-indigo-50/30"></div>

              <div className="relative p-8 lg:p-12">
                <div className="max-w-5xl mx-auto">
                  <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 mb-6 shadow-lg shadow-blue-500/25">
                      <AlertCircle className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-3xl font-bold text-slate-900 mb-4">Hoe krijg ik mijn CCV Shop API gegevens?</h3>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                      Volg deze eenvoudige stappen om je API sleutels te verkrijgen
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                    {[
                      {
                        step: 1,
                        title: "Navigeer naar de CCV App Store",
                        description: "Ga naar de CCV App Store en download de 'API CCV Shop' applicatie.",
                        icon: Globe,
                      },
                      {
                        step: 2,
                        title: "Ga naar API instellingen",
                        description: "Ga naar Instellingen → General → API Details in de gedownloade app.",
                        icon: Key,
                      },
                      {
                        step: 3,
                        title: "Maak een nieuwe API sleutel aan",
                        description: "Klik op 'Create new API key' en kopieer zowel de gegenereerde key als secret.",
                        icon: Shield,
                      },
                      {
                        step: 4,
                        title: "Plak de gegevens in het formulier",
                        description:
                          "Kopieer de gegenereerde key en secret en plak deze in de daarvoor bestemde formuliervelden.",
                        icon: CheckCircle,
                      },
                    ].map((item, index) => (
                      <div
                        key={item.step}
                        className="group relative bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/30 hover:bg-white/80 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <div className="flex items-start gap-4">
                          <div className={getStepClasses(item.step)}>{item.step}</div>
                          <div className="flex-1">
                            <h4 className="font-bold text-slate-800 mb-2 group-hover:text-slate-900 transition-colors">
                              {item.title}
                            </h4>
                            <p className="text-sm text-slate-600 leading-relaxed">{item.description}</p>
                          </div>
                          <item.icon className={getIconClasses(item.step)} />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-12 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border border-blue-200/50 rounded-2xl p-8 shadow-inner">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0 shadow-lg">
                        <AlertCircle className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 mb-3 text-lg">💡 Belangrijke tips</h4>
                        <ul className="space-y-2 text-sm text-slate-700">
                          <li className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                            Bewaar je API gegevens veilig - deze geven toegang tot je shop data
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
                            Test altijd de verbinding voordat je de integratie opslaat
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                            Bij problemen, controleer of je API sleutel de juiste permissies heeft
                          </li>
                        </ul>
                      </div>
                    </div>
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
