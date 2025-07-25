"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Loader2, UserPlus, CheckCircle } from "lucide-react"
import { FCLayout } from "../../../_components/fc-layout"
import { createClientUser, type CreateClientUserData } from "./actions"
import { toast } from "sonner"

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
}

interface NewClientUserPageClientProps {
  tenant: any
  user: TenantUser
  client: Client
  clientId: string
}

export function NewClientUserPageClient({ tenant, user, client, clientId }: NewClientUserPageClientProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<CreateClientUserData>({
    name: "",
    email: "",
    position: "",
    phone: "",
    password: "",
    role: "user",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleInputChange = (field: keyof CreateClientUserData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "Naam is verplicht"
    }

    if (!formData.email.trim()) {
      newErrors.email = "E-mailadres is verplicht"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Ongeldig e-mailadres"
    }

    if (!formData.password.trim()) {
      newErrors.password = "Wachtwoord is verplicht"
    } else if (formData.password.length < 8) {
      newErrors.password = "Wachtwoord moet minimaal 8 karakters bevatten"
    }

    if (!formData.role) {
      newErrors.role = "Rol is verplicht"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error("Controleer de ingevoerde gegevens")
      return
    }

    setIsLoading(true)

    try {
      console.log("Submitting form data:", { clientId, tenantId: tenant.id, formData })

      const result = await createClientUser(clientId, tenant.id, formData)

      console.log("Server action result:", result)

      if (result.success) {
        toast.success("Gebruiker succesvol aangemaakt")
        // Clear form
        setFormData({
          name: "",
          email: "",
          position: "",
          phone: "",
          password: "",
          role: "user",
        })
        // Redirect after short delay to show success message
        setTimeout(() => {
          router.push(`/dashboard/fc/klanten/${clientId}`)
        }, 1000)
      } else {
        toast.error(result.error || "Er is een fout opgetreden")
        console.error("Server action error:", result.error)
      }
    } catch (error) {
      console.error("Error creating user:", error)
      toast.error("Er is een onverwachte fout opgetreden")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <FCLayout user={user} tenant={tenant} searchPlaceholder="Zoek gebruikers...">
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/dashboard/fc/klanten/${clientId}`)}
              className="text-gray-600 hover:text-gray-900 mb-6"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Terug naar {client.company_name}
            </Button>

            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Nieuwe gebruiker toevoegen</h1>
              <p className="text-gray-600">
                Voeg een nieuwe gebruiker toe aan {client.company_name} en stel toegangsniveau in.
              </p>
            </div>
          </div>

          {/* Form */}
          <Card className="shadow-sm border border-gray-200">
            <CardHeader className="border-b border-gray-200 bg-gray-50/50">
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-blue-600" />
                Gebruikersinformatie
              </CardTitle>
              <CardDescription>Vul de gegevens in voor de nieuwe gebruiker</CardDescription>
            </CardHeader>

            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name Field */}
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                      Naam *
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      placeholder="Voor- en achternaam"
                      className={`h-10 ${errors.name ? "border-red-300 focus:border-red-500" : ""}`}
                      required
                    />
                    {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
                  </div>

                  {/* Email Field */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                      E-mailadres *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="gebruiker@bedrijf.nl"
                      className={`h-10 ${errors.email ? "border-red-300 focus:border-red-500" : ""}`}
                      required
                    />
                    {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Position Field */}
                  <div className="space-y-2">
                    <Label htmlFor="position" className="text-sm font-medium text-gray-700">
                      Functie
                    </Label>
                    <Input
                      id="position"
                      type="text"
                      value={formData.position}
                      onChange={(e) => handleInputChange("position", e.target.value)}
                      placeholder="Functietitel"
                      className="h-10"
                    />
                  </div>

                  {/* Phone Field */}
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                      Telefoonnummer
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      placeholder="+31 6 12345678"
                      className="h-10"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Password Field */}
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                      Wachtwoord *
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      placeholder="Minimaal 8 karakters"
                      className={`h-10 ${errors.password ? "border-red-300 focus:border-red-500" : ""}`}
                      minLength={8}
                      required
                    />
                    {errors.password && <p className="text-sm text-red-600">{errors.password}</p>}
                  </div>

                  {/* Role Field */}
                  <div className="space-y-2">
                    <Label htmlFor="role" className="text-sm font-medium text-gray-700">
                      Rol *
                    </Label>
                    <Select value={formData.role} onValueChange={(value) => handleInputChange("role", value)}>
                      <SelectTrigger className={`h-10 ${errors.role ? "border-red-300 focus:border-red-500" : ""}`}>
                        <SelectValue placeholder="Selecteer een rol" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Administrator</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="user">Gebruiker</SelectItem>
                        <SelectItem value="viewer">Alleen lezen</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.role && <p className="text-sm text-red-600">{errors.role}</p>}
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-3 pt-6 border-t border-gray-200">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push(`/dashboard/fc/klanten/${clientId}`)}
                    className="flex-1"
                    disabled={isLoading}
                  >
                    Annuleren
                  </Button>
                  <Button type="submit" disabled={isLoading} className="flex-1 bg-blue-600 hover:bg-blue-700">
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Gebruiker aanmaken...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Gebruiker aanmaken
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </FCLayout>
  )
}
