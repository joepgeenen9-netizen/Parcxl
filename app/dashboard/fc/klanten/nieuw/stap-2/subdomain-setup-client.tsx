"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, ArrowRight, Globe, CheckCircle, AlertCircle, Loader2, XCircle } from "lucide-react"
import { setupSubdomain, checkSubdomainAvailability } from "./actions"
import { toast } from "@/hooks/use-toast"

interface SubdomainSetupClientProps {
  client: {
    id: string
    company_name: string
    tenant_id: string
    status?: string
  }
  tenant: {
    id: string
    type: string
    name?: string
    domain?: string
    domain_name?: string
  }
}

export function SubdomainSetupClient({ client, tenant }: SubdomainSetupClientProps) {
  const router = useRouter()
  const [subdomain, setSubdomain] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [availabilityStatus, setAvailabilityStatus] = useState<"idle" | "available" | "unavailable" | "error">("idle")

  // Determine the domain to use
  const domainName = tenant.domain_name || tenant.domain || "packway.nl"

  // Auto-generate initial subdomain suggestion based on company name
  useEffect(() => {
    if (client.company_name) {
      const suggestion = client.company_name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "")
        .substring(0, 20)
      setSubdomain(suggestion)
    }
  }, [client.company_name])

  // Check availability when subdomain changes (debounced)
  useEffect(() => {
    const checkAvailability = async () => {
      if (!subdomain || subdomain.length < 2) {
        setAvailabilityStatus("idle")
        return
      }

      // Validate subdomain format
      const subdomainRegex = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/
      if (!subdomainRegex.test(subdomain)) {
        setAvailabilityStatus("error")
        return
      }

      setIsCheckingAvailability(true)
      setError(null)

      try {
        const result = await checkSubdomainAvailability(subdomain, tenant.id)
        if (result.success) {
          setAvailabilityStatus(result.available ? "available" : "unavailable")
        } else {
          setAvailabilityStatus("error")
          console.error("Availability check error:", result.error)
        }
      } catch (error) {
        console.error("Availability check exception:", error)
        setAvailabilityStatus("error")
      } finally {
        setIsCheckingAvailability(false)
      }
    }

    const timeoutId = setTimeout(checkAvailability, 500)
    return () => clearTimeout(timeoutId)
  }, [subdomain, tenant.id])

  const handleSubdomainChange = (value: string) => {
    // Only allow lowercase letters, numbers, and hyphens
    const sanitized = value.toLowerCase().replace(/[^a-z0-9-]/g, "")
    setSubdomain(sanitized)
    if (error) setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    // Client-side validation
    if (!subdomain.trim()) {
      setError("Subdomain is verplicht")
      setIsLoading(false)
      return
    }

    if (subdomain.length < 2 || subdomain.length > 63) {
      setError("Subdomain moet tussen 2 en 63 karakters zijn")
      setIsLoading(false)
      return
    }

    const subdomainRegex = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/
    if (!subdomainRegex.test(subdomain)) {
      setError(
        "Subdomain mag alleen kleine letters, cijfers en koppeltekens bevatten en moet beginnen en eindigen met een letter of cijfer",
      )
      setIsLoading(false)
      return
    }

    if (availabilityStatus !== "available") {
      setError("Subdomain is niet beschikbaar")
      setIsLoading(false)
      return
    }

    try {
      console.log("Setting up subdomain:", { subdomain, clientId: client.id, tenantId: client.tenant_id })

      const result = await setupSubdomain(subdomain, client.id, client.tenant_id)

      console.log("Setup result:", result)

      if (result.success) {
        // Show success toast
        toast({
          title: "Klant succesvol aangemaakt!",
          description: `${client.company_name} is toegevoegd met subdomain: ${result.domain}`,
          duration: 5000,
        })

        // Redirect directly to clients overview
        router.push("/dashboard/fc/klanten")
      } else {
        setError(result.error || "Er is een fout opgetreden bij het instellen van het subdomain")
      }
    } catch (error) {
      console.error("Error setting up subdomain:", error)
      setError("Er is een onverwachte fout opgetreden")
    } finally {
      setIsLoading(false)
    }
  }

  const handlePrevious = () => {
    router.push(`/dashboard/fc/klanten/nieuw?fromStep=2&clientId=${client.id}&preserveData=true`)
  }

  const handleCancel = () => {
    router.push("/dashboard/fc/klanten")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-4">
            Subdomain Configuratie
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Stel een uniek subdomain in voor <strong>{client.company_name}</strong>. Dit wordt hun toegangspoort tot het
            fulfillment platform.
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="relative mb-12">
          <div className="flex items-center justify-center max-w-md mx-auto">
            {/* Step 1 - Completed */}
            <div className="flex items-center group">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-2xl flex items-center justify-center text-lg font-bold shadow-lg">
                  ✓
                </div>
              </div>
              <div className="ml-4">
                <span className="text-lg font-semibold text-green-600">Klantgegevens</span>
                <p className="text-sm text-gray-500">Voltooid</p>
              </div>
            </div>

            {/* Connection Line */}
            <div className="flex-1 mx-8">
              <div className="h-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-full"></div>
            </div>

            {/* Step 2 - Active */}
            <div className="flex items-center group">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl flex items-center justify-center text-lg font-bold shadow-lg">
                  2
                </div>
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-blue-600 rounded-2xl opacity-30 blur-sm animate-pulse"></div>
              </div>
              <div className="ml-4">
                <span className="text-lg font-semibold text-blue-600">Configuratie</span>
                <p className="text-sm text-gray-500">Actief</p>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <Alert
            variant="destructive"
            className="mb-8 border-2 border-red-200 bg-red-50/50 backdrop-blur-sm rounded-2xl"
          >
            <AlertCircle className="h-5 w-5" />
            <AlertDescription className="text-red-700 font-medium">{error}</AlertDescription>
          </Alert>
        )}

        {/* Main Form */}
        <Card className="border-2 border-gray-200/50 shadow-xl bg-white/80 backdrop-blur-sm rounded-3xl overflow-hidden">
          <CardHeader className="bg-gradient-to-br from-blue-50/50 to-white/50 pb-6">
            <CardTitle className="flex items-center gap-4 text-2xl text-gray-900">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-100 to-blue-50 text-blue-600">
                <Globe className="h-6 w-6" />
              </div>
              <div>
                <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Subdomain Setup
                </span>
                <p className="text-sm font-normal text-gray-500 mt-1">
                  Kies een uniek subdomain voor {client.company_name}
                </p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-4">
                <Label htmlFor="subdomain" className="text-lg font-semibold text-gray-700">
                  Subdomain <span className="text-red-500">*</span>
                </Label>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 relative">
                    <Input
                      id="subdomain"
                      value={subdomain}
                      onChange={(e) => handleSubdomainChange(e.target.value)}
                      placeholder="bedrijfsnaam"
                      className="h-14 text-lg border-2 border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 rounded-2xl bg-white/50 backdrop-blur-sm hover:bg-white/80 hover:shadow-md outline-none focus:outline-none focus:ring-0 focus-visible:ring-0 pr-10"
                      required
                      disabled={isLoading}
                    />
                    {/* Availability indicator */}
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      {isCheckingAvailability && <Loader2 className="h-5 w-5 animate-spin text-gray-400" />}
                      {!isCheckingAvailability && availabilityStatus === "available" && (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      )}
                      {!isCheckingAvailability && availabilityStatus === "unavailable" && (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                      {!isCheckingAvailability && availabilityStatus === "error" && (
                        <AlertCircle className="h-5 w-5 text-yellow-500" />
                      )}
                    </div>
                  </div>
                  <span className="text-lg font-medium text-gray-600">.{domainName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500">
                    Alleen kleine letters, cijfers en koppeltekens zijn toegestaan (2-63 karakters).
                  </p>
                  {availabilityStatus === "available" && (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Beschikbaar
                    </Badge>
                  )}
                  {availabilityStatus === "unavailable" && (
                    <Badge variant="secondary" className="bg-red-100 text-red-800">
                      Niet beschikbaar
                    </Badge>
                  )}
                </div>
                {subdomain && (
                  <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <p className="text-sm text-blue-700">
                      <strong>Preview:</strong> https://{subdomain}.{domainName}
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-8">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={isLoading}
                  className="flex-1 h-14 text-lg border-2 border-gray-200 hover:border-gray-300 rounded-2xl bg-white/50 backdrop-blur-sm hover:bg-white/80 transition-all duration-300"
                >
                  <ArrowLeft className="h-5 w-5 mr-2" />
                  Vorige stap
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleCancel}
                  disabled={isLoading}
                  className="flex-1 h-14 text-lg rounded-2xl hover:bg-gray-100 transition-all duration-300"
                >
                  Annuleren
                </Button>

                <Button
                  type="submit"
                  disabled={isLoading || !subdomain.trim() || availabilityStatus !== "available"}
                  className="flex-1 h-14 text-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-2xl transition-all duration-500 hover:shadow-xl hover:shadow-blue-500/25 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Bezig met instellen...
                    </>
                  ) : (
                    <>
                      Klant voltooien
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Information Card */}
        <Card className="mt-8 border-2 border-blue-200/50 shadow-xl bg-white/80 backdrop-blur-sm rounded-3xl overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-blue-100 text-blue-600">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Wat gebeurt er na het instellen?</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Het subdomain wordt toegevoegd aan het Vercel project</li>
                  <li>• DNS CNAME record wordt automatisch geconfigureerd</li>
                  <li>• SSL certificaat wordt automatisch aangevraagd</li>
                  <li>• De klant kan inloggen via het nieuwe subdomain</li>
                  <li>• U wordt doorverwezen naar het klantenoverzicht</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
