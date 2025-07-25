"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Building2, AlertCircle, CheckCircle } from "lucide-react"
import { createSupplier } from "@/app/dashboard/fc/leveringen/new/actions"

interface AddSupplierDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  clientId: string
  clientName: string
  onSupplierAdded: (supplier: any) => void
}

export function AddSupplierDialog({
  open,
  onOpenChange,
  clientId,
  clientName,
  onSupplierAdded,
}: AddSupplierDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    naam: "",
    contactpersoon: "",
    email: "",
    adres: "",
    postcode: "",
    stad: "",
    land: "Nederland",
    opmerkingen: "",
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setError(null)
    setSuccess(null)
  }

  const resetForm = () => {
    setFormData({
      naam: "",
      contactpersoon: "",
      email: "",
      adres: "",
      postcode: "",
      stad: "",
      land: "Nederland",
      opmerkingen: "",
    })
    setError(null)
    setSuccess(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    // Basic validation
    if (!formData.naam.trim()) {
      setError("Leveranciernaam is verplicht")
      return
    }

    if (formData.email && !isValidEmail(formData.email)) {
      setError("Voer een geldig e-mailadres in")
      return
    }

    setIsSubmitting(true)

    try {
      const result = await createSupplier({
        client_id: clientId,
        ...formData,
      })

      if (result.success) {
        setSuccess(result.message || "Leverancier succesvol toegevoegd")
        onSupplierAdded(result.supplier)

        // Close dialog after a short delay to show success message
        setTimeout(() => {
          onOpenChange(false)
          resetForm()
        }, 1500)
      } else {
        setError(result.error || "Er is een fout opgetreden")
      }
    } catch (error) {
      console.error("Error creating supplier:", error)
      setError("Er is een onverwachte fout opgetreden")
    } finally {
      setIsSubmitting(false)
    }
  }

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleClose = () => {
    if (!isSubmitting) {
      onOpenChange(false)
      resetForm()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto rounded-3xl border-2 border-gray-200/50 bg-white/95 backdrop-blur-xl shadow-2xl">
        <DialogHeader className="pb-6 border-b border-gray-200/50">
          <DialogTitle className="flex items-center gap-4 text-2xl text-gray-900">
            <div className="p-3 rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent font-bold">
                Nieuwe Leverancier Toevoegen
              </span>
              <p className="text-sm font-normal text-gray-500 mt-1">
                Voor klant: <span className="font-semibold text-blue-600">{clientName}</span>
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        {error && (
          <Alert className="border-red-200/50 bg-red-50/80 backdrop-blur-sm rounded-2xl">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800 font-medium">{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-green-200/50 bg-green-50/80 backdrop-blur-sm rounded-2xl">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800 font-medium">{success}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-gray-200/30">
              <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                <Building2 className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Basisgegevens</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <Label htmlFor="naam" className="text-sm font-semibold text-gray-700 mb-3 block">
                  Leveranciernaam <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="naam"
                  value={formData.naam}
                  onChange={(e) => handleInputChange("naam", e.target.value)}
                  placeholder="Bijv. ABC Leverancier B.V."
                  className="h-12 border-2 border-gray-200/50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl bg-white/50 backdrop-blur-sm hover:bg-white/80 transition-all duration-300"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <Label htmlFor="contactpersoon" className="text-sm font-semibold text-gray-700 mb-3 block">
                  Contactpersoon
                </Label>
                <Input
                  id="contactpersoon"
                  value={formData.contactpersoon}
                  onChange={(e) => handleInputChange("contactpersoon", e.target.value)}
                  placeholder="Bijv. Jan Jansen"
                  className="h-12 border-2 border-gray-200/50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl bg-white/50 backdrop-blur-sm hover:bg-white/80 transition-all duration-300"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <Label htmlFor="email" className="text-sm font-semibold text-gray-700 mb-3 block">
                  E-mailadres
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="info@leverancier.nl"
                  className="h-12 border-2 border-gray-200/50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl bg-white/50 backdrop-blur-sm hover:bg-white/80 transition-all duration-300"
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Adresgegevens</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="adres" className="text-sm font-medium text-gray-700">
                  Adres
                </Label>
                <Input
                  id="adres"
                  value={formData.adres}
                  onChange={(e) => handleInputChange("adres", e.target.value)}
                  placeholder="Straatnaam 123"
                  className="mt-1"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <Label htmlFor="postcode" className="text-sm font-medium text-gray-700">
                  Postcode
                </Label>
                <Input
                  id="postcode"
                  value={formData.postcode}
                  onChange={(e) => handleInputChange("postcode", e.target.value)}
                  placeholder="1234 AB"
                  className="mt-1"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <Label htmlFor="stad" className="text-sm font-medium text-gray-700">
                  Stad
                </Label>
                <Input
                  id="stad"
                  value={formData.stad}
                  onChange={(e) => handleInputChange("stad", e.target.value)}
                  placeholder="Amsterdam"
                  className="mt-1"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <Label htmlFor="land" className="text-sm font-medium text-gray-700">
                  Land
                </Label>
                <Input
                  id="land"
                  value={formData.land}
                  onChange={(e) => handleInputChange("land", e.target.value)}
                  className="mt-1"
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>

          {/* Comments */}
          <div className="space-y-2">
            <Label htmlFor="opmerkingen" className="text-sm font-medium text-gray-700">
              Opmerkingen
            </Label>
            <Textarea
              id="opmerkingen"
              value={formData.opmerkingen}
              onChange={(e) => handleInputChange("opmerkingen", e.target.value)}
              placeholder="Eventuele opmerkingen over deze leverancier..."
              rows={3}
              className="mt-1"
              disabled={isSubmitting}
            />
          </div>
        </form>

        <DialogFooter className="pt-8 border-t border-gray-200/50">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
            className="h-12 px-8 border-2 border-gray-200/50 hover:border-gray-300 hover:bg-gray-50 rounded-xl font-semibold transition-all duration-300 bg-transparent"
          >
            Annuleren
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={isSubmitting || !formData.naam.trim()}
            className="h-12 px-8 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
                Bezig met opslaan...
              </>
            ) : (
              <>
                <Building2 className="h-5 w-5 mr-3" />
                Leverancier Toevoegen
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
