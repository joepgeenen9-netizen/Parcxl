"use client"

import type React from "react"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Package, Save, X, Info, ImageIcon, Ruler } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { updateProduct } from "./actions"
import type { ProductDetail } from "../actions"

interface EditProductPageClientProps {
  product: ProductDetail
}

export function EditProductPageClient({ product }: EditProductPageClientProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    name: product.name || "",
    sku: product.sku || "",
    article_number: product.article_number || "",
    barcode: product.barcode || "",
    description: product.description || "",
    image_url: product.image_url || "",
    weight_grams: product.weight_grams || "",
    dimensions_cm: formatDimensionsForInput(product.dimensions_cm),
  })

  // Helper function to format dimensions for input
  function formatDimensionsForInput(dimensions: any): string {
    if (!dimensions) return ""
    if (typeof dimensions === "string") {
      try {
        dimensions = JSON.parse(dimensions)
      } catch {
        return dimensions
      }
    }
    if (dimensions.length && dimensions.width && dimensions.height) {
      return `${dimensions.length} x ${dimensions.width} x ${dimensions.height}`
    }
    return ""
  }

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
    setError(null)
    setSuccess(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    // Basic validation
    if (!formData.name.trim()) {
      setError("Productnaam is verplicht")
      return
    }
    if (!formData.sku.trim()) {
      setError("SKU is verplicht")
      return
    }

    startTransition(async () => {
      try {
        const result = await updateProduct(product.tenant_id, product.id, {
          name: formData.name.trim(),
          sku: formData.sku.trim(),
          article_number: formData.article_number.trim() || undefined,
          barcode: formData.barcode.trim() || undefined,
          description: formData.description.trim() || undefined,
          image_url: formData.image_url.trim() || undefined,
          weight_grams: formData.weight_grams ? Number(formData.weight_grams) : undefined,
          dimensions_cm: formData.dimensions_cm.trim() || undefined,
        })

        if (result.success) {
          setSuccess(true)
          // Redirect back to product detail page after a short delay
          setTimeout(() => {
            router.push(`/dashboard/fc/producten/${product.id}`)
          }, 1500)
        } else {
          setError(result.error || "Er is een fout opgetreden")
        }
      } catch (error) {
        console.error("Error updating product:", error)
        setError("Er is een onverwachte fout opgetreden")
      }
    })
  }

  const handleCancel = () => {
    router.push(`/dashboard/fc/producten/${product.id}`)
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Dynamic Multi-Toned Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-slate-100"></div>
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-50/40 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute top-1/4 right-0 w-80 h-80 bg-gradient-to-bl from-purple-50/30 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-gradient-to-tr from-emerald-50/25 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-gradient-to-tl from-orange-50/20 to-transparent rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-12">
          <Button
            variant="ghost"
            onClick={handleCancel}
            disabled={isPending}
            className="group mb-6 text-slate-600 hover:text-[#0065FF] hover:bg-white/60 backdrop-blur-sm font-medium transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
          >
            <ArrowLeft className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:-translate-x-1" />
            Terug naar product
          </Button>

          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0065FF] to-[#0052CC] flex items-center justify-center shadow-xl shadow-blue-500/25 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/40 hover:scale-105">
                <Package className="w-8 h-8 text-white" />
              </div>
              <div className="absolute -inset-1 bg-gradient-to-br from-[#0065FF]/20 to-[#0052CC]/20 rounded-2xl blur opacity-75"></div>
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 bg-clip-text text-transparent">
                Product aanpassen
              </h1>
              <p className="text-xl text-slate-600 mt-2 font-medium">{product.name}</p>
              <p className="text-slate-500 mt-1">Bewerk de productinformatie en sla de wijzigingen op</p>
            </div>
          </div>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="mb-8">
            <Alert className="border-red-200/50 bg-red-50/80 backdrop-blur-sm shadow-lg">
              <AlertDescription className="text-red-800 font-medium">{error}</AlertDescription>
            </Alert>
          </div>
        )}

        {success && (
          <div className="mb-8">
            <Alert className="border-green-200/50 bg-green-50/80 backdrop-blur-sm shadow-lg">
              <AlertDescription className="text-green-800 font-medium">
                Product succesvol bijgewerkt! Je wordt doorgestuurd naar de productpagina...
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Edit Form - Full Width Vertical Stacked Layout */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Group 1: General Information */}
          <Card className="group relative overflow-hidden border-0 shadow-xl bg-white/80 backdrop-blur-sm transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 hover:bg-white/90">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5"></div>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
            <CardHeader className="relative bg-gradient-to-r from-blue-50/50 to-indigo-50/30 border-b border-blue-100/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg">
                  <Info className="w-5 h-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl text-slate-900 font-bold">Algemene informatie</CardTitle>
                  <CardDescription className="text-slate-600">Basisgegevens van het product</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="name" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    Productnaam *<span className="text-blue-500">●</span>
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Voer de productnaam in"
                    disabled={isPending}
                    className="bg-white/80 border-slate-200/50 focus:border-blue-400 focus:ring-blue-400/20 focus:ring-4 transition-all duration-300 hover:bg-white hover:shadow-md"
                    required
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="sku" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    SKU *<span className="text-blue-500">●</span>
                  </Label>
                  <Input
                    id="sku"
                    value={formData.sku}
                    onChange={(e) => handleInputChange("sku", e.target.value)}
                    placeholder="Voer de SKU in"
                    disabled={isPending}
                    className="bg-white/80 border-slate-200/50 focus:border-blue-400 focus:ring-blue-400/20 focus:ring-4 transition-all duration-300 hover:bg-white hover:shadow-md font-mono"
                    required
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="article_number" className="text-sm font-semibold text-slate-700">
                    Artikelnummer
                  </Label>
                  <Input
                    id="article_number"
                    value={formData.article_number}
                    onChange={(e) => handleInputChange("article_number", e.target.value)}
                    placeholder="Voer het artikelnummer in"
                    disabled={isPending}
                    className="bg-white/80 border-slate-200/50 focus:border-blue-400 focus:ring-blue-400/20 focus:ring-4 transition-all duration-300 hover:bg-white hover:shadow-md font-mono"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="barcode" className="text-sm font-semibold text-slate-700">
                    Barcode
                  </Label>
                  <Input
                    id="barcode"
                    value={formData.barcode}
                    onChange={(e) => handleInputChange("barcode", e.target.value)}
                    placeholder="Voer de barcode in"
                    disabled={isPending}
                    className="bg-white/80 border-slate-200/50 focus:border-blue-400 focus:ring-blue-400/20 focus:ring-4 transition-all duration-300 hover:bg-white hover:shadow-md font-mono"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Group 2: Description & Media */}
          <Card className="group relative overflow-hidden border-0 shadow-xl bg-white/80 backdrop-blur-sm transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 hover:bg-white/90">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5"></div>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500"></div>
            <CardHeader className="relative bg-gradient-to-r from-purple-50/50 to-pink-50/30 border-b border-purple-100/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                  <ImageIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl text-slate-900 font-bold">Beschrijving & Media</CardTitle>
                  <CardDescription className="text-slate-600">
                    Productbeschrijving en afbeeldingsinformatie
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative p-6 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-3">
                  <Label htmlFor="description" className="text-sm font-semibold text-slate-700">
                    Productbeschrijving
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    placeholder="Voer een beschrijving van het product in..."
                    disabled={isPending}
                    className="bg-white/80 border-slate-200/50 focus:border-purple-400 focus:ring-purple-400/20 focus:ring-4 transition-all duration-300 hover:bg-white hover:shadow-md min-h-[140px] resize-none"
                    rows={6}
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="image_url" className="text-sm font-semibold text-slate-700">
                    Afbeelding URL
                  </Label>
                  <Input
                    id="image_url"
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => handleInputChange("image_url", e.target.value)}
                    placeholder="https://example.com/product-image.jpg"
                    disabled={isPending}
                    className="bg-white/80 border-slate-200/50 focus:border-purple-400 focus:ring-purple-400/20 focus:ring-4 transition-all duration-300 hover:bg-white hover:shadow-md"
                  />
                  <p className="text-xs text-slate-500 mt-2">Voer een geldige URL in naar de productafbeelding</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Group 3: Physical Properties */}
          <Card className="group relative overflow-hidden border-0 shadow-xl bg-white/80 backdrop-blur-sm transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 hover:bg-white/90">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5"></div>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
            <CardHeader className="relative bg-gradient-to-r from-emerald-50/50 to-teal-50/30 border-b border-emerald-100/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg">
                  <Ruler className="w-5 h-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl text-slate-900 font-bold">Fysieke eigenschappen</CardTitle>
                  <CardDescription className="text-slate-600">
                    Gewicht, afmetingen en andere fysieke kenmerken
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="weight_grams" className="text-sm font-semibold text-slate-700">
                    Gewicht (gram)
                  </Label>
                  <Input
                    id="weight_grams"
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.weight_grams}
                    onChange={(e) => handleInputChange("weight_grams", e.target.value)}
                    placeholder="0"
                    disabled={isPending}
                    className="bg-white/80 border-slate-200/50 focus:border-emerald-400 focus:ring-emerald-400/20 focus:ring-4 transition-all duration-300 hover:bg-white hover:shadow-md"
                  />
                </div>

                <div className="lg:col-span-2 space-y-3">
                  <Label htmlFor="dimensions_cm" className="text-sm font-semibold text-slate-700">
                    Afmetingen (L x B x H in cm)
                  </Label>
                  <Input
                    id="dimensions_cm"
                    value={formData.dimensions_cm}
                    onChange={(e) => handleInputChange("dimensions_cm", e.target.value)}
                    placeholder="bijv. 10 x 5 x 3"
                    disabled={isPending}
                    className="bg-white/80 border-slate-200/50 focus:border-emerald-400 focus:ring-emerald-400/20 focus:ring-4 transition-all duration-300 hover:bg-white hover:shadow-md"
                  />
                  <p className="text-xs text-slate-500 mt-2">Formaat: lengte x breedte x hoogte (bijv. 10 x 5 x 3)</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-8 justify-center">
            <Button
              type="submit"
              disabled={isPending}
              className="flex-1 sm:flex-none bg-gradient-to-r from-[#0065FF] to-[#0052CC] hover:from-[#0052CC] hover:to-[#0065FF] text-white font-semibold py-3 px-8 rounded-xl shadow-xl shadow-blue-500/25 hover:shadow-2xl hover:shadow-blue-500/40 transition-all duration-300 hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              <Save className="w-5 h-5 mr-2" />
              {isPending ? "Opslaan..." : "Wijzigingen opslaan"}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isPending}
              className="flex-1 sm:flex-none bg-white/80 backdrop-blur-sm border-slate-200/50 text-slate-700 font-semibold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl hover:bg-white hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              <X className="w-5 h-5 mr-2" />
              Annuleren
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
