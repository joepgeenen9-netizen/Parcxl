"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Building2,
  Globe,
  Settings,
  Loader2,
  X,
  CreditCard,
  Server,
  NetworkIcon as Dns,
  CheckCircle,
  Shield,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"
import { createTenant } from "../actions"
import Link from "next/link"
import type { TenantFormData } from "@/types/tenant"

const steps = [
  {
    id: 1,
    title: "Bedrijfsgegevens",
    description: "Basis informatie en adressen",
    icon: Building2,
  },
  {
    id: 2,
    title: "Domein configuratie",
    description: "Domein en DNS instellingen",
    icon: Globe,
  },
  {
    id: 3,
    title: "Configuratie",
    description: "Logo en aanvullende instellingen",
    icon: Settings,
  },
]

const countries = [
  { value: "NL", label: "Nederland" },
  { value: "BE", label: "België" },
  { value: "DE", label: "Duitsland" },
  { value: "FR", label: "Frankrijk" },
  { value: "GB", label: "Verenigd Koninkrijk" },
]

// Domain setup steps - updated
const domainSetupSteps = [
  {
    id: 1,
    title: "Domeinen toevoegen aan Vercel",
    description: "Voegt het domein en www-versie toe aan Vercel",
    icon: Server,
  },
  {
    id: 2,
    title: "Nameservers wijzigen",
    description: "Wijzigt nameservers naar Vercel DNS",
    icon: Dns,
  },
  {
    id: 3,
    title: "DNS verificatie",
    description: "Controleert of nameservers correct zijn ingesteld",
    icon: Shield,
  },
]

export default function NewTenantPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  const [formData, setFormData] = useState<TenantFormData>({
    name: "",
    type: "FC",
    email: "",
    phone: "",
    kvk_number: "",
    vat_number: "",
    company_street: "",
    company_house_number: "",
    company_postal_code: "",
    company_city: "",
    company_country: "NL",
    return_company: "",
    return_street: "",
    return_house_number: "",
    return_postal_code: "",
    return_city: "",
    return_country: "NL",
    use_company_as_return: false,
    domain: "",
    logo_url: "",
    // Updated fields - removed packway domain type
    domain_type: "custom",
    subdomain: "",
    custom_domain: "",
    domain_checked: false,
    domain_available: false,
    admin_username: "",
    admin_email: "",
    admin_password: "",
  })

  // Domain check and registration states
  const [domainCheckStage, setDomainCheckStage] = useState<"idle" | "loading" | "available" | "error">("idle")
  const [domainError, setDomainError] = useState<string>("")
  const [showRegistration, setShowRegistration] = useState(false)
  const [registering, setRegistering] = useState(false)
  const [registrationComplete, setRegistrationComplete] = useState(false)

  // Domain setup states
  const [showDomainSetup, setShowDomainSetup] = useState(false)
  const [domainSetupInProgress, setDomainSetupInProgress] = useState(false)
  const [domainSetupComplete, setDomainSetupComplete] = useState(false)
  const [currentSetupStep, setCurrentSetupStep] = useState(0)
  const [setupStepResults, setSetupStepResults] = useState<{
    [key: number]: { success: boolean; message: string; data?: any }
  }>({})
  const [createdTenantId, setCreatedTenantId] = useState<string | null>(null)

  // Add state for step 3 completion
  const [completingTenant, setCompletingTenant] = useState(false)
  const [tenantComplete, setTenantComplete] = useState(false)
  const [completionSteps, setCompletionSteps] = useState<{
    [key: string]: { success: boolean; message: string }
  }>({})

  // Check authentication and authorization
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session) {
          router.push("/login")
          return
        }

        // Check if user is super-admin
        const { data: superAdmin } = await supabase.from("super_admins").select("id").eq("id", session.user.id).single()

        if (!superAdmin) {
          router.push("/login")
          return
        }

        setLoading(false)
      } catch (error) {
        console.error("Auth check error:", error)
        router.push("/login")
      }
    }

    checkAuth()
  }, [router])

  // Handle company address copy to return address
  useEffect(() => {
    if (formData.use_company_as_return) {
      setFormData((prev) => ({
        ...prev,
        return_company: prev.name,
        return_street: prev.company_street,
        return_house_number: prev.company_house_number,
        return_postal_code: prev.company_postal_code,
        return_city: prev.company_city,
        return_country: prev.company_country,
      }))
    }
  }, [
    formData.use_company_as_return,
    formData.name,
    formData.company_street,
    formData.company_house_number,
    formData.company_postal_code,
    formData.company_city,
    formData.company_country,
  ])

  const validateStep1 = () => {
    const newErrors: { [key: string]: string } = {}

    if (!formData.name.trim()) newErrors.name = "Bedrijfsnaam is verplicht"
    if (!formData.email.trim()) newErrors.email = "E-mail is verplicht"
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Ongeldig e-mailadres"
    if (!formData.phone.trim()) newErrors.phone = "Telefoonnummer is verplicht"
    if (!formData.kvk_number.trim()) newErrors.kvk_number = "KvK-nummer is verplicht"

    // Company address validation
    if (!formData.company_street.trim()) newErrors.company_street = "Straat is verplicht"
    if (!formData.company_house_number.trim()) newErrors.company_house_number = "Huisnummer is verplicht"
    if (!formData.company_postal_code.trim()) newErrors.company_postal_code = "Postcode is verplicht"
    if (!formData.company_city.trim()) newErrors.company_city = "Stad is verplicht"

    // Return address validation (if not using company address)
    if (!formData.use_company_as_return) {
      if (!formData.return_company.trim()) newErrors.return_company = "Retour bedrijfsnaam is verplicht"
      if (!formData.return_street.trim()) newErrors.return_street = "Retour straat is verplicht"
      if (!formData.return_house_number.trim()) newErrors.return_house_number = "Retour huisnummer is verplicht"
      if (!formData.return_postal_code.trim()) newErrors.return_postal_code = "Retour postcode is verplicht"
      if (!formData.return_city.trim()) newErrors.return_city = "Retour stad is verplicht"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateDomain = (domain: string) => {
    if (!domain.trim()) {
      return "Vul een domein in"
    }
    if (!domain.endsWith(".nl")) {
      return "Alleen .nl domeinen zijn toegestaan"
    }
    if (!/^[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]\.nl$/.test(domain) && !/^[a-zA-Z0-9]\.nl$/.test(domain)) {
      return "Ongeldig domein formaat"
    }
    return null
  }

  const checkDomainAvailability = async () => {
    const domainToCheck = formData.custom_domain.trim()

    const validationError = validateDomain(domainToCheck)
    if (validationError) {
      toast({
        title: "Fout",
        description: validationError,
        variant: "destructive",
      })
      return
    }

    setDomainCheckStage("loading")
    setDomainError("")

    try {
      const response = await fetch("/api/check-domain-availability", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          domain: domainToCheck,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to check domain availability")
      }

      const data = await response.json()

      if (data.available) {
        setDomainCheckStage("available")
        setFormData((prev) => ({
          ...prev,
          domain: data.domain || domainToCheck,
          domain_checked: true,
          domain_available: true,
        }))

        // Show registration UI with animation - changed from 500ms to 2000ms
        setTimeout(() => {
          setShowRegistration(true)
        }, 2000)

        toast({
          title: "Domein beschikbaar",
          description: `${data.domain || domainToCheck} is beschikbaar voor registratie!`,
        })
      } else {
        setDomainCheckStage("error")
        setDomainError(`Het domein ${data.domain || domainToCheck} is niet beschikbaar.`)
        setFormData((prev) => ({
          ...prev,
          domain_checked: true,
          domain_available: false,
        }))
      }
    } catch (error) {
      setDomainCheckStage("error")
      let errorMessage = "Er is een fout opgetreden bij het controleren van het domein."

      if (error instanceof Error) {
        if (error.message.includes("not configured")) {
          errorMessage = "Hostinger API token is niet geconfigureerd. Ga naar Instellingen om deze in te stellen."
        } else {
          errorMessage = error.message
        }
      }

      setDomainError(errorMessage)
      setFormData((prev) => ({
        ...prev,
        domain_checked: true,
        domain_available: false,
      }))

      toast({
        title: "Fout bij domeincontrole",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  const registerDomain = async () => {
    const domainToRegister = formData.domain

    setRegistering(true)

    try {
      const response = await fetch("/api/register-domain", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          domain: domainToRegister,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to register domain")
      }

      const data = await response.json()

      if (data.success) {
        setRegistrationComplete(true)

        // Remove this line - don't create tenant here
        // await createTenantRecord()

        toast({
          title: "Domein geregistreerd!",
          description: `${domainToRegister} is succesvol geregistreerd.`,
        })
      } else {
        throw new Error("Registration failed")
      }
    } catch (error) {
      let errorMessage = "Er is een fout opgetreden bij het registreren van het domein."

      if (error instanceof Error) {
        errorMessage = error.message
      }

      toast({
        title: "Registratie mislukt",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setRegistering(false)
    }
  }

  const createTenantRecord = async () => {
    try {
      const tenantData = {
        name: formData.name,
        type: formData.type,
        email: formData.email,
        phone: formData.phone,
        kvk_number: formData.kvk_number,
        vat_number: formData.vat_number || undefined,
        logo_url: formData.logo_url || undefined,
        return_company: formData.return_company,
        return_street: formData.return_street,
        return_house_number: formData.return_house_number,
        return_postal_code: formData.return_postal_code,
        return_city: formData.return_city,
        return_country: formData.return_country,
      }

      const result = await createTenant(tenantData)

      if (result.success && result.data) {
        setCreatedTenantId(result.data.id)
      } else {
        throw new Error(result.message || "Failed to create tenant")
      }
    } catch (error) {
      console.error("Error creating tenant:", error)
      throw error
    }
  }

  const startDomainSetup = async () => {
    // Remove this check - we don't need tenant ID for domain setup
    // if (!createdTenantId) {
    //   toast({
    //     title: "Fout",
    //     description: "Tenant ID niet gevonden. Probeer opnieuw.",
    //     variant: "destructive",
    //   })
    //   return
    // }

    setDomainSetupInProgress(true)
    setCurrentSetupStep(1)
    setSetupStepResults({})

    const domain = formData.domain

    try {
      // Step 1: Add domains to Vercel (both main and www)
      setCurrentSetupStep(1)
      const vercelResponse = await fetch("/api/setup-domain/add-to-vercel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ domain }),
      })

      const vercelData = await vercelResponse.json()

      if (vercelData.success) {
        setSetupStepResults((prev) => ({
          ...prev,
          1: {
            success: true,
            message: `Domeinen ${domain} en www.${domain} succesvol toegevoegd aan Vercel`,
            data: vercelData.results,
          },
        }))

        // Wait a bit before next step
        await new Promise((resolve) => setTimeout(resolve, 1000))
        setCurrentSetupStep(2)

        // Step 2: Update nameservers
        const nameserverResponse = await fetch("/api/setup-domain/update-nameservers", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ domain }),
        })

        const nameserverData = await nameserverResponse.json()

        if (nameserverData.success) {
          setSetupStepResults((prev) => ({
            ...prev,
            2: { success: true, message: "Nameservers succesvol gewijzigd naar Vercel DNS" },
          }))

          // Wait a few seconds before DNS verification
          await new Promise((resolve) => setTimeout(resolve, 3000))
          setCurrentSetupStep(3)

          // Step 3: Verify nameservers
          const verifyResponse = await fetch("/api/setup-domain/verify-nameservers", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ domain }),
          })

          const verifyData = await verifyResponse.json()

          if (verifyData.success) {
            const nameserversCorrect = verifyData.nameservers_correct

            setSetupStepResults((prev) => ({
              ...prev,
              3: {
                success: true,
                message: nameserversCorrect
                  ? "Nameservers zijn correct ingesteld!"
                  : "Nameservers zijn nog niet doorgezet. Dit kan tot een paar uur duren.",
                data: verifyData,
              },
            }))

            // Don't save domain data here - will be done in step 3
            setTimeout(() => {
              setDomainSetupComplete(true)
              setDomainSetupInProgress(false)
              toast({
                title: "Domein instellen voltooid!",
                description: `${domain} is geconfigureerd. Ga naar stap 3 om de tenant te voltooien.`,
              })
            }, 1000)
          } else {
            throw new Error(verifyData.error || "Failed to verify nameservers")
          }
        } else {
          throw new Error(nameserverData.error || "Failed to update nameservers")
        }
      } else {
        throw new Error(vercelData.error || "Failed to add domains to Vercel")
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Er is een fout opgetreden"

      setSetupStepResults((prev) => ({
        ...prev,
        [currentSetupStep]: { success: false, message: errorMessage },
      }))

      setDomainSetupInProgress(false)

      toast({
        title: "Domein instellen mislukt",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  const goBackToDomainCheck = () => {
    setShowRegistration(false)
    setShowDomainSetup(false)
    setDomainCheckStage("idle")
    setRegistrationComplete(false)
    setDomainSetupComplete(false)
    setCreatedTenantId(null)
    setFormData((prev) => ({
      ...prev,
      custom_domain: "",
      domain: "",
      domain_checked: false,
      domain_available: false,
    }))
  }

  const validateStep3 = () => {
    const newErrors: { [key: string]: string } = {}

    if (!formData.admin_username.trim()) newErrors.admin_username = "Gebruikersnaam is verplicht"
    if (!formData.admin_email.trim()) newErrors.admin_email = "E-mail is verplicht"
    else if (!/\S+@\S+\.\S+/.test(formData.admin_email)) newErrors.admin_email = "Ongeldig e-mailadres"
    if (!formData.admin_password.trim()) newErrors.admin_password = "Wachtwoord is verplicht"
    else if (formData.admin_password.length < 8) newErrors.admin_password = "Wachtwoord moet minimaal 8 karakters zijn"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const completeTenantSetup = async () => {
    if (!validateStep3()) {
      toast({
        title: "Validatiefout",
        description: "Vul alle verplichte velden correct in",
        variant: "destructive",
      })
      return
    }

    setCompletingTenant(true)
    setCompletionSteps({})

    try {
      // Step 1: Create tenant
      setCompletionSteps((prev) => ({
        ...prev,
        tenant: { success: false, message: "Tenant wordt aangemaakt..." },
      }))

      const tenantData = {
        name: formData.name,
        type: formData.type,
        email: formData.email,
        phone: formData.phone,
        kvk_number: formData.kvk_number,
        vat_number: formData.vat_number || undefined,
        logo_url: formData.logo_url || undefined,
        return_company: formData.return_company,
        return_street: formData.return_street,
        return_house_number: formData.return_house_number,
        return_postal_code: formData.return_postal_code,
        return_city: formData.return_city,
        return_country: formData.return_country,
      }

      const tenantResult = await createTenant(tenantData)

      if (!tenantResult.success || !tenantResult.data) {
        throw new Error(tenantResult.message || "Failed to create tenant")
      }

      const newTenantId = tenantResult.data.id
      setCreatedTenantId(newTenantId)

      setCompletionSteps((prev) => ({
        ...prev,
        tenant: { success: true, message: "Tenant aangemaakt" },
      }))

      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Step 2: Save domain data if domain was configured
      if (formData.domain && domainSetupComplete) {
        setCompletionSteps((prev) => ({
          ...prev,
          domain: { success: false, message: "Domein data wordt opgeslagen..." },
        }))

        const nameserversCorrect = setupStepResults[3]?.data?.nameservers_correct || false

        const saveResponse = await fetch("/api/setup-domain/save-domain", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            tenantId: newTenantId,
            domain: formData.domain,
            nameserverVerified: nameserversCorrect,
            vercelDomainVerified: setupStepResults[1]?.data?.[0]?.response?.verified || false,
          }),
        })

        const saveData = await saveResponse.json()

        if (!saveData.success) {
          throw new Error(saveData.error || "Failed to save domain data")
        }

        setCompletionSteps((prev) => ({
          ...prev,
          domain: { success: true, message: "Domein data opgeslagen" },
        }))

        await new Promise((resolve) => setTimeout(resolve, 1000))
      }

      // Step 3: Create admin user
      setCompletionSteps((prev) => ({
        ...prev,
        user: { success: false, message: "Admin gebruiker wordt aangemaakt..." },
      }))

      const response = await fetch("/api/complete-tenant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tenantId: newTenantId,
          logoUrl: formData.logo_url || null,
          user: {
            username: formData.admin_username,
            email: formData.admin_email,
            password: formData.admin_password,
          },
        }),
      })

      const data = await response.json()

      if (data.success) {
        setCompletionSteps((prev) => ({
          ...prev,
          user: { success: true, message: "Admin gebruiker aangemaakt" },
          complete: { success: true, message: "Tenant volledig geconfigureerd!" },
        }))

        setTimeout(() => {
          setTenantComplete(true)
          toast({
            title: "Tenant voltooid!",
            description: "Alle configuratie is succesvol opgeslagen.",
          })
        }, 1000)
      } else {
        throw new Error(data.error || "Failed to complete tenant setup")
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Er is een fout opgetreden"

      setCompletionSteps((prev) => ({
        ...prev,
        error: { success: false, message: errorMessage },
      }))

      toast({
        title: "Fout bij voltooien",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setCompletingTenant(false)
    }
  }

  const handleNext = () => {
    if (currentStep === 1 && !validateStep1()) {
      toast({
        title: "Validatiefout",
        description: "Vul alle verplichte velden correct in",
        variant: "destructive",
      })
      return
    }

    // Add domain validation for step 2
    if (currentStep === 2 && !domainSetupComplete) {
      toast({
        title: "Domein niet ingesteld",
        description: "Voltooi eerst de domein instelling voordat je verder gaat",
        variant: "destructive",
      })
      return
    }

    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleSubmit = async () => {
    await completeTenantSetup()
  }

  if (loading) {
    return (
      <div className="flex-1 p-4 md:p-6 bg-gray-50 min-h-0 overflow-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#0065FF] mx-auto mb-4" />
            <p className="text-gray-600">Laden...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 p-4 md:p-6 bg-gray-50 min-h-0 overflow-auto">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="outline" size="sm" asChild className="rounded-2xl bg-transparent">
              <Link href="/admin/tenants">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Terug
              </Link>
            </Button>
          </div>
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-2" style={{ fontFamily: "Poppins" }}>
            Nieuwe tenant toevoegen
          </h1>
          <p className="text-sm md:text-base text-gray-600">
            Volg de stappen om een nieuwe tenant aan te maken en te configureren.
          </p>
        </div>

        {/* Step Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const isActive = step.id === currentStep
              const isCompleted = step.id < currentStep || (step.id === 2 && domainSetupComplete)
              const isLast = index === steps.length - 1

              return (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex items-center">
                    <div
                      className={`
                        w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200
                        ${
                          isCompleted
                            ? "bg-green-500 text-white"
                            : isActive
                              ? "bg-[#0065FF] text-white"
                              : "bg-gray-200 text-gray-500"
                        }
                      `}
                    >
                      {isCompleted ? <Check className="w-5 h-5" /> : <step.icon className="w-5 h-5" />}
                    </div>
                    <div className="ml-3 hidden md:block">
                      <p
                        className={`text-sm font-medium ${
                          isActive ? "text-[#0065FF]" : isCompleted ? "text-green-600" : "text-gray-500"
                        }`}
                      >
                        {step.title}
                      </p>
                      <p className="text-xs text-gray-500">{step.description}</p>
                    </div>
                  </div>
                  {!isLast && (
                    <div
                      className={`flex-1 h-0.5 mx-4 transition-all duration-200 ${
                        isCompleted ? "bg-green-500" : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Step Content */}
        <Card className="rounded-2xl border-gray-200 shadow-sm mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {(() => {
                const CurrentIcon = steps.find((s) => s.id === currentStep)?.icon
                return CurrentIcon ? <CurrentIcon className="w-5 h-5" /> : null
              })()}
              Stap {currentStep}: {steps.find((s) => s.id === currentStep)?.title}
            </CardTitle>
            <CardDescription>{steps.find((s) => s.id === currentStep)?.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {currentStep === 1 && (
              <div className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Bedrijfsnaam *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                      className={`rounded-2xl ${errors.name ? "border-red-500" : ""}`}
                      placeholder="Bijv. Packway B.V."
                    />
                    {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type">Type *</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value: "FC" | "WS") => setFormData((prev) => ({ ...prev, type: value }))}
                    >
                      <SelectTrigger className="rounded-2xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="FC">Fulfillment Center</SelectItem>
                        <SelectItem value="WS">Webshop</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                      className={`rounded-2xl ${errors.email ? "border-red-500" : ""}`}
                      placeholder="info@bedrijf.nl"
                    />
                    {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefoonnummer *</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                      className={`rounded-2xl ${errors.phone ? "border-red-500" : ""}`}
                      placeholder="+31 20 123 4567"
                    />
                    {errors.phone && <p className="text-sm text-red-600">{errors.phone}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="kvk_number">KvK-nummer *</Label>
                    <Input
                      id="kvk_number"
                      value={formData.kvk_number}
                      onChange={(e) => setFormData((prev) => ({ ...prev, kvk_number: e.target.value }))}
                      className={`rounded-2xl ${errors.kvk_number ? "border-red-500" : ""}`}
                      placeholder="12345678"
                    />
                    {errors.kvk_number && <p className="text-sm text-red-600">{errors.kvk_number}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="vat_number">BTW-nummer</Label>
                    <Input
                      id="vat_number"
                      value={formData.vat_number}
                      onChange={(e) => setFormData((prev) => ({ ...prev, vat_number: e.target.value }))}
                      className="rounded-2xl"
                      placeholder="NL123456789B01"
                    />
                  </div>
                </div>

                {/* Company Address */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Bedrijfsadres</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="company_street">Straat *</Label>
                      <Input
                        id="company_street"
                        value={formData.company_street}
                        onChange={(e) => setFormData((prev) => ({ ...prev, company_street: e.target.value }))}
                        className={`rounded-2xl ${errors.company_street ? "border-red-500" : ""}`}
                        placeholder="Hoofdstraat"
                      />
                      {errors.company_street && <p className="text-sm text-red-600">{errors.company_street}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="company_house_number">Huisnummer *</Label>
                      <Input
                        id="company_house_number"
                        value={formData.company_house_number}
                        onChange={(e) => setFormData((prev) => ({ ...prev, company_house_number: e.target.value }))}
                        className={`rounded-2xl ${errors.company_house_number ? "border-red-500" : ""}`}
                        placeholder="123"
                      />
                      {errors.company_house_number && (
                        <p className="text-sm text-red-600">{errors.company_house_number}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="company_postal_code">Postcode *</Label>
                      <Input
                        id="company_postal_code"
                        value={formData.company_postal_code}
                        onChange={(e) => setFormData((prev) => ({ ...prev, company_postal_code: e.target.value }))}
                        className={`rounded-2xl ${errors.company_postal_code ? "border-red-500" : ""}`}
                        placeholder="1234 AB"
                      />
                      {errors.company_postal_code && (
                        <p className="text-sm text-red-600">{errors.company_postal_code}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="company_city">Stad *</Label>
                      <Input
                        id="company_city"
                        value={formData.company_city}
                        onChange={(e) => setFormData((prev) => ({ ...prev, company_city: e.target.value }))}
                        className={`rounded-2xl ${errors.company_city ? "border-red-500" : ""}`}
                        placeholder="Amsterdam"
                      />
                      {errors.company_city && <p className="text-sm text-red-600">{errors.company_city}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="company_country">Land *</Label>
                      <Select
                        value={formData.company_country}
                        onValueChange={(value) => setFormData((prev) => ({ ...prev, company_country: value }))}
                      >
                        <SelectTrigger className="rounded-2xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {countries.map((country) => (
                            <SelectItem key={country.value} value={country.value}>
                              {country.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Return Address */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Retouradres</h3>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="use_company_as_return"
                        checked={formData.use_company_as_return}
                        onCheckedChange={(checked) =>
                          setFormData((prev) => ({ ...prev, use_company_as_return: !!checked }))
                        }
                      />
                      <Label htmlFor="use_company_as_return" className="text-sm">
                        Retouradres = bedrijfsadres
                      </Label>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="return_company">Bedrijfsnaam *</Label>
                      <Input
                        id="return_company"
                        value={formData.return_company}
                        onChange={(e) => setFormData((prev) => ({ ...prev, return_company: e.target.value }))}
                        className={`rounded-2xl ${errors.return_company ? "border-red-500" : ""}`}
                        placeholder="Retour bedrijfsnaam"
                        disabled={formData.use_company_as_return}
                      />
                      {errors.return_company && <p className="text-sm text-red-600">{errors.return_company}</p>}
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="return_street">Straat *</Label>
                      <Input
                        id="return_street"
                        value={formData.return_street}
                        onChange={(e) => setFormData((prev) => ({ ...prev, return_street: e.target.value }))}
                        className={`rounded-2xl ${errors.return_street ? "border-red-500" : ""}`}
                        placeholder="Retourstraat"
                        disabled={formData.use_company_as_return}
                      />
                      {errors.return_street && <p className="text-sm text-red-600">{errors.return_street}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="return_house_number">Huisnummer *</Label>
                      <Input
                        id="return_house_number"
                        value={formData.return_house_number}
                        onChange={(e) => setFormData((prev) => ({ ...prev, return_house_number: e.target.value }))}
                        className={`rounded-2xl ${errors.return_house_number ? "border-red-500" : ""}`}
                        placeholder="456"
                        disabled={formData.use_company_as_return}
                      />
                      {errors.return_house_number && (
                        <p className="text-sm text-red-600">{errors.return_house_number}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="return_postal_code">Postcode *</Label>
                      <Input
                        id="return_postal_code"
                        value={formData.return_postal_code}
                        onChange={(e) => setFormData((prev) => ({ ...prev, return_postal_code: e.target.value }))}
                        className={`rounded-2xl ${errors.return_postal_code ? "border-red-500" : ""}`}
                        placeholder="5678 CD"
                        disabled={formData.use_company_as_return}
                      />
                      {errors.return_postal_code && <p className="text-sm text-red-600">{errors.return_postal_code}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="return_city">Stad *</Label>
                      <Input
                        id="return_city"
                        value={formData.return_city}
                        onChange={(e) => setFormData((prev) => ({ ...prev, return_city: e.target.value }))}
                        className={`rounded-2xl ${errors.return_city ? "border-red-500" : ""}`}
                        placeholder="Rotterdam"
                        disabled={formData.use_company_as_return}
                      />
                      {errors.return_city && <p className="text-sm text-red-600">{errors.return_city}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="return_country">Land *</Label>
                      <Select
                        value={formData.return_country}
                        onValueChange={(value) => setFormData((prev) => ({ ...prev, return_country: value }))}
                        disabled={formData.use_company_as_return}
                      >
                        <SelectTrigger className="rounded-2xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {countries.map((country) => (
                            <SelectItem key={country.value} value={country.value}>
                              {country.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {showDomainSetup
                      ? "Domein instellen"
                      : showRegistration
                        ? "Domein registreren"
                        : "Domein configuratie"}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {showDomainSetup
                      ? "Configureer het domein voor gebruik met Vercel en DNS."
                      : showRegistration
                        ? "Registreer het domein om verder te gaan met de tenant configuratie."
                        : "Voer een .nl domein in en controleer de beschikbaarheid."}
                  </p>

                  {/* Domain Check Section */}
                  <div
                    className={`transition-all duration-500 ${showRegistration || showDomainSetup ? "opacity-0 h-0 overflow-hidden" : "opacity-100"}`}
                  >
                    {!showRegistration && !showDomainSetup && (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="custom_domain" className="text-sm font-medium text-gray-700">
                            Domein (.nl)
                          </Label>
                          <Input
                            id="custom_domain"
                            value={formData.custom_domain}
                            onChange={(e) => {
                              setFormData((prev) => ({ ...prev, custom_domain: e.target.value }))
                              setDomainCheckStage("idle")
                            }}
                            className="rounded-2xl"
                            placeholder="mijnbedrijf.nl"
                          />
                        </div>

                        <div className="flex items-center space-x-4">
                          <Button
                            type="button"
                            onClick={checkDomainAvailability}
                            disabled={domainCheckStage === "loading" || !formData.custom_domain}
                            className="rounded-2xl bg-[#0065FF] hover:bg-[#0052CC] shadow-lg shadow-blue-500/25"
                          >
                            {domainCheckStage === "loading" ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Controleren...
                              </>
                            ) : (
                              "Controleer beschikbaarheid"
                            )}
                          </Button>

                          {domainCheckStage === "available" && (
                            <div className="flex items-center space-x-2">
                              <div className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center">
                                <Check className="w-3 h-3 mr-1" />
                                Beschikbaar
                              </div>
                            </div>
                          )}

                          {domainCheckStage === "error" && (
                            <div className="flex items-center space-x-2">
                              <div className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center">
                                <X className="w-3 h-3 mr-1" />
                                Niet beschikbaar
                              </div>
                            </div>
                          )}
                        </div>

                        {domainCheckStage === "error" && domainError && (
                          <div className="text-sm text-red-600">{domainError}</div>
                        )}

                        {domainCheckStage === "available" && (
                          <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
                            <div className="flex items-start">
                              <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5" />
                              <div>
                                <h4 className="text-sm font-medium text-green-900">Domein is beschikbaar</h4>
                                <p className="text-sm text-green-700 mt-1">
                                  {formData.custom_domain} is beschikbaar voor registratie.
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Domain Registration Section */}
                  <div
                    className={`transition-all duration-500 ${showRegistration && !showDomainSetup ? "opacity-100" : "opacity-0 h-0 overflow-hidden"}`}
                  >
                    {showRegistration && !showDomainSetup && (
                      <div className="space-y-6">
                        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center">
                              <Globe className="w-8 h-8 text-blue-600 mr-3" />
                              <div>
                                <h4 className="text-lg font-semibold text-blue-900">{formData.domain}</h4>
                                <p className="text-sm text-blue-700">Klaar voor registratie</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-blue-600">Prijs</p>
                              <p className="text-lg font-bold text-blue-900">€6,04</p>
                              <p className="text-xs text-blue-600">per jaar</p>
                            </div>
                          </div>

                          {registrationComplete ? (
                            <div className="bg-green-100 border border-green-300 rounded-xl p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                  <Check className="w-5 h-5 text-green-600 mr-3" />
                                  <div>
                                    <h5 className="text-sm font-medium text-green-900">Domein geregistreerd!</h5>
                                    <p className="text-sm text-green-700">
                                      {formData.domain} is succesvol geregistreerd. Klik op "Instellen" om door te gaan.
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                  <Button
                                    onClick={() => {
                                      setShowDomainSetup(true)
                                      startDomainSetup()
                                    }}
                                    className="rounded-2xl bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-500/25"
                                  >
                                    <Settings className="mr-2 h-4 w-4" />
                                    Instellen
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-4">
                              <Button
                                onClick={registerDomain}
                                disabled={registering}
                                className="rounded-2xl bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-500/25"
                              >
                                {registering ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Registreren...
                                  </>
                                ) : (
                                  <>
                                    <CreditCard className="mr-2 h-4 w-4" />
                                    Registreren
                                  </>
                                )}
                              </Button>

                              <Button
                                variant="outline"
                                onClick={goBackToDomainCheck}
                                className="rounded-2xl bg-transparent"
                              >
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Terug
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Domain Setup Section */}
                  <div
                    className={`transition-all duration-500 ${showDomainSetup ? "opacity-100" : "opacity-0 h-0 overflow-hidden"}`}
                  >
                    {showDomainSetup && (
                      <div className="space-y-6">
                        <div className="bg-purple-50 border border-purple-200 rounded-2xl p-6">
                          <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center">
                              <Settings className="w-8 h-8 text-purple-600 mr-3" />
                              <div>
                                <h4 className="text-lg font-semibold text-purple-900">Domein instellen</h4>
                                <p className="text-sm text-purple-700">Configureer {formData.domain} voor gebruik</p>
                              </div>
                            </div>
                          </div>

                          {/* Setup Steps */}
                          <div className="space-y-4 mb-6">
                            {domainSetupSteps.map((step, index) => {
                              const isActive = currentSetupStep === step.id
                              const isCompleted = setupStepResults[step.id]?.success
                              const hasFailed = setupStepResults[step.id] && !setupStepResults[step.id].success

                              return (
                                <div key={step.id} className="flex items-center space-x-4">
                                  <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
                                      isCompleted
                                        ? "bg-green-500 text-white"
                                        : hasFailed
                                          ? "bg-red-500 text-white"
                                          : isActive
                                            ? "bg-purple-500 text-white"
                                            : "bg-gray-200 text-gray-500"
                                    }`}
                                  >
                                    {isCompleted ? (
                                      <CheckCircle className="w-4 h-4" />
                                    ) : hasFailed ? (
                                      <X className="w-4 h-4" />
                                    ) : isActive && domainSetupInProgress ? (
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                      <step.icon className="w-4 h-4" />
                                    )}
                                  </div>
                                  <div className="flex-1">
                                    <p
                                      className={`text-sm font-medium ${
                                        isCompleted
                                          ? "text-green-700"
                                          : hasFailed
                                            ? "text-red-700"
                                            : isActive
                                              ? "text-purple-700"
                                              : "text-gray-500"
                                      }`}
                                    >
                                      {step.title}
                                    </p>
                                    <p className="text-xs text-gray-600">{step.description}</p>
                                    {setupStepResults[step.id] && (
                                      <p
                                        className={`text-xs mt-1 ${
                                          setupStepResults[step.id].success ? "text-green-600" : "text-red-600"
                                        }`}
                                      >
                                        {setupStepResults[step.id].message}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              )
                            })}
                          </div>

                          {/* Action Buttons */}
                          {domainSetupComplete ? (
                            <div className="bg-green-100 border border-green-300 rounded-xl p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                  <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                                  <div>
                                    <h5 className="text-sm font-medium text-green-900">Domein instellen voltooid!</h5>
                                    <p className="text-sm text-green-700">
                                      {formData.domain} is volledig geconfigureerd en opgeslagen in de database.
                                    </p>
                                  </div>
                                </div>
                                <Button
                                  onClick={() => setCurrentStep(3)}
                                  className="rounded-2xl bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-500/25"
                                >
                                  Naar stap 3
                                  <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-4">
                              <Button
                                onClick={startDomainSetup}
                                disabled={domainSetupInProgress}
                                className="rounded-2xl bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-500/25"
                              >
                                {domainSetupInProgress ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Bezig met instellen...
                                  </>
                                ) : (
                                  <>
                                    <Settings className="mr-2 h-4 w-4" />
                                    Start domein instellen
                                  </>
                                )}
                              </Button>

                              <Button
                                variant="outline"
                                onClick={goBackToDomainCheck}
                                className="rounded-2xl bg-transparent"
                                disabled={domainSetupInProgress}
                              >
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Terug
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Logo en eerste gebruiker</h3>
                  <p className="text-sm text-gray-600">
                    Upload een logo voor de tenant en maak de eerste admin gebruiker aan.
                  </p>

                  {/* Logo Upload Section */}
                  <div className="space-y-4">
                    <h4 className="text-base font-medium text-gray-900">Tenant Logo</h4>
                    <div className="space-y-2">
                      <Label htmlFor="logo_url">Logo URL (optioneel)</Label>
                      <Input
                        id="logo_url"
                        value={formData.logo_url}
                        onChange={(e) => setFormData((prev) => ({ ...prev, logo_url: e.target.value }))}
                        className="rounded-2xl"
                        placeholder="https://example.com/logo.png"
                      />
                      <p className="text-xs text-gray-500">
                        Voer een URL in naar het logo van de tenant. Dit wordt gebruikt in de tenant interface.
                      </p>
                    </div>

                    {formData.logo_url && (
                      <div className="mt-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">Logo preview:</p>
                        <div className="w-32 h-32 border border-gray-200 rounded-2xl flex items-center justify-center bg-gray-50">
                          <img
                            src={formData.logo_url || "/placeholder.svg"}
                            alt="Logo preview"
                            className="max-w-full max-h-full object-contain rounded-xl"
                            onError={(e) => {
                              e.currentTarget.style.display = "none"
                              e.currentTarget.nextElementSibling!.style.display = "block"
                            }}
                          />
                          <div className="text-gray-400 text-sm hidden">Logo kon niet geladen worden</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Admin User Section */}
                  <div className="space-y-4">
                    <h4 className="text-base font-medium text-gray-900">Eerste Admin Gebruiker</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="admin_username">Gebruikersnaam *</Label>
                        <Input
                          id="admin_username"
                          value={formData.admin_username}
                          onChange={(e) => setFormData((prev) => ({ ...prev, admin_username: e.target.value }))}
                          className={`rounded-2xl ${errors.admin_username ? "border-red-500" : ""}`}
                          placeholder="admin"
                        />
                        {errors.admin_username && <p className="text-sm text-red-600">{errors.admin_username}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="admin_email">E-mail *</Label>
                        <Input
                          id="admin_email"
                          type="email"
                          value={formData.admin_email}
                          onChange={(e) => setFormData((prev) => ({ ...prev, admin_email: e.target.value }))}
                          className={`rounded-2xl ${errors.admin_email ? "border-red-500" : ""}`}
                          placeholder="admin@bedrijf.nl"
                        />
                        {errors.admin_email && <p className="text-sm text-red-600">{errors.admin_email}</p>}
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="admin_password">Wachtwoord *</Label>
                        <Input
                          id="admin_password"
                          type="password"
                          value={formData.admin_password}
                          onChange={(e) => setFormData((prev) => ({ ...prev, admin_password: e.target.value }))}
                          className={`rounded-2xl ${errors.admin_password ? "border-red-500" : ""}`}
                          placeholder="Minimaal 8 karakters"
                        />
                        {errors.admin_password && <p className="text-sm text-red-600">{errors.admin_password}</p>}
                      </div>
                    </div>
                  </div>

                  {/* Completion Process */}
                  {(completingTenant || tenantComplete) && (
                    <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
                      <div className="space-y-4">
                        <div className="flex items-center">
                          <Settings className="w-6 h-6 text-blue-600 mr-3" />
                          <h4 className="text-lg font-semibold text-blue-900">
                            {tenantComplete ? "Tenant voltooid!" : "Tenant wordt voltooid..."}
                          </h4>
                        </div>

                        <div className="space-y-3">
                          {/* Domain Step */}
                          {completionSteps.domain && (
                            <div className="flex items-center space-x-3">
                              <div
                                className={`w-6 h-6 rounded-full flex items-center justify-center ${
                                  completionSteps.domain.success ? "bg-green-500" : "bg-blue-500"
                                }`}
                              >
                                {completionSteps.domain.success ? (
                                  <Check className="w-4 h-4 text-white" />
                                ) : (
                                  <Loader2 className="w-4 h-4 text-white animate-spin" />
                                )}
                              </div>
                              <span
                                className={`text-sm ${
                                  completionSteps.domain.success ? "text-green-700" : "text-blue-700"
                                }`}
                              >
                                {completionSteps.domain.message}
                              </span>
                            </div>
                          )}

                          {/* Tenant Step */}
                          {completionSteps.tenant && (
                            <div className="flex items-center space-x-3">
                              <div
                                className={`w-6 h-6 rounded-full flex items-center justify-center ${
                                  completionSteps.tenant.success ? "bg-green-500" : "bg-blue-500"
                                }`}
                              >
                                {completionSteps.tenant.success ? (
                                  <Check className="w-4 h-4 text-white" />
                                ) : (
                                  <Loader2 className="w-4 h-4 text-white animate-spin" />
                                )}
                              </div>
                              <span
                                className={`text-sm ${
                                  completionSteps.tenant.success ? "text-green-700" : "text-blue-700"
                                }`}
                              >
                                {completionSteps.tenant.message}
                              </span>
                            </div>
                          )}

                          {/* Logo Step */}
                          {completionSteps.logo && (
                            <div className="flex items-center space-x-3">
                              <div
                                className={`w-6 h-6 rounded-full flex items-center justify-center ${
                                  completionSteps.logo.success ? "bg-green-500" : "bg-blue-500"
                                }`}
                              >
                                {completionSteps.logo.success ? (
                                  <Check className="w-4 h-4 text-white" />
                                ) : (
                                  <Loader2 className="w-4 h-4 text-white animate-spin" />
                                )}
                              </div>
                              <span
                                className={`text-sm ${
                                  completionSteps.logo.success ? "text-green-700" : "text-blue-700"
                                }`}
                              >
                                {completionSteps.logo.message}
                              </span>
                            </div>
                          )}

                          {/* User Step */}
                          {completionSteps.user && (
                            <div className="flex items-center space-x-3">
                              <div
                                className={`w-6 h-6 rounded-full flex items-center justify-center ${
                                  completionSteps.user.success ? "bg-green-500" : "bg-blue-500"
                                }`}
                              >
                                {completionSteps.user.success ? (
                                  <Check className="w-4 h-4 text-white" />
                                ) : (
                                  <Loader2 className="w-4 h-4 text-white animate-spin" />
                                )}
                              </div>
                              <span
                                className={`text-sm ${
                                  completionSteps.user.success ? "text-green-700" : "text-blue-700"
                                }`}
                              >
                                {completionSteps.user.message}
                              </span>
                            </div>
                          )}

                          {/* Database Step */}
                          {completionSteps.complete && (
                            <div className="flex items-center space-x-3">
                              <div className="w-6 h-6 rounded-full flex items-center justify-center bg-green-500">
                                <Check className="w-4 h-4 text-white" />
                              </div>
                              <span className="text-sm text-green-700">{completionSteps.complete.message}</span>
                            </div>
                          )}

                          {/* Error Step */}
                          {completionSteps.error && (
                            <div className="flex items-center space-x-3">
                              <div className="w-6 h-6 rounded-full flex items-center justify-center bg-red-500">
                                <X className="w-4 h-4 text-white" />
                              </div>
                              <span className="text-sm text-red-700">{completionSteps.error.message}</span>
                            </div>
                          )}
                        </div>

                        {tenantComplete && (
                          <div className="mt-6 pt-4 border-t border-blue-200">
                            <Button
                              onClick={() => router.push("/admin/tenants")}
                              className="rounded-2xl bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-500/25"
                            >
                              <Check className="mr-2 h-4 w-4" />
                              Ga naar Tenant Overzicht
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Action Button */}
                  {!completingTenant && !tenantComplete && (
                    <div className="pt-4">
                      <Button
                        onClick={completeTenantSetup}
                        className="rounded-2xl bg-[#0065FF] hover:bg-[#0052CC] shadow-lg shadow-blue-500/25"
                      >
                        <Settings className="mr-2 h-4 w-4" />
                        Tenant voltooien
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
            className="rounded-2xl"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Vorige
          </Button>

          <div className="flex items-center gap-2">
            {steps.map((step) => (
              <div
                key={step.id}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  step.id === currentStep
                    ? "bg-[#0065FF]"
                    : step.id < currentStep || (step.id === 2 && domainSetupComplete)
                      ? "bg-green-500"
                      : "bg-gray-300"
                }`}
              />
            ))}
          </div>

          <Button
            onClick={() => {
              if (currentStep === steps.length) {
                handleSubmit()
              } else {
                handleNext()
              }
            }}
            disabled={submitting}
            className="rounded-2xl bg-[#0065FF] hover:bg-[#0052CC] shadow-lg shadow-blue-500/25"
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Bezig...
              </>
            ) : currentStep === steps.length ? (
              "Voltooien"
            ) : (
              <>
                Volgende
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
