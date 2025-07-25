"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Building2, MapPin, User, Eye, EyeOff, ArrowRight, AlertCircle, Sparkles } from "lucide-react"
import { createNewClient, updateExistingClient, getClientData } from "./actions"
import type { NewClientFormData, ExistingClientFormData } from "@/types/client"

interface NewClientWizardStep1Props {
  tenantId: string
}

const STORAGE_KEY = "packway-wizard-step1-data"

export function NewClientWizardStep1({ tenantId }: NewClientWizardStep1Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hoveredSection, setHoveredSection] = useState<string | null>(null)
  const [isPageLoaded, setIsPageLoaded] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [clientId, setClientId] = useState<string | null>(null)
  const [dataLoaded, setDataLoaded] = useState(false)

  const [formData, setFormData] = useState<NewClientFormData>({
    company_name: "",
    logo_url: "",
    address_company_name: "",
    address_contact_person: "",
    address_street: "",
    address_number: "",
    address_postal_code: "",
    address_city: "",
    address_country: "Nederland",
    user_name: "",
    user_email: "",
    user_position: "",
    user_phone: "",
    user_role: "beheerder",
    user_password: "",
  })

  // Check URL parameters and load data accordingly
  useEffect(() => {
    const fromStep = searchParams.get("fromStep")
    const clientIdParam = searchParams.get("clientId")
    const preserveData = searchParams.get("preserveData") === "true"

    console.log("URL params:", { fromStep, clientIdParam, preserveData })

    if (fromStep === "2" && clientIdParam) {
      // Coming from step 2, load existing client data
      setIsEditMode(true)
      setClientId(clientIdParam)
      loadClientData(clientIdParam)
    } else if (preserveData) {
      // Load data from session storage
      loadStoredData()
    } else {
      // Clear any stored data for fresh start
      clearStoredData()
      setDataLoaded(true)
    }

    const timer = setTimeout(() => setIsPageLoaded(true), 100)
    return () => clearTimeout(timer)
  }, [searchParams])

  // Save data to session storage whenever form data changes
  useEffect(() => {
    if (dataLoaded && !isEditMode) {
      saveDataToStorage()
    }
  }, [formData, dataLoaded, isEditMode])

  // Clear stored data on page refresh
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (!isEditMode) {
        clearStoredData()
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [isEditMode])

  const loadClientData = async (clientIdParam: string) => {
    try {
      setIsLoading(true)
      const result = await getClientData(clientIdParam, tenantId)

      if (result.success && result.client && result.user) {
        const { client, user } = result
        setFormData({
          company_name: client.company_name || "",
          logo_url: client.logo_url || "",
          address_company_name: client.address_company_name || "",
          address_contact_person: client.address_contact_person || "",
          address_street: client.address_street || "",
          address_number: client.address_number || "",
          address_postal_code: client.address_postal_code || "",
          address_city: client.address_city || "",
          address_country: client.address_country || "Nederland",
          user_name: user.name || "",
          user_email: user.email || "",
          user_position: user.position || "",
          user_phone: user.phone || "",
          user_role: user.role || "beheerder",
          user_password: "", // Don't pre-fill password for security
        })
        console.log("Client data loaded successfully")
      } else {
        setError(result.error || "Kon klantgegevens niet laden")
      }
    } catch (error) {
      console.error("Error loading client data:", error)
      setError("Er is een fout opgetreden bij het laden van de gegevens")
    } finally {
      setIsLoading(false)
      setDataLoaded(true)
    }
  }

  const saveDataToStorage = () => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(formData))
    } catch (error) {
      console.warn("Could not save data to session storage:", error)
    }
  }

  const loadStoredData = () => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsedData = JSON.parse(stored)
        setFormData(parsedData)
        console.log("Loaded data from session storage")
      }
    } catch (error) {
      console.warn("Could not load data from session storage:", error)
    } finally {
      setDataLoaded(true)
    }
  }

  const clearStoredData = () => {
    try {
      sessionStorage.removeItem(STORAGE_KEY)
    } catch (error) {
      console.warn("Could not clear session storage:", error)
    }
  }

  const [logoLoading, setLogoLoading] = useState(false)
  const [logoError, setLogoError] = useState<string | null>(null)

  const handleInputChange = (field: keyof NewClientFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (error) setError(null)
  }

  const handleLogoUrlChange = (value: string) => {
    handleInputChange("logo_url", value)
    setLogoError(null)

    if (value.trim()) {
      setLogoLoading(true)
      // Simple validation - check if it's a valid URL
      try {
        new URL(value)
      } catch {
        setLogoError("Voer een geldige URL in")
        setLogoLoading(false)
        return
      }
    }
  }

  const handleLogoLoad = () => {
    setLogoLoading(false)
    setLogoError(null)
  }

  const handleLogoError = () => {
    setLogoLoading(false)
    setLogoError("Logo kon niet worden geladen")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    // Basic validation
    if (!formData.company_name.trim()) {
      setError("Bedrijfsnaam is verplicht")
      setIsLoading(false)
      return
    }

    if (!formData.user_name.trim()) {
      setError("Naam van de gebruiker is verplicht")
      setIsLoading(false)
      return
    }

    if (!formData.user_email.trim()) {
      setError("E-mailadres is verplicht")
      setIsLoading(false)
      return
    }

    if (!isEditMode && !formData.user_password.trim()) {
      setError("Wachtwoord is verplicht")
      setIsLoading(false)
      return
    }

    if (!isEditMode && formData.user_password.length < 6) {
      setError("Wachtwoord moet minimaal 6 karakters bevatten")
      setIsLoading(false)
      return
    }

    try {
      console.log("Submitting form data:", {
        ...formData,
        user_password: "[REDACTED]",
        isEditMode,
        clientId,
      })

      let result
      if (isEditMode && clientId) {
        // Update existing client
        const updateData: ExistingClientFormData = {
          ...formData,
          clientId,
        }
        result = await updateExistingClient(updateData, tenantId)
      } else {
        // Create new client
        result = await createNewClient(formData, tenantId)
      }

      console.log("Submit result:", result)

      if (result.success) {
        // Clear stored data on successful submission
        clearStoredData()

        // Navigate to step 2
        const targetClientId = result.clientId || clientId
        router.push(`/dashboard/fc/klanten/nieuw/stap-2?clientId=${targetClientId}`)
      } else {
        setError(result.error || "Er is een fout opgetreden")
      }
    } catch (error) {
      console.error("Error submitting form:", error)
      setError("Er is een onverwachte fout opgetreden")
    } finally {
      setIsLoading(false)
    }
  }

  const handleBack = () => {
    if (isEditMode && clientId) {
      // Return to step 2 with the client ID
      router.push(`/dashboard/fc/klanten/nieuw/stap-2?clientId=${clientId}`)
    } else {
      // Go back to clients overview
      router.push("/dashboard/fc/klanten")
    }
  }

  if (!dataLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div
      className={`min-h-screen transition-all duration-1000 ${isPageLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
    >
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-100/30 to-blue-200/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-blue-100/30 to-blue-200/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto">
        {/* Back Button - Positioned above title */}
        <div
          className={`mb-8 transition-all duration-700 delay-200 ${isPageLoaded ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"}`}
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="group bg-white/80 backdrop-blur-sm border border-gray-200/50 text-gray-700 hover:text-blue-600 hover:bg-blue-50/80 hover:border-blue-200/50 transition-all duration-300 rounded-xl px-6 py-3 shadow-sm hover:shadow-md transform hover:scale-105"
          >
            <ArrowLeft className="h-4 w-4 mr-2 transition-all duration-300 group-hover:-translate-x-1 group-hover:text-blue-600" />
            <span className="font-medium">{isEditMode ? "Terug naar configuratie" : "Terug naar overzicht"}</span>
          </Button>
        </div>

        {/* Enhanced Header */}
        <div
          className={`text-center mb-8 lg:mb-16 transition-all duration-700 delay-300 ${isPageLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
        >
          <div className="inline-flex items-center justify-center mb-6">
            <div className="relative">
              <Sparkles className="h-8 w-8 text-blue-500 animate-pulse" />
              <div className="absolute inset-0 h-8 w-8 bg-blue-400/20 rounded-full animate-ping"></div>
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-4">
            {isEditMode ? "Klantgegevens Bewerken" : "Nieuwe Klant Toevoegen"}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            {isEditMode
              ? "Bewerk de klantgegevens en keer terug naar de configuratie wanneer u klaar bent."
              : "Welkom bij de klant wizard. Vul de onderstaande gegevens in om een nieuwe fulfillment klant toe te voegen aan uw systeem."}
          </p>
        </div>

        {/* Enhanced Progress Indicator - Mobile responsive positioning */}
        <div
          className={`relative mb-8 lg:mb-16 transition-all duration-700 delay-400 ${isPageLoaded ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}
        >
          <div className="flex items-center justify-center max-w-xs sm:max-w-md mx-auto">
            {/* Step 1 - Active */}
            <div className="flex items-center group">
              <div className="relative">
                <div className="w-10 h-10 sm:w-14 sm:h-14 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl flex items-center justify-center text-sm sm:text-lg font-bold shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl">
                  1
                </div>
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-blue-600 rounded-2xl opacity-0 group-hover:opacity-30 transition-opacity duration-300 blur-sm"></div>
              </div>
              <div className="ml-2 sm:ml-4">
                <span className="text-sm sm:text-lg font-semibold text-blue-600">Klantgegevens</span>
                <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">Basis informatie</p>
              </div>
            </div>

            {/* Connection Line */}
            <div className="flex-1 mx-4 sm:mx-8">
              <div
                className={`h-1 sm:h-2 rounded-full relative overflow-hidden ${
                  isEditMode
                    ? "bg-gradient-to-r from-blue-500 to-blue-500"
                    : "bg-gradient-to-r from-blue-500 via-blue-300 to-gray-200"
                }`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400/50 to-transparent animate-pulse"></div>
              </div>
            </div>

            {/* Step 2 - Inactive or Completed */}
            <div className={`flex items-center group ${isEditMode ? "opacity-100" : "opacity-60"}`}>
              <div className="relative">
                <div
                  className={`w-10 h-10 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center text-sm sm:text-lg font-medium transition-all duration-300 ${
                    isEditMode
                      ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg"
                      : "bg-gray-200 text-gray-500 group-hover:bg-gray-300"
                  }`}
                >
                  2
                </div>
              </div>
              <div className="ml-2 sm:ml-4">
                <span className={`text-sm sm:text-lg font-medium ${isEditMode ? "text-blue-600" : "text-gray-500"}`}>
                  Configuratie
                </span>
                <p className={`text-xs sm:text-sm hidden sm:block ${isEditMode ? "text-gray-600" : "text-gray-400"}`}>
                  Instellingen
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-gradient-to-r from-red-50 to-red-100/50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl mb-8 shadow-sm backdrop-blur-sm animate-in slide-in-from-top-2 duration-300">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-red-500" />
              </div>
              <div className="ml-3">
                <p className="font-medium">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section 1: Company Information */}
          <Card
            className={`group border-2 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-100/50 backdrop-blur-sm bg-white/80 ${
              hoveredSection === "company"
                ? "border-blue-300 shadow-xl shadow-blue-100/50 scale-[1.02] bg-white/90"
                : "border-gray-200/50 hover:border-blue-200/70 shadow-lg"
            } rounded-3xl overflow-hidden ${isPageLoaded ? "animate-in slide-in-from-bottom-4 duration-700 delay-500" : ""}`}
            onMouseEnter={() => setHoveredSection("company")}
            onMouseLeave={() => setHoveredSection(null)}
          >
            <CardHeader className="pb-6 relative overflow-hidden bg-gradient-to-br from-blue-50/50 to-white/50">
              {/* Animated Background Pattern */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-transparent rounded-full -translate-y-16 translate-x-16 transition-all duration-700 group-hover:scale-150 group-hover:rotate-12"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-300/5 to-transparent rounded-full translate-y-12 -translate-x-12 transition-all duration-700 group-hover:scale-125"></div>

              <CardTitle className="flex items-center gap-4 text-2xl text-gray-900 relative z-10">
                <div
                  className={`p-4 rounded-2xl transition-all duration-500 ${
                    hoveredSection === "company"
                      ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg scale-110 rotate-3"
                      : "bg-gradient-to-r from-blue-100 to-blue-50 text-blue-600 hover:from-blue-200 hover:to-blue-100"
                  }`}
                >
                  <Building2 className="h-6 w-6 transition-transform duration-300 group-hover:scale-110" />
                </div>
                <div>
                  <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    Bedrijfsinformatie
                  </span>
                  <p className="text-sm font-normal text-gray-500 mt-1">Basis gegevens van het bedrijf</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 p-6 sm:p-8">
              <div className="group/input w-full">
                <Label htmlFor="company_name" className="text-sm font-semibold text-gray-700 mb-3 block">
                  Bedrijfsnaam <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="company_name"
                  value={formData.company_name}
                  onChange={(e) => handleInputChange("company_name", e.target.value)}
                  placeholder="Voer de bedrijfsnaam in"
                  className="w-full h-14 text-lg border-2 border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 group-hover/input:border-blue-300 rounded-2xl bg-white/50 backdrop-blur-sm hover:bg-white/80 hover:shadow-md outline-none focus:outline-none focus:ring-0 focus-visible:ring-0"
                  required
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
                <div className="group/input w-full">
                  <Label htmlFor="logo_url" className="text-sm font-semibold text-gray-700 mb-3 block">
                    Logo URL <span className="text-gray-400">(optioneel)</span>
                  </Label>
                  <Input
                    id="logo_url"
                    type="url"
                    value={formData.logo_url}
                    onChange={(e) => handleLogoUrlChange(e.target.value)}
                    placeholder="https://example.com/logo.png"
                    className="w-full h-14 border-2 border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 group-hover/input:border-blue-300 rounded-2xl bg-white/50 backdrop-blur-sm hover:bg-white/80 hover:shadow-md outline-none focus:outline-none focus:ring-0 focus-visible:ring-0"
                  />
                  {logoError && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {logoError}
                    </p>
                  )}
                </div>

                <div className="w-full">
                  <Label className="text-sm font-semibold text-gray-700 mb-3 block">Logo voorvertoning</Label>
                  <div className="w-full h-14 border-2 border-gray-200 rounded-2xl bg-white/50 backdrop-blur-sm flex items-center justify-center relative overflow-hidden">
                    {formData.logo_url && !logoError ? (
                      <div className="relative w-full h-full flex items-center justify-center p-2">
                        {logoLoading && (
                          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
                            <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent"></div>
                          </div>
                        )}
                        <img
                          src={formData.logo_url || "/placeholder.svg"}
                          alt="Logo voorvertoning"
                          className="max-w-full max-h-full object-contain transition-all duration-300"
                          onLoad={handleLogoLoad}
                          onError={handleLogoError}
                          style={{ display: logoLoading ? "none" : "block" }}
                        />
                      </div>
                    ) : (
                      <div className="text-gray-400 text-sm flex items-center">
                        <Building2 className="h-4 w-4 mr-2" />
                        {logoError ? "Logo kon niet worden geladen" : "Logo verschijnt hier"}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 2: Address Information */}
          <Card
            className={`group border-2 transition-all duration-500 hover:shadow-2xl hover:shadow-orange-100/50 backdrop-blur-sm bg-white/80 ${
              hoveredSection === "address"
                ? "border-orange-300 shadow-xl shadow-orange-100/50 scale-[1.02] bg-white/90"
                : "border-gray-200/50 hover:border-orange-200/70 shadow-lg"
            } rounded-3xl overflow-hidden ${isPageLoaded ? "animate-in slide-in-from-bottom-4 duration-700 delay-600" : ""}`}
            onMouseEnter={() => setHoveredSection("address")}
            onMouseLeave={() => setHoveredSection(null)}
          >
            <CardHeader className="pb-6 relative overflow-hidden bg-gradient-to-br from-orange-50/50 to-white/50">
              {/* Animated Background Pattern */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-400/10 to-transparent rounded-full -translate-y-16 translate-x-16 transition-all duration-700 group-hover:scale-150 group-hover:-rotate-12"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-orange-300/5 to-transparent rounded-full translate-y-12 -translate-x-12 transition-all duration-700 group-hover:scale-125"></div>

              <CardTitle className="flex items-center gap-4 text-2xl text-gray-900 relative z-10">
                <div
                  className={`p-4 rounded-2xl transition-all duration-500 ${
                    hoveredSection === "address"
                      ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg scale-110 rotate-3"
                      : "bg-gradient-to-r from-orange-100 to-orange-50 text-orange-600 hover:from-orange-200 hover:to-orange-100"
                  }`}
                >
                  <MapPin className="h-6 w-6 transition-transform duration-300 group-hover:scale-110" />
                </div>
                <div>
                  <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    Adresgegevens
                  </span>
                  <p className="text-sm font-normal text-gray-500 mt-1">Locatie en contactinformatie</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 p-6 sm:p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
                <div className="group/input w-full">
                  <Label htmlFor="address_company_name" className="text-sm font-semibold text-gray-700 mb-3 block">
                    Bedrijfsnaam (adres)
                  </Label>
                  <Input
                    id="address_company_name"
                    value={formData.address_company_name}
                    onChange={(e) => handleInputChange("address_company_name", e.target.value)}
                    placeholder="Optioneel - indien afwijkend"
                    className="w-full h-14 border-2 border-gray-200 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-300 group-hover/input:border-orange-300 rounded-2xl bg-white/50 backdrop-blur-sm hover:bg-white/80 hover:shadow-md outline-none focus:outline-none focus:ring-0 focus-visible:ring-0"
                  />
                </div>
                <div className="group/input w-full">
                  <Label htmlFor="address_contact_person" className="text-sm font-semibold text-gray-700 mb-3 block">
                    Contactpersoon
                  </Label>
                  <Input
                    id="address_contact_person"
                    value={formData.address_contact_person}
                    onChange={(e) => handleInputChange("address_contact_person", e.target.value)}
                    placeholder="Naam contactpersoon"
                    className="w-full h-14 border-2 border-gray-200 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-300 group-hover/input:border-orange-300 rounded-2xl bg-white/50 backdrop-blur-sm hover:bg-white/80 hover:shadow-md outline-none focus:outline-none focus:ring-0 focus-visible:ring-0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
                <div className="lg:col-span-2 group/input w-full">
                  <Label htmlFor="address_street" className="text-sm font-semibold text-gray-700 mb-3 block">
                    Straat
                  </Label>
                  <Input
                    id="address_street"
                    value={formData.address_street}
                    onChange={(e) => handleInputChange("address_street", e.target.value)}
                    placeholder="Straatnaam"
                    className="w-full h-14 border-2 border-gray-200 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-300 group-hover/input:border-orange-300 rounded-2xl bg-white/50 backdrop-blur-sm hover:bg-white/80 hover:shadow-md outline-none focus:outline-none focus:ring-0 focus-visible:ring-0"
                  />
                </div>
                <div className="group/input w-full">
                  <Label htmlFor="address_number" className="text-sm font-semibold text-gray-700 mb-3 block">
                    Huisnummer
                  </Label>
                  <Input
                    id="address_number"
                    value={formData.address_number}
                    onChange={(e) => handleInputChange("address_number", e.target.value)}
                    placeholder="123"
                    className="w-full h-14 border-2 border-gray-200 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-300 group-hover/input:border-orange-300 rounded-2xl bg-white/50 backdrop-blur-sm hover:bg-white/80 hover:shadow-md outline-none focus:outline-none focus:ring-0 focus-visible:ring-0"
                  />
                </div>
                <div className="group/input w-full">
                  <Label htmlFor="address_postal_code" className="text-sm font-semibold text-gray-700 mb-3 block">
                    Postcode
                  </Label>
                  <Input
                    id="address_postal_code"
                    value={formData.address_postal_code}
                    onChange={(e) => handleInputChange("address_postal_code", e.target.value)}
                    placeholder="1234 AB"
                    className="w-full h-14 border-2 border-gray-200 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-300 group-hover/input:border-orange-300 rounded-2xl bg-white/50 backdrop-blur-sm hover:bg-white/80 hover:shadow-md outline-none focus:outline-none focus:ring-0 focus-visible:ring-0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
                <div className="group/input w-full">
                  <Label htmlFor="address_city" className="text-sm font-semibold text-gray-700 mb-3 block">
                    Stad
                  </Label>
                  <Input
                    id="address_city"
                    value={formData.address_city}
                    onChange={(e) => handleInputChange("address_city", e.target.value)}
                    placeholder="Amsterdam"
                    className="w-full h-14 border-2 border-gray-200 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-300 group-hover/input:border-orange-300 rounded-2xl bg-white/50 backdrop-blur-sm hover:bg-white/80 hover:shadow-md outline-none focus:outline-none focus:ring-0 focus-visible:ring-0"
                  />
                </div>
                <div className="group/input w-full">
                  <Label htmlFor="address_country" className="text-sm font-semibold text-gray-700 mb-3 block">
                    Land
                  </Label>
                  <Input
                    id="address_country"
                    value={formData.address_country}
                    onChange={(e) => handleInputChange("address_country", e.target.value)}
                    placeholder="Nederland"
                    className="w-full h-14 border-2 border-gray-200 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-300 group-hover/input:border-orange-300 rounded-2xl bg-white/50 backdrop-blur-sm hover:bg-white/80 hover:shadow-md outline-none focus:outline-none focus:ring-0 focus-visible:ring-0"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 3: User Account */}
          <Card
            className={`group border-2 transition-all duration-500 hover:shadow-2xl hover:shadow-green-100/50 backdrop-blur-sm bg-white/80 ${
              hoveredSection === "user"
                ? "border-green-300 shadow-xl shadow-green-100/50 scale-[1.02] bg-white/90"
                : "border-gray-200/50 hover:border-green-200/70 shadow-lg"
            } rounded-3xl overflow-hidden ${isPageLoaded ? "animate-in slide-in-from-bottom-4 duration-700 delay-700" : ""}`}
            onMouseEnter={() => setHoveredSection("user")}
            onMouseLeave={() => setHoveredSection(null)}
          >
            <CardHeader className="pb-6 relative overflow-hidden bg-gradient-to-br from-green-50/50 to-white/50">
              {/* Animated Background Pattern */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-400/10 to-transparent rounded-full -translate-y-16 translate-x-16 transition-all duration-700 group-hover:scale-150 group-hover:rotate-12"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-green-300/5 to-transparent rounded-full translate-y-12 -translate-x-12 transition-all duration-700 group-hover:scale-125"></div>

              <CardTitle className="flex items-center gap-4 text-2xl text-gray-900 relative z-10">
                <div
                  className={`p-4 rounded-2xl transition-all duration-500 ${
                    hoveredSection === "user"
                      ? "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg scale-110 rotate-3"
                      : "bg-gradient-to-r from-green-100 to-green-50 text-green-600 hover:from-green-200 hover:to-green-100"
                  }`}
                >
                  <User className="h-6 w-6 transition-transform duration-300 group-hover:scale-110" />
                </div>
                <div>
                  <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    {isEditMode ? "Gebruikersaccount" : "Eerste gebruikersaccount"}
                  </span>
                  <p className="text-sm font-normal text-gray-500 mt-1">
                    {isEditMode ? "Bewerk gebruikersgegevens" : "Hoofdgebruiker voor dit bedrijf"}
                  </p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 p-6 sm:p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
                <div className="group/input w-full">
                  <Label htmlFor="user_name" className="text-sm font-semibold text-gray-700 mb-3 block">
                    Naam <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="user_name"
                    value={formData.user_name}
                    onChange={(e) => handleInputChange("user_name", e.target.value)}
                    placeholder="Voor- en achternaam"
                    className="w-full h-14 border-2 border-gray-200 focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all duration-300 group-hover/input:border-green-300 rounded-2xl bg-white/50 backdrop-blur-sm hover:bg-white/80 hover:shadow-md outline-none focus:outline-none focus:ring-0 focus-visible:ring-0"
                    required
                  />
                </div>
                <div className="group/input w-full">
                  <Label htmlFor="user_email" className="text-sm font-semibold text-gray-700 mb-3 block">
                    E-mailadres <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="user_email"
                    type="email"
                    value={formData.user_email}
                    onChange={(e) => handleInputChange("user_email", e.target.value)}
                    placeholder="naam@bedrijf.nl"
                    className="w-full h-14 border-2 border-gray-200 focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all duration-300 group-hover/input:border-green-300 rounded-2xl bg-white/50 backdrop-blur-sm hover:bg-white/80 hover:shadow-md outline-none focus:outline-none focus:ring-0 focus-visible:ring-0"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
                <div className="group/input w-full">
                  <Label htmlFor="user_position" className="text-sm font-semibold text-gray-700 mb-3 block">
                    Bedrijfsrol
                  </Label>
                  <Input
                    id="user_position"
                    value={formData.user_position}
                    onChange={(e) => handleInputChange("user_position", e.target.value)}
                    placeholder="Bijv. Manager, CEO"
                    className="w-full h-14 border-2 border-gray-200 focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all duration-300 group-hover/input:border-green-300 rounded-2xl bg-white/50 backdrop-blur-sm hover:bg-white/80 hover:shadow-md outline-none focus:outline-none focus:ring-0 focus-visible:ring-0"
                  />
                </div>
                <div className="group/input w-full">
                  <Label htmlFor="user_phone" className="text-sm font-semibold text-gray-700 mb-3 block">
                    Telefoonnummer
                  </Label>
                  <Input
                    id="user_phone"
                    value={formData.user_phone}
                    onChange={(e) => handleInputChange("user_phone", e.target.value)}
                    placeholder="+31 6 12345678"
                    className="w-full h-14 border-2 border-gray-200 focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all duration-300 group-hover/input:border-green-300 rounded-2xl bg-white/50 backdrop-blur-sm hover:bg-white/80 hover:shadow-md outline-none focus:outline-none focus:ring-0 focus-visible:ring-0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
                <div className="group/input w-full">
                  <Label htmlFor="user_role" className="text-sm font-semibold text-gray-700 mb-3 block">
                    Accountrol
                  </Label>
                  <Select value={formData.user_role} onValueChange={(value) => handleInputChange("user_role", value)}>
                    <SelectTrigger className="w-full h-14 border-2 border-gray-200 focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all duration-300 hover:border-green-300 rounded-2xl bg-white/50 backdrop-blur-sm hover:bg-white/80 hover:shadow-md outline-none focus:outline-none focus:ring-0 focus-visible:ring-0">
                      <SelectValue placeholder="Selecteer rol" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-2 border-gray-200 bg-white/95 backdrop-blur-sm">
                      <SelectItem
                        value="beheerder"
                        className="rounded-xl hover:bg-green-50 transition-colors duration-200"
                      >
                        Beheerder
                      </SelectItem>
                      <SelectItem
                        value="medewerker"
                        className="rounded-xl hover:bg-green-50 transition-colors duration-200"
                      >
                        Medewerker
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="group/input w-full">
                  <Label htmlFor="user_password" className="text-sm font-semibold text-gray-700 mb-3 block">
                    {isEditMode ? "Nieuw wachtwoord" : "Tijdelijk wachtwoord"}{" "}
                    {!isEditMode && <span className="text-red-500">*</span>}
                    {isEditMode && (
                      <span className="text-gray-400 text-xs block mt-1">Laat leeg om ongewijzigd te laten</span>
                    )}
                  </Label>
                  <div className="relative w-full">
                    <Input
                      id="user_password"
                      type={showPassword ? "text" : "password"}
                      value={formData.user_password}
                      onChange={(e) => handleInputChange("user_password", e.target.value)}
                      placeholder={isEditMode ? "Nieuw wachtwoord (optioneel)" : "Minimaal 6 karakters"}
                      className="w-full h-14 pr-14 border-2 border-gray-200 focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all duration-300 group-hover/input:border-green-300 rounded-2xl bg-white/50 backdrop-blur-sm hover:bg-white/80 hover:shadow-md outline-none focus:outline-none focus:ring-0 focus-visible:ring-0"
                      required={!isEditMode}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-green-600 transition-all duration-200 hover:scale-110"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Submit Button */}
          <div
            className={`flex justify-end pt-12 ${isPageLoaded ? "animate-in slide-in-from-bottom-4 duration-700 delay-800" : ""}`}
          >
            <Button
              type="submit"
              disabled={isLoading}
              className="group relative bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-12 py-6 text-lg font-semibold rounded-2xl transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/25 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed min-w-[220px] overflow-hidden"
            >
              {/* Animated Background Effects */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-blue-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse"></div>
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-blue-600 rounded-2xl opacity-0 group-hover:opacity-30 transition-opacity duration-500 blur-xl"></div>

              {/* Shimmer Effect */}
              <div className="absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-[shimmer_1.5s_ease-in-out] transition-opacity duration-300"></div>

              {/* Button Content */}
              <div className="relative flex items-center justify-center">
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent mr-3"></div>
                    <span>{isEditMode ? "Bezig met bijwerken..." : "Bezig met opslaan..."}</span>
                  </>
                ) : (
                  <>
                    <span className="mr-3">{isEditMode ? "Wijzigingen opslaan" : "Volgende stap"}</span>
                    <ArrowRight className="h-5 w-5 transition-all duration-300 group-hover:translate-x-1 group-hover:scale-110" />
                  </>
                )}
              </div>
            </Button>
          </div>
        </form>
      </div>

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%) skewX(-12deg); }
          100% { transform: translateX(200%) skewX(-12deg); }
        }
        
        .animate-in {
          animation-fill-mode: both;
        }
        
        .slide-in-from-top-2 {
          animation: slideInFromTop 0.3s ease-out;
        }
        
        .slide-in-from-bottom-4 {
          animation: slideInFromBottom 0.7s ease-out;
        }
        
        @keyframes slideInFromTop {
          from {
            opacity: 0;
            transform: translateY(-8px);
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
      `}</style>
    </div>
  )
}
