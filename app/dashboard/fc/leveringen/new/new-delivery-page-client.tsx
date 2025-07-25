"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Plus,
  Trash2,
  Package,
  Building2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Truck,
  Box,
  Container,
  Ship,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AddSupplierDialog } from "@/components/add-supplier-dialog"
import { SearchableProductSelect } from "@/components/searchable-product-select"
import { getSuppliersByClient, getProductsByClient } from "./actions"

interface Client {
  id: string
  company_name: string
}

interface Supplier {
  id: string
  naam: string
  contactpersoon?: string
  email?: string
  telefoon?: string
}

interface Location {
  id: string
  naam: string
}

interface Product {
  id: string
  name: string
  sku: string
  stock?: number
  article_number?: string | null
  barcode?: string | null
}

interface ProductRow {
  id: string
  product_id: string
  product_name: string
  product_sku: string
  verwacht_aantal: number
  opslag_locatie_id: string
}

interface NewDeliveryPageClientProps {
  clients: Client[]
  locations: Location[]
  tenant: any
  user: any
}

export function NewDeliveryPageClient({ clients, locations, tenant, user }: NewDeliveryPageClientProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hoveredSection, setHoveredSection] = useState<string | null>(null)
  const [isPageLoaded, setIsPageLoaded] = useState(false)
  const [showAddSupplierDialog, setShowAddSupplierDialog] = useState(false)

  // Form state
  const [selectedClientId, setSelectedClientId] = useState("")
  const [selectedSupplierId, setSelectedSupplierId] = useState("")
  const [verwachteAankomst, setVerwachteAankomst] = useState("")
  const [externeReferentie, setExterneReferentie] = useState("")
  const [vervoerder, setVervoerder] = useState("")
  const [trackingLink, setTrackingLink] = useState("")
  const [opmerkingen, setOpmerkingen] = useState("")
  const [leveringsMethode, setLeveringsMethode] = useState("")

  // Suppliers state
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loadingSuppliers, setLoadingSuppliers] = useState(false)

  // Product rows
  const [productRows, setProductRows] = useState<ProductRow[]>([
    {
      id: "1",
      product_id: "",
      product_name: "",
      product_sku: "",
      verwacht_aantal: 0,
      opslag_locatie_id: "",
    },
  ])

  // Mock products for selected client
  const [clientProducts, setClientProducts] = useState<Product[]>([])

  useEffect(() => {
    const timer = setTimeout(() => setIsPageLoaded(true), 100)
    return () => clearTimeout(timer)
  }, [])

  // Load suppliers and products when client changes
  useEffect(() => {
    if (selectedClientId) {
      loadSuppliers(selectedClientId)
      loadProducts(selectedClientId)
    } else {
      setSuppliers([])
      setClientProducts([])
      setSelectedSupplierId("")
    }
  }, [selectedClientId])

  const loadSuppliers = async (clientId: string) => {
    setLoadingSuppliers(true)
    try {
      const result = await getSuppliersByClient(clientId)
      if (result.success) {
        setSuppliers(result.suppliers)
      } else {
        console.error("Error loading suppliers:", result.error)
        setSuppliers([])
      }
    } catch (error) {
      console.error("Error loading suppliers:", error)
      setSuppliers([])
    } finally {
      setLoadingSuppliers(false)
    }
  }

  const loadProducts = async (clientId: string) => {
    try {
      const result = await getProductsByClient(clientId)
      if (result.success) {
        setClientProducts(result.products)
      } else {
        console.error("Error loading products:", result.error)
        setClientProducts([])
      }
    } catch (error) {
      console.error("Error loading products:", error)
      setClientProducts([])
    }
  }

  const handleSupplierAdded = (newSupplier: Supplier) => {
    setSuppliers((prev) => [...prev, newSupplier])
    setSelectedSupplierId(newSupplier.id)
  }

  const addProductRow = () => {
    const newRow: ProductRow = {
      id: Date.now().toString(),
      product_id: "",
      product_name: "",
      product_sku: "",
      verwacht_aantal: 0,
      opslag_locatie_id: "",
    }
    setProductRows([...productRows, newRow])
  }

  const removeProductRow = (id: string) => {
    if (productRows.length > 1) {
      setProductRows(productRows.filter((row) => row.id !== id))
    }
  }

  const updateProductRow = (id: string, field: keyof ProductRow, value: string | number) => {
    setProductRows(
      productRows.map((row) => {
        if (row.id === id) {
          const updatedRow = { ...row, [field]: value }

          // Auto-fill when product is selected
          if (field === "product_id" && value) {
            const product = clientProducts.find((p) => p.id === value)
            if (product) {
              updatedRow.product_name = product.name
              updatedRow.product_sku = product.sku
              // Note: We don't have default_location_id in the new structure
              // You might want to set a default location or leave it empty
            }
          }

          return updatedRow
        }
        return row
      }),
    )
  }

  const isValidUrl = (string: string) => {
    try {
      new URL(string)
      return true
    } catch (_) {
      return false
    }
  }

  const isFormValid = () => {
    if (!selectedClientId || !selectedSupplierId || !verwachteAankomst || !leveringsMethode) {
      return false
    }

    if (trackingLink && !isValidUrl(trackingLink)) {
      return false
    }

    const hasValidProductRow = productRows.some((row) => row.product_id && row.verwacht_aantal > 0)
    return hasValidProductRow
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Basic validation
    if (!selectedClientId) {
      setError("Klant is verplicht")
      return
    }

    if (!selectedSupplierId) {
      setError("Leverancier is verplicht")
      return
    }

    if (!verwachteAankomst) {
      setError("Verwachte aankomstdatum is verplicht")
      return
    }

    if (!leveringsMethode) {
      setError("Leveringsmethode is verplicht")
      return
    }

    if (trackingLink && !isValidUrl(trackingLink)) {
      setError("Voer een geldige tracking URL in")
      return
    }

    const validProductRows = productRows.filter((row) => row.product_id && row.verwacht_aantal > 0)
    if (validProductRows.length === 0) {
      setError("Voeg ten minste één productregel toe")
      return
    }

    setIsSubmitting(true)

    try {
      const deliveryData = {
        klant_id: selectedClientId,
        leverancier_id: selectedSupplierId,
        verwachte_aankomst: verwachteAankomst,
        externe_referentie: externeReferentie || null,
        vervoerder: vervoerder || null,
        tracking_link: trackingLink || null,
        opmerkingen: opmerkingen || null,
        leverings_methode: leveringsMethode,
        status: "verwacht",
        aangemaakt_door_id: user.id,
        items: validProductRows.map((row) => ({
          product_id: row.product_id,
          verwacht_aantal: row.verwacht_aantal,
          opslag_locatie_id: row.opslag_locatie_id,
        })),
      }

      const response = await fetch("/api/fc/leveringen", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(deliveryData),
      })

      if (!response.ok) {
        throw new Error("Er is een fout opgetreden bij het opslaan")
      }

      router.push("/dashboard/fc/leveringen")
    } catch (error) {
      console.error("Error creating delivery:", error)
      setError("Er is een onverwachte fout opgetreden. Probeer het opnieuw.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBack = () => {
    router.push("/dashboard/fc/leveringen")
  }

  const selectedClient = clients.find((c) => c.id === selectedClientId)

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
            <span className="font-medium">Terug naar overzicht</span>
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
            Nieuwe Levering Toevoegen
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Welkom bij de levering wizard. Vul de onderstaande gegevens in om een nieuwe inkomende levering toe te
            voegen aan uw systeem.
          </p>
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
          {/* Section 1: General Information */}
          <Card
            className={`group border-2 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-100/50 backdrop-blur-sm bg-white/80 ${
              hoveredSection === "general"
                ? "border-blue-300 shadow-xl shadow-blue-100/50 scale-[1.02] bg-white/90"
                : "border-gray-200/50 hover:border-blue-200/70 shadow-lg"
            } rounded-3xl overflow-hidden ${isPageLoaded ? "animate-in slide-in-from-bottom-4 duration-700 delay-500" : ""}`}
            onMouseEnter={() => setHoveredSection("general")}
            onMouseLeave={() => setHoveredSection(null)}
          >
            <CardHeader className="pb-6 relative overflow-hidden bg-gradient-to-br from-blue-50/50 to-white/50">
              {/* Animated Background Pattern */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-transparent rounded-full -translate-y-16 translate-x-16 transition-all duration-700 group-hover:scale-150 group-hover:rotate-12"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-300/5 to-transparent rounded-full translate-y-12 -translate-x-12 transition-all duration-700 group-hover:scale-125"></div>

              <CardTitle className="flex items-center gap-4 text-2xl text-gray-900 relative z-10">
                <div
                  className={`p-4 rounded-2xl transition-all duration-500 ${
                    hoveredSection === "general"
                      ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg scale-110 rotate-3"
                      : "bg-gradient-to-r from-blue-100 to-blue-50 text-blue-600 hover:from-blue-200 hover:to-blue-100"
                  }`}
                >
                  <Building2 className="h-6 w-6 transition-transform duration-300 group-hover:scale-110" />
                </div>
                <div>
                  <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    Algemene Informatie
                  </span>
                  <p className="text-sm font-normal text-gray-500 mt-1">Basis gegevens van de levering</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 p-6 sm:p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
                {/* Client Selection */}
                <div className="group/input w-full">
                  <Label htmlFor="client" className="text-sm font-semibold text-gray-700 mb-3 block">
                    Klant <span className="text-red-500">*</span>
                  </Label>
                  <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                    <SelectTrigger className="w-full h-14 text-lg border-2 border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 group-hover/input:border-blue-300 rounded-2xl bg-white/50 backdrop-blur-sm hover:bg-white/80 hover:shadow-md outline-none focus:outline-none focus:ring-0 focus-visible:ring-0">
                      <SelectValue placeholder="Selecteer een klant" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-2 border-gray-200 bg-white/95 backdrop-blur-sm">
                      {clients.map((client) => (
                        <SelectItem
                          key={client.id}
                          value={client.id}
                          className="rounded-xl hover:bg-blue-50 transition-colors duration-200"
                        >
                          {client.company_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Supplier Selection */}
                <div className="group/input w-full">
                  <Label htmlFor="supplier" className="text-sm font-semibold text-gray-700 mb-3 block">
                    Leverancier <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={selectedSupplierId}
                    onValueChange={(value) => {
                      if (value === "__add_new__") {
                        setShowAddSupplierDialog(true)
                      } else {
                        setSelectedSupplierId(value)
                      }
                    }}
                    disabled={!selectedClientId || loadingSuppliers}
                  >
                    <SelectTrigger
                      className={`w-full h-14 text-lg border-2 border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 group-hover/input:border-blue-300 rounded-2xl bg-white/50 backdrop-blur-sm hover:bg-white/80 hover:shadow-md outline-none focus:outline-none focus:ring-0 focus-visible:ring-0 ${!selectedClientId || loadingSuppliers ? "opacity-50" : ""}`}
                    >
                      <SelectValue placeholder={loadingSuppliers ? "Laden..." : "Selecteer een leverancier"} />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-2 border-gray-200 bg-white/95 backdrop-blur-sm">
                      {suppliers.map((supplier) => (
                        <SelectItem
                          key={supplier.id}
                          value={supplier.id}
                          className="rounded-xl hover:bg-blue-50 transition-colors duration-200"
                        >
                          <div className="flex flex-col">
                            <span className="font-medium">{supplier.naam}</span>
                            {supplier.contactpersoon && (
                              <span className="text-xs text-gray-500">{supplier.contactpersoon}</span>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                      {selectedClientId && (
                        <div
                          onClick={(e) => {
                            e.preventDefault()
                            setShowAddSupplierDialog(true)
                          }}
                          className="cursor-pointer p-2 rounded-xl hover:bg-green-50 transition-colors duration-200 border-t border-gray-200 mt-1 pt-2 flex items-center text-green-600 font-medium"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Leverancier toevoegen
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* Expected Arrival Date */}
                <div className="group/input w-full">
                  <Label htmlFor="verwachte_aankomst" className="text-sm font-semibold text-gray-700 mb-3 block">
                    Verwachte Aankomstdatum <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="verwachte_aankomst"
                    type="datetime-local"
                    value={verwachteAankomst}
                    onChange={(e) => setVerwachteAankomst(e.target.value)}
                    disabled={!selectedClientId}
                    className={`w-full h-14 text-lg border-2 border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 group-hover/input:border-blue-300 rounded-2xl bg-white/50 backdrop-blur-sm hover:bg-white/80 hover:shadow-md outline-none focus:outline-none focus:ring-0 focus-visible:ring-0 ${!selectedClientId ? "opacity-50" : ""}`}
                  />
                </div>

                {/* External Reference */}
                <div className="group/input w-full">
                  <Label htmlFor="externe_referentie" className="text-sm font-semibold text-gray-700 mb-3 block">
                    Externe Referentie
                  </Label>
                  <Input
                    id="externe_referentie"
                    value={externeReferentie}
                    onChange={(e) => setExterneReferentie(e.target.value)}
                    disabled={!selectedClientId}
                    placeholder="Bijv. PO-12345"
                    className={`w-full h-14 text-lg border-2 border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 group-hover/input:border-blue-300 rounded-2xl bg-white/50 backdrop-blur-sm hover:bg-white/80 hover:shadow-md outline-none focus:outline-none focus:ring-0 focus-visible:ring-0 ${!selectedClientId ? "opacity-50" : ""}`}
                  />
                </div>

                {/* Delivery Method */}
                <div className="group/input w-full lg:col-span-2">
                  <Label className="text-sm font-semibold text-gray-700 mb-4 block">
                    Leveringsmethode <span className="text-red-500">*</span>
                  </Label>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { value: "dozen", label: "Dozen", icon: Box, color: "blue" },
                      { value: "pallets", label: "Pallets", icon: Container, color: "green" },
                      { value: "rolcontainer", label: "Rolcontainer", icon: Truck, color: "orange" },
                      { value: "zeecontainer", label: "Zeecontainer", icon: Ship, color: "purple" },
                    ].map((method) => {
                      const IconComponent = method.icon
                      const isSelected = leveringsMethode === method.value
                      return (
                        <button
                          key={method.value}
                          type="button"
                          onClick={() => setLeveringsMethode(method.value)}
                          disabled={!selectedClientId}
                          className={`group relative p-6 rounded-2xl border-2 transition-all duration-300 hover:scale-105 hover:shadow-lg ${
                            !selectedClientId
                              ? "opacity-50 cursor-not-allowed"
                              : isSelected
                                ? `bg-gradient-to-br from-${method.color}-50 to-${method.color}-100/50 border-${method.color}-300 shadow-lg shadow-${method.color}-200/50`
                                : "bg-white/50 backdrop-blur-sm border-gray-200/50 hover:border-gray-300 hover:bg-white/80"
                          }`}
                        >
                          <div className="flex flex-col items-center space-y-3">
                            <div
                              className={`p-4 rounded-xl transition-all duration-300 ${
                                isSelected
                                  ? `bg-gradient-to-r from-${method.color}-500 to-${method.color}-600 text-white shadow-md`
                                  : `bg-gradient-to-r from-gray-100 to-gray-50 text-gray-600 group-hover:from-${method.color}-100 group-hover:to-${method.color}-50 group-hover:text-${method.color}-600`
                              }`}
                            >
                              <IconComponent className="h-8 w-8" />
                            </div>
                            <span
                              className={`font-semibold text-sm transition-colors duration-300 ${
                                isSelected ? `text-${method.color}-700` : "text-gray-700"
                              }`}
                            >
                              {method.label}
                            </span>
                          </div>
                          {isSelected && (
                            <div
                              className={`absolute -top-2 -right-2 w-6 h-6 bg-${method.color}-500 text-white rounded-full flex items-center justify-center text-xs font-bold animate-pulse`}
                            >
                              ✓
                            </div>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Carrier */}
                <div className="group/input w-full">
                  <Label htmlFor="vervoerder" className="text-sm font-semibold text-gray-700 mb-3 block">
                    Vervoerder
                  </Label>
                  <Input
                    id="vervoerder"
                    value={vervoerder}
                    onChange={(e) => setVervoerder(e.target.value)}
                    disabled={!selectedClientId}
                    placeholder="Bijv. DHL, PostNL"
                    className={`w-full h-14 text-lg border-2 border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 group-hover/input:border-blue-300 rounded-2xl bg-white/50 backdrop-blur-sm hover:bg-white/80 hover:shadow-md outline-none focus:outline-none focus:ring-0 focus-visible:ring-0 ${!selectedClientId ? "opacity-50" : ""}`}
                  />
                </div>

                {/* Tracking Link */}
                <div className="group/input w-full">
                  <Label htmlFor="tracking_link" className="text-sm font-semibold text-gray-700 mb-3 block">
                    Tracking Link
                  </Label>
                  <Input
                    id="tracking_link"
                    type="url"
                    value={trackingLink}
                    onChange={(e) => setTrackingLink(e.target.value)}
                    disabled={!selectedClientId}
                    placeholder="https://..."
                    className={`w-full h-14 text-lg border-2 border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 group-hover/input:border-blue-300 rounded-2xl bg-white/50 backdrop-blur-sm hover:bg-white/80 hover:shadow-md outline-none focus:outline-none focus:ring-0 focus-visible:ring-0 ${!selectedClientId ? "opacity-50" : ""}`}
                  />
                </div>
              </div>

              {/* Comments */}
              <div className="group/input w-full">
                <Label htmlFor="opmerkingen" className="text-sm font-semibold text-gray-700 mb-3 block">
                  Opmerkingen
                </Label>
                <Textarea
                  id="opmerkingen"
                  value={opmerkingen}
                  onChange={(e) => setOpmerkingen(e.target.value)}
                  disabled={!selectedClientId}
                  placeholder="Eventuele opmerkingen over deze levering..."
                  rows={3}
                  className={`w-full border-2 border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 group-hover/input:border-blue-300 rounded-2xl bg-white/50 backdrop-blur-sm hover:bg-white/80 hover:shadow-md outline-none focus:outline-none focus:ring-0 focus-visible:ring-0 ${!selectedClientId ? "opacity-50" : ""}`}
                />
              </div>
            </CardContent>
          </Card>

          {/* Section 2: Product Rows */}
          {selectedClientId && (
            <Card
              className={`group border-2 transition-all duration-500 hover:shadow-2xl hover:shadow-green-100/50 backdrop-blur-sm bg-white/80 ${
                hoveredSection === "products"
                  ? "border-green-300 shadow-xl shadow-green-100/50 scale-[1.02] bg-white/90"
                  : "border-gray-200/50 hover:border-green-200/70 shadow-lg"
              } rounded-3xl overflow-hidden ${isPageLoaded ? "animate-in slide-in-from-bottom-4 duration-700 delay-600" : ""}`}
              onMouseEnter={() => setHoveredSection("products")}
              onMouseLeave={() => setHoveredSection(null)}
            >
              <CardHeader className="pb-6 relative overflow-hidden bg-gradient-to-br from-green-50/50 to-white/50">
                {/* Animated Background Pattern */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-400/10 to-transparent rounded-full -translate-y-16 translate-x-16 transition-all duration-700 group-hover:scale-150 group-hover:-rotate-12"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-green-300/5 to-transparent rounded-full translate-y-12 -translate-x-12 transition-all duration-700 group-hover:scale-125"></div>

                <div className="flex items-center justify-between relative z-10">
                  <CardTitle className="flex items-center gap-4 text-2xl text-gray-900">
                    <div
                      className={`p-4 rounded-2xl transition-all duration-500 ${
                        hoveredSection === "products"
                          ? "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg scale-110 rotate-3"
                          : "bg-gradient-to-r from-green-100 to-green-50 text-green-600 hover:from-green-200 hover:to-green-100"
                      }`}
                    >
                      <Package className="h-6 w-6 transition-transform duration-300 group-hover:scale-110" />
                    </div>
                    <div>
                      <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                        Productregels
                      </span>
                      <p className="text-sm font-normal text-gray-500 mt-1">Producten in deze levering</p>
                    </div>
                  </CardTitle>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addProductRow}
                    className="group bg-white/80 backdrop-blur-sm border border-gray-200/50 text-gray-700 hover:text-green-600 hover:bg-green-50/80 hover:border-green-200/50 transition-all duration-300 rounded-xl px-6 py-3 shadow-sm hover:shadow-md transform hover:scale-105"
                  >
                    <Plus className="h-4 w-4 mr-2 transition-all duration-300 group-hover:scale-110 group-hover:text-green-600" />
                    <span className="font-medium">Productregel Toevoegen</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6 p-6 sm:p-8">
                {productRows.map((row, index) => (
                  <div
                    key={row.id}
                    className="p-6 border-2 border-gray-200/50 rounded-2xl bg-gradient-to-br from-slate-50/50 to-white/50 backdrop-blur-sm space-y-6 hover:border-green-200/70 hover:shadow-md transition-all duration-300"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-semibold text-gray-900">Productregel {index + 1}</h4>
                      {productRows.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeProductRow(row.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all duration-200"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {/* Product Selection */}
                      <div className="group/input w-full">
                        <Label className="text-sm font-semibold text-gray-700 mb-3 block">
                          Product <span className="text-red-500">*</span>
                        </Label>
                        <SearchableProductSelect
                          products={clientProducts}
                          value={row.product_id}
                          onValueChange={(value) => updateProductRow(row.id, "product_id", value)}
                          placeholder="Zoek en selecteer een product..."
                          disabled={!selectedClientId}
                          className="w-full"
                        />
                      </div>

                      {/* Expected Quantity */}
                      <div className="group/input w-full">
                        <Label className="text-sm font-semibold text-gray-700 mb-3 block">
                          Verwacht Aantal <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          type="number"
                          min="1"
                          value={row.verwacht_aantal || ""}
                          onChange={(e) =>
                            updateProductRow(row.id, "verwacht_aantal", Number.parseInt(e.target.value) || 0)
                          }
                          className="w-full h-14 border-2 border-gray-200 focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all duration-300 group-hover/input:border-green-300 rounded-2xl bg-white/50 backdrop-blur-sm hover:bg-white/80 hover:shadow-md outline-none focus:outline-none focus:ring-0 focus-visible:ring-0"
                          placeholder="0"
                        />
                      </div>

                      {/* Storage Location */}
                      <div className="group/input w-full">
                        <Label className="text-sm font-semibold text-gray-700 mb-3 block">
                          Opslaglocatie <span className="text-red-500">*</span>
                        </Label>
                        <Select
                          value={row.opslag_locatie_id}
                          onValueChange={(value) => updateProductRow(row.id, "opslag_locatie_id", value)}
                        >
                          <SelectTrigger className="w-full h-14 border-2 border-gray-200 focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all duration-300 group-hover/input:border-green-300 rounded-2xl bg-white/50 backdrop-blur-sm hover:bg-white/80 hover:shadow-md outline-none focus:outline-none focus:ring-0 focus-visible:ring-0">
                            <SelectValue placeholder="Selecteer locatie" />
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl border-2 border-gray-200 bg-white/95 backdrop-blur-sm">
                            {locations.map((location) => (
                              <SelectItem
                                key={location.id}
                                value={location.id}
                                className="rounded-xl hover:bg-green-50 transition-colors duration-200"
                              >
                                {location.naam}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Enhanced Submit Button */}
          <div
            className={`flex justify-end pt-12 ${isPageLoaded ? "animate-in slide-in-from-bottom-4 duration-700 delay-800" : ""}`}
          >
            <Button
              type="submit"
              disabled={!isFormValid() || isSubmitting}
              className="group relative bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-12 py-6 text-lg font-semibold rounded-2xl transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/25 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed min-w-[220px] overflow-hidden"
            >
              {/* Animated Background Effects */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-blue-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse"></div>
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-blue-600 rounded-2xl opacity-0 group-hover:opacity-30 transition-opacity duration-500 blur-xl"></div>

              {/* Shimmer Effect */}
              <div className="absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-[shimmer_1.5s_ease-in-out] transition-opacity duration-300"></div>

              {/* Button Content */}
              <div className="relative flex items-center justify-center">
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent mr-3"></div>
                    <span>Bezig met opslaan...</span>
                  </>
                ) : (
                  <>
                    <span className="mr-3">Levering Opslaan</span>
                    <ArrowRight className="h-5 w-5 transition-all duration-300 group-hover:translate-x-1 group-hover:scale-110" />
                  </>
                )}
              </div>
            </Button>
          </div>
        </form>
      </div>

      {/* Add Supplier Dialog */}
      {selectedClient && (
        <AddSupplierDialog
          open={showAddSupplierDialog}
          onOpenChange={setShowAddSupplierDialog}
          clientId={selectedClientId}
          clientName={selectedClient.company_name}
          onSupplierAdded={handleSupplierAdded}
        />
      )}

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
