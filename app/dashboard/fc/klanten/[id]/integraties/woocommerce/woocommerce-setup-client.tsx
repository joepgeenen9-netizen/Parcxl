"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, CheckCircle, XCircle, Loader2, ExternalLink, ShoppingCart, Zap, Shield, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { testWooCommerceConnection, addWooCommerceIntegration } from "./actions"
import FCLayout from "../../../../_components/fc-layout"

interface TenantUser {
  id: string
  tenant_id: string
  username: string
  email: string
  is_admin: boolean
}

interface WooCommerceSetupClientProps {
  tenant: any
  user: TenantUser
  clientId: string
  clientName: string
}

export function WooCommerceSetupClient({ tenant, user, clientId, clientName }: WooCommerceSetupClientProps) {
  const router = useRouter()
  const { toast } = useToast()

  const [domain, setDomain] = useState("")
  const [consumerKey, setConsumerKey] = useState("")
  const [consumerSecret, setConsumerSecret] = useState("")
  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<"idle" | "testing" | "success" | "error">("idle")
  const [connectionError, setConnectionError] = useState("")
  const [isAddingIntegration, setIsAddingIntegration] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  // Auto-test connection when all fields are filled
  useEffect(() => {
    const testConnection = async () => {
      if (domain.trim() && consumerKey.trim() && consumerSecret.trim()) {
        setIsTestingConnection(true)
        setConnectionStatus("testing")
        setConnectionError("")

        const result = await testWooCommerceConnection({
          domain: domain.trim(),
          consumerKey: consumerKey.trim(),
          consumerSecret: consumerSecret.trim(),
        })

        if (result.success) {
          setConnectionStatus("success")
        } else {
          setConnectionStatus("error")
          setConnectionError(result.error || "Onbekende fout")
        }

        setIsTestingConnection(false)
      } else {
        setConnectionStatus("idle")
        setConnectionError("")
      }
    }

    // Debounce the test connection call
    const timeoutId = setTimeout(testConnection, 1000)
    return () => clearTimeout(timeoutId)
  }, [domain, consumerKey, consumerSecret])

  const handleAddIntegration = async () => {
    if (connectionStatus !== "success") return

    setIsAddingIntegration(true)

    const result = await addWooCommerceIntegration({
      clientId,
      tenantId: tenant.id,
      domain: domain.trim(),
      consumerKey: consumerKey.trim(),
      consumerSecret: consumerSecret.trim(),
    })

    if (result.success) {
      toast({
        title: "Integratie toegevoegd",
        description: "WooCommerce integratie is succesvol toegevoegd.",
      })
      router.push(`/dashboard/fc/klanten/${clientId}`)
    } else {
      toast({
        title: "Fout bij toevoegen",
        description: result.error || "Er is een fout opgetreden bij het toevoegen van de integratie.",
        variant: "destructive",
      })
    }

    setIsAddingIntegration(false)
  }

  const getConnectionStatusIcon = () => {
    switch (connectionStatus) {
      case "testing":
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case "error":
        return <XCircle className="w-5 h-5 text-red-500" />
      default:
        return null
    }
  }

  const getConnectionStatusText = () => {
    switch (connectionStatus) {
      case "testing":
        return "Verbinding testen..."
      case "success":
        return "Verbinding succesvol!"
      case "error":
        return connectionError
      default:
        return ""
    }
  }

  return (
    <FCLayout user={user} tenant={tenant} searchPlaceholder="Zoek in integraties...">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full mix-blend-multiply filter blur-xl animate-blob" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-600/20 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000" />
        <div className="absolute top-40 left-40 w-80 h-80 bg-gradient-to-br from-indigo-400/20 to-blue-600/20 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000" />
      </div>

      <div
        className={`relative z-10 space-y-8 pb-8 md:pb-12 transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between transition-all duration-700 delay-100 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
        >
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/dashboard/fc/klanten/${clientId}`)}
            className="group flex items-center gap-2 bg-white/80 backdrop-blur-sm border-white/20 hover:bg-white/90 hover:border-blue-200/50 transition-all duration-300 hover:shadow-lg hover:scale-105"
          >
            <ArrowLeft className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1" />
            <span className="font-medium">Terug naar {clientName}</span>
          </Button>
        </div>

        {/* Hero Section */}
        <div
          className={`text-center space-y-6 transition-all duration-700 delay-200 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
        >
          {/* Large WooCommerce Logo */}
          <div className="flex justify-center mb-8">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500" />
              <img
                src="/images/woocommerce-logo.png"
                alt="WooCommerce logo"
                className="relative w-24 h-24 object-contain transition-all duration-500 group-hover:scale-110"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
              WooCommerce Integratie
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Verbind je WooCommerce winkel naadloos met Packway voor geautomatiseerde orderverwerking
            </p>
          </div>

          {/* Feature Pills */}
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            {[
              { icon: ShoppingCart, text: "Automatische Orders", delay: "delay-300" },
              { icon: Zap, text: "Real-time Sync", delay: "delay-500" },
              { icon: Shield, text: "Veilige Verbinding", delay: "delay-700" },
              { icon: Globe, text: "Multi-store Support", delay: "delay-900" },
            ].map((feature, index) => (
              <div
                key={index}
                className={`group flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full border border-white/30 hover:bg-white/80 hover:border-blue-200/50 transition-all duration-300 hover:scale-105 hover:shadow-lg ${feature.delay} ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
              >
                <feature.icon className="w-4 h-4 text-blue-600 group-hover:text-purple-600 transition-colors duration-300" />
                <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors duration-300">
                  {feature.text}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Main Setup Card */}
        <div
          className={`relative transition-all duration-700 delay-400 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-white/50 to-purple-50/50 rounded-3xl blur-3xl" />
          <div className="relative bg-white/70 backdrop-blur-xl rounded-3xl p-8 md:p-12 border border-white/30 shadow-2xl shadow-blue-500/10">
            {/* Floating Elements */}
            <div className="absolute top-6 right-6 w-3 h-3 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full animate-pulse" />
            <div
              className="absolute bottom-6 left-6 w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full animate-pulse"
              style={{ animationDelay: "1s" }}
            />

            <div className="space-y-8">
              {/* Connection Status Banner */}
              {connectionStatus !== "idle" && (
                <div
                  className={`transform transition-all duration-500 ${connectionStatus !== "idle" ? "scale-100 opacity-100" : "scale-95 opacity-0"}`}
                >
                  <div
                    className={`p-6 rounded-2xl border backdrop-blur-sm transition-all duration-300 ${
                      connectionStatus === "success"
                        ? "bg-gradient-to-r from-green-50/80 to-emerald-50/80 border-green-200/50 shadow-green-500/10"
                        : connectionStatus === "error"
                          ? "bg-gradient-to-r from-red-50/80 to-rose-50/80 border-red-200/50 shadow-red-500/10"
                          : "bg-gradient-to-r from-blue-50/80 to-indigo-50/80 border-blue-200/50 shadow-blue-500/10"
                    } shadow-xl`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`p-3 rounded-xl ${
                          connectionStatus === "success"
                            ? "bg-green-100/80"
                            : connectionStatus === "error"
                              ? "bg-red-100/80"
                              : "bg-blue-100/80"
                        }`}
                      >
                        {getConnectionStatusIcon()}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 text-lg">Verbindingsstatus</div>
                        <div
                          className={`text-sm font-medium ${
                            connectionStatus === "success"
                              ? "text-green-700"
                              : connectionStatus === "error"
                                ? "text-red-700"
                                : "text-blue-700"
                          }`}
                        >
                          {getConnectionStatusText()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Form Fields */}
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Domain Field */}
                  <div className="group space-y-3">
                    <Label htmlFor="domain" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <Globe className="w-4 h-4 text-blue-500" />
                      Winkel Domein *
                    </Label>
                    <div className="relative">
                      <Input
                        id="domain"
                        type="text"
                        placeholder="bijv. mijnwinkel.nl"
                        value={domain}
                        onChange={(e) => setDomain(e.target.value)}
                        className="h-14 pl-4 pr-12 bg-white/80 backdrop-blur-sm border-gray-200/50 focus:border-blue-400/50 focus:ring-blue-400/20 rounded-xl transition-all duration-300 hover:bg-white/90 hover:border-gray-300/50 text-base"
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full animate-pulse" />
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 ml-1">Het domein van je WooCommerce winkel (zonder https://)</p>
                  </div>

                  {/* Consumer Key Field */}
                  <div className="group space-y-3">
                    <Label
                      htmlFor="consumerKey"
                      className="text-sm font-semibold text-gray-700 flex items-center gap-2"
                    >
                      <Shield className="w-4 h-4 text-purple-500" />
                      Consumer Key *
                    </Label>
                    <div className="relative">
                      <Input
                        id="consumerKey"
                        type="text"
                        placeholder="ck_..."
                        value={consumerKey}
                        onChange={(e) => setConsumerKey(e.target.value)}
                        className="h-14 pl-4 pr-12 bg-white/80 backdrop-blur-sm border-gray-200/50 focus:border-purple-400/50 focus:ring-purple-400/20 rounded-xl transition-all duration-300 hover:bg-white/90 hover:border-gray-300/50 text-base"
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        <div
                          className="w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full animate-pulse"
                          style={{ animationDelay: "0.5s" }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Consumer Secret Field */}
                <div className="group space-y-3">
                  <Label
                    htmlFor="consumerSecret"
                    className="text-sm font-semibold text-gray-700 flex items-center gap-2"
                  >
                    <Shield className="w-4 h-4 text-indigo-500" />
                    Consumer Secret *
                  </Label>
                  <div className="relative">
                    <Input
                      id="consumerSecret"
                      type="password"
                      placeholder="cs_..."
                      value={consumerSecret}
                      onChange={(e) => setConsumerSecret(e.target.value)}
                      className="h-14 pl-4 pr-12 bg-white/80 backdrop-blur-sm border-gray-200/50 focus:border-indigo-400/50 focus:ring-indigo-400/20 rounded-xl transition-all duration-300 hover:bg-white/90 hover:border-gray-300/50 text-base"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <div
                        className="w-2 h-2 bg-gradient-to-r from-indigo-400 to-blue-500 rounded-full animate-pulse"
                        style={{ animationDelay: "1s" }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Help Section */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 to-indigo-50/30 rounded-2xl blur-xl" />
                <div className="relative bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-blue-200/30 shadow-xl shadow-blue-500/5">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                      <ExternalLink className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Hoe krijg ik mijn API-sleutels?</h3>
                      <p className="text-gray-600">Volg deze stappen om je WooCommerce API-sleutels te verkrijgen:</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                      {
                        step: "1",
                        title: "Navigeer naar API",
                        desc: "Ga naar WooCommerce → Instellingen → Geavanceerd → REST API",
                      },
                      {
                        step: "2",
                        title: "Nieuwe sleutel",
                        desc: "Klik op 'Sleutel toevoegen' om een nieuwe API-sleutel aan te maken",
                      },
                      {
                        step: "3",
                        title: "Configureer rechten",
                        desc: "Geef een beschrijving (bijv. 'Packway') en selecteer 'Lezen/Schrijven'",
                      },
                      {
                        step: "4",
                        title: "Kopieer sleutels",
                        desc: "Kopieer de Consumer Key en Consumer Secret naar dit formulier",
                      },
                    ].map((item, index) => (
                      <div
                        key={index}
                        className="group flex items-start gap-4 p-4 bg-white/40 backdrop-blur-sm rounded-xl border border-white/30 hover:bg-white/60 hover:border-blue-200/50 transition-all duration-300 hover:scale-105"
                      >
                        <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-sm group-hover:scale-110 transition-transform duration-300">
                          {item.step}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 mb-1">{item.title}</div>
                          <div className="text-sm text-gray-600">{item.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 pt-6 border-t border-gray-200/50">
                    <Button
                      variant="outline"
                      size="sm"
                      className="group bg-white/60 backdrop-blur-sm border-blue-200/50 hover:bg-white/80 hover:border-blue-300/50 transition-all duration-300 hover:scale-105"
                      onClick={() => window.open("https://woocommerce.com/document/woocommerce-rest-api/", "_blank")}
                    >
                      <ExternalLink className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform duration-300" />
                      <span className="font-medium">WooCommerce API Documentatie</span>
                    </Button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-4 pt-6">
                <Button
                  variant="outline"
                  onClick={() => router.push(`/dashboard/fc/klanten/${clientId}`)}
                  className="px-8 py-3 bg-white/60 backdrop-blur-sm border-gray-200/50 hover:bg-white/80 hover:border-gray-300/50 transition-all duration-300 hover:scale-105 font-medium"
                >
                  Annuleren
                </Button>

                {connectionStatus === "success" && (
                  <Button
                    onClick={handleAddIntegration}
                    disabled={isAddingIntegration}
                    className="group px-8 py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-xl shadow-blue-500/25 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {isAddingIntegration ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        <span>Integratie toevoegen...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform duration-300" />
                        <span>Integratie toevoegen</span>
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </FCLayout>
  )
}
