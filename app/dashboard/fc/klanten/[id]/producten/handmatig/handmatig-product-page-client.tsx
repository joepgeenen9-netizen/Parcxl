"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Package,
  Save,
  Barcode,
  Weight,
  Ruler,
  MapPin,
  Hash,
  FileText,
  ImageIcon,
  Package2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import FCLayout from "../../../_components/fc-layout"
import { createProduct, type ProductFormData } from "./actions"
import type { ClientDetailsData } from "@/types/client-details"

interface TenantUser {
  id: string
  tenant_id: string
  username: string
  email: string
  is_admin: boolean
}

interface HandmatigProductPageClientProps {
  tenant: any
  user: TenantUser
  clientDetails: ClientDetailsData
}

export function HandmatigProductPageClient({ tenant, user, clientDetails }: HandmatigProductPageClientProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<ProductFormData>({
    sku: "",
    articleNumber: "",
    name: "",
    description: "",
    imageUrl: "",
    weightGrams: undefined,
    dimensions: {
      length: undefined,
      width: undefined,
      height: undefined,
    },
    barcode: "",
    stock: 0,
    location: "",
  })

  const handleGoBack = () => {
    router.push(`/dashboard/fc/klanten/${clientDetails.client.id}`)
  }

  const handleInputChange = (field: keyof ProductFormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleDimensionChange = (dimension: "length" | "width" | "height", value: string) => {
    const numValue = value === "" ? undefined : Number.parseFloat(value)
    setFormData((prev) => ({
      ...prev,
      dimensions: {
        ...prev.dimensions,
        [dimension]: numValue,
      },
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.sku.trim() || !formData.name.trim()) {
      toast.error("SKU en productnaam zijn verplicht")
      return
    }

    setIsLoading(true)

    try {
      const result = await createProduct(clientDetails.client.id, tenant.id, formData)

      if (result.success) {
        toast.success("Product succesvol toegevoegd!")
        router.push(`/dashboard/fc/klanten/${clientDetails.client.id}`)
      } else {
        toast.error(result.error || "Er is een fout opgetreden")
      }
    } catch (error) {
      console.error("Error creating product:", error)
      toast.error("Er is een onverwachte fout opgetreden")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <FCLayout user={user} tenant={tenant} searchPlaceholder="Zoek producten...">
      <div className="max-w-4xl mx-auto space-y-6 pb-8 md:pb-0">
        {/* Back Button */}
        <div className="flex items-center">
          <Button
            variant="outline"
            size="sm"
            onClick={handleGoBack}
            className="flex items-center gap-2 hover:bg-gray-50 bg-transparent transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
            Terug
          </Button>
        </div>

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Product handmatig toevoegen</h1>
          <p className="text-slate-600 mt-1">
            Voeg een nieuw product toe voor{" "}
            <span className="font-medium text-orange-600">{clientDetails.client.name}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow duration-300">
            <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 border-b border-orange-100">
              <CardTitle className="flex items-center gap-2 text-orange-800">
                <Package2 className="w-5 h-5" />
                Basisinformatie
              </CardTitle>
              <CardDescription className="text-orange-600">Vul de essentiële productgegevens in</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="sku" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <Hash className="w-4 h-4 text-orange-500" />
                    SKU *
                  </Label>
                  <Input
                    id="sku"
                    value={formData.sku}
                    onChange={(e) => handleInputChange("sku", e.target.value)}
                    placeholder="Bijv. PROD-001"
                    className="transition-all duration-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 hover:border-orange-300"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="articleNumber" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-orange-500" />
                    Artikelnummer
                  </Label>
                  <Input
                    id="articleNumber"
                    value={formData.articleNumber}
                    onChange={(e) => handleInputChange("articleNumber", e.target.value)}
                    placeholder="Bijv. ART-001"
                    className="transition-all duration-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 hover:border-orange-300"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <Package className="w-4 h-4 text-orange-500" />
                  Productnaam *
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Bijv. Premium T-shirt"
                  className="transition-all duration-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 hover:border-orange-300"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium text-slate-700">
                  Beschrijving
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Beschrijf het product..."
                  rows={3}
                  className="transition-all duration-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 hover:border-orange-300 resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="imageUrl" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-orange-500" />
                  Afbeelding URL
                </Label>
                <Input
                  id="imageUrl"
                  value={formData.imageUrl}
                  onChange={(e) => handleInputChange("imageUrl", e.target.value)}
                  placeholder="https://example.com/product-image.jpg"
                  className="transition-all duration-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 hover:border-orange-300"
                />
              </div>
            </CardContent>
          </Card>

          {/* Physical Properties */}
          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow duration-300">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
              <CardTitle className="flex items-center gap-2 text-blue-800">
                <Weight className="w-5 h-5" />
                Fysieke eigenschappen
              </CardTitle>
              <CardDescription className="text-blue-600">
                Gewicht, afmetingen en andere fysieke kenmerken
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="weight" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <Weight className="w-4 h-4 text-blue-500" />
                    Gewicht (gram)
                  </Label>
                  <Input
                    id="weight"
                    type="number"
                    value={formData.weightGrams || ""}
                    onChange={(e) =>
                      handleInputChange("weightGrams", e.target.value ? Number.parseInt(e.target.value) : undefined)
                    }
                    placeholder="Bijv. 250"
                    className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="barcode" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <Barcode className="w-4 h-4 text-blue-500" />
                    Barcode
                  </Label>
                  <Input
                    id="barcode"
                    value={formData.barcode}
                    onChange={(e) => handleInputChange("barcode", e.target.value)}
                    placeholder="Bijv. 1234567890123"
                    className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-300"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <Ruler className="w-4 h-4 text-blue-500" />
                  Afmetingen (cm)
                </Label>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="length" className="text-xs text-slate-500">
                      Lengte
                    </Label>
                    <Input
                      id="length"
                      type="number"
                      step="0.1"
                      value={formData.dimensions?.length || ""}
                      onChange={(e) => handleDimensionChange("length", e.target.value)}
                      placeholder="0.0"
                      className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-300"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="width" className="text-xs text-slate-500">
                      Breedte
                    </Label>
                    <Input
                      id="width"
                      type="number"
                      step="0.1"
                      value={formData.dimensions?.width || ""}
                      onChange={(e) => handleDimensionChange("width", e.target.value)}
                      placeholder="0.0"
                      className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-300"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="height" className="text-xs text-slate-500">
                      Hoogte
                    </Label>
                    <Input
                      id="height"
                      type="number"
                      step="0.1"
                      value={formData.dimensions?.height || ""}
                      onChange={(e) => handleDimensionChange("height", e.target.value)}
                      placeholder="0.0"
                      className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-300"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Inventory */}
          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow duration-300">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100">
              <CardTitle className="flex items-center gap-2 text-green-800">
                <MapPin className="w-5 h-5" />
                Voorraad & Locatie
              </CardTitle>
              <CardDescription className="text-green-600">Voorraadinformatie en opslaglocatie</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="stock" className="text-sm font-medium text-slate-700">
                    Voorraad *
                  </Label>
                  <Input
                    id="stock"
                    type="number"
                    value={formData.stock}
                    onChange={(e) => handleInputChange("stock", Number.parseInt(e.target.value) || 0)}
                    placeholder="0"
                    min="0"
                    className="transition-all duration-200 focus:ring-2 focus:ring-green-500 focus:border-green-500 hover:border-green-300"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-green-500" />
                    Locatie
                  </Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange("location", e.target.value)}
                    placeholder="Bijv. Rek A-1-2"
                    className="transition-all duration-200 focus:ring-2 focus:ring-green-500 focus:border-green-500 hover:border-green-300"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 pb-8 md:pb-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleGoBack}
              disabled={isLoading}
              className="hover:bg-gray-50 transition-colors duration-200 bg-transparent"
            >
              Annuleren
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Opslaan...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Product opslaan
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </FCLayout>
  )
}
