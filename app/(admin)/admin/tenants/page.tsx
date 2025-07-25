"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Plus, MoreHorizontal, Pencil, Trash2, Loader2, Eye, Building2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"
import { updateTenant, deleteTenant } from "./actions"
import Link from "next/link"
import type { Tenant } from "@/types/tenant"

const countries = [
  { value: "NL", label: "Nederland" },
  { value: "BE", label: "België" },
  { value: "DE", label: "Duitsland" },
  { value: "FR", label: "Frankrijk" },
  { value: "GB", label: "Verenigd Koninkrijk" },
]

export default function TenantsPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [tenants, setTenants] = useState<Tenant[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  // Dialog states
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null)

  // Edit form state
  const [editForm, setEditForm] = useState({
    name: "",
    type: "FC" as "FC" | "WS",
    email: "",
    phone: "",
    kvk_number: "",
    vat_number: "",
    return_company: "",
    return_street: "",
    return_house_number: "",
    return_postal_code: "",
    return_city: "",
    return_country: "NL",
    logo_url: "",
    use_company_as_return: false,
  })

  const [errors, setErrors] = useState<{ [key: string]: string }>({})

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

        fetchTenants()
      } catch (error) {
        console.error("Auth check error:", error)
        router.push("/login")
      }
    }

    checkAuth()
  }, [router])

  const fetchTenants = async () => {
    try {
      setLoading(true)

      const { data: tenantsData, error } = await supabase
        .from("tenants")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) throw error

      setTenants(tenantsData || [])
    } catch (error) {
      console.error("Error fetching tenants:", error)
      toast({
        title: "Fout",
        description: "Kon tenants niet laden",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("nl-NL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getTypeLabel = (type: string) => {
    return type === "FC" ? "Fulfillment Center" : "Webshop"
  }

  const getTypeBadgeVariant = (type: string) => {
    return type === "FC" ? "default" : "secondary"
  }

  const openDetailsDialog = (tenant: Tenant) => {
    setSelectedTenant(tenant)
    setDetailsOpen(true)
  }

  const openEditDialog = (tenant: Tenant) => {
    setSelectedTenant(tenant)
    setEditForm({
      name: tenant.name,
      type: tenant.type,
      email: tenant.email || "",
      phone: tenant.phone || "",
      kvk_number: tenant.kvk_number || "",
      vat_number: tenant.vat_number || "",
      return_company: tenant.return_company || "",
      return_street: tenant.return_street || "",
      return_house_number: tenant.return_house_number || "",
      return_postal_code: tenant.return_postal_code || "",
      return_city: tenant.return_city || "",
      return_country: tenant.return_country || "NL",
      logo_url: tenant.logo_url || "",
      use_company_as_return: false,
    })
    setErrors({})
    setEditOpen(true)
  }

  const openDeleteDialog = (tenant: Tenant) => {
    setSelectedTenant(tenant)
    setDeleteOpen(true)
  }

  const validateEditForm = () => {
    const newErrors: { [key: string]: string } = {}

    if (!editForm.name.trim()) newErrors.name = "Bedrijfsnaam is verplicht"
    if (!editForm.email.trim()) newErrors.email = "E-mail is verplicht"
    else if (!/\S+@\S+\.\S+/.test(editForm.email)) newErrors.email = "Ongeldig e-mailadres"
    if (!editForm.phone.trim()) newErrors.phone = "Telefoonnummer is verplicht"
    if (!editForm.kvk_number.trim()) newErrors.kvk_number = "KvK-nummer is verplicht"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleEditSubmit = async () => {
    if (!validateEditForm() || !selectedTenant) return

    setActionLoading(true)
    try {
      const result = await updateTenant(selectedTenant.id, {
        name: editForm.name,
        type: editForm.type,
        email: editForm.email,
        phone: editForm.phone,
        kvk_number: editForm.kvk_number,
        vat_number: editForm.vat_number || undefined,
        return_company: editForm.return_company || undefined,
        return_street: editForm.return_street || undefined,
        return_house_number: editForm.return_house_number || undefined,
        return_postal_code: editForm.return_postal_code || undefined,
        return_city: editForm.return_city || undefined,
        return_country: editForm.return_country || undefined,
        logo_url: editForm.logo_url || undefined,
      })

      if (result.success) {
        toast({
          title: "Succes",
          description: result.message,
        })
        setEditOpen(false)
        fetchTenants()
      } else {
        toast({
          title: "Fout",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Fout",
        description: "Er is een onverwachte fout opgetreden",
        variant: "destructive",
      })
    } finally {
      setActionLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedTenant) return

    setActionLoading(true)
    try {
      const result = await deleteTenant(selectedTenant.id)

      if (result.success) {
        toast({
          title: "Succes",
          description: result.message,
        })
        setDeleteOpen(false)
        fetchTenants()
      } else {
        toast({
          title: "Fout",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Fout",
        description: "Er is een onverwachte fout opgetreden",
        variant: "destructive",
      })
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex-1 p-4 md:p-6 bg-gray-50 min-h-0 overflow-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#0065FF] mx-auto mb-4" />
            <p className="text-gray-600">Tenants laden...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 p-4 md:p-6 bg-gray-50 min-h-0 overflow-auto">
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-2" style={{ fontFamily: "Poppins" }}>
              Tenants
            </h1>
            <p className="text-sm md:text-base text-gray-600">Beheer alle tenants en hun configuraties.</p>
          </div>
          <Button
            asChild
            className="rounded-2xl bg-[#0065FF] hover:bg-[#0052CC] shadow-lg shadow-blue-500/25 w-full sm:w-auto"
          >
            <Link href="/admin/tenants/new">
              <Plus className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Nieuwe tenant</span>
              <span className="sm:hidden">Nieuwe tenant</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Empty State */}
      {tenants.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-12">
          <div className="text-center">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Nog geen tenants</h3>
            <p className="text-gray-600 mb-6">Begin met het toevoegen van je eerste tenant om te starten.</p>
            <Button asChild className="rounded-2xl bg-[#0065FF] hover:bg-[#0052CC] shadow-lg shadow-blue-500/25">
              <Link href="/admin/tenants/new">
                <Plus className="w-4 h-4 mr-2" />
                Eerste tenant toevoegen
              </Link>
            </Button>
          </div>
        </div>
      ) : (
        <>
          {/* Mobile Cards View */}
          <div className="block md:hidden">
            <div className="space-y-4">
              {tenants.map((tenant) => (
                <div key={tenant.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#0065FF] rounded-xl flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{tenant.name}</h3>
                        <Badge variant={getTypeBadgeVariant(tenant.type)} className="text-xs">
                          {getTypeLabel(tenant.type)}
                        </Badge>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0 rounded-xl">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-2xl border-gray-200">
                        <DropdownMenuItem
                          onClick={() => openDetailsDialog(tenant)}
                          className="rounded-xl cursor-pointer"
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openEditDialog(tenant)} className="rounded-xl cursor-pointer">
                          <Pencil className="mr-2 h-4 w-4" />
                          Bewerken
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => openDeleteDialog(tenant)}
                          className="rounded-xl cursor-pointer text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Verwijderen
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    {tenant.email && <p>📧 {tenant.email}</p>}
                    {tenant.phone && <p>📞 {tenant.phone}</p>}
                    {tenant.kvk_number && <p>🏢 KvK: {tenant.kvk_number}</p>}
                    <p className="text-xs text-gray-500">Aangemaakt: {formatDate(tenant.created_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-200">
                  <TableHead className="font-semibold text-gray-900">Naam</TableHead>
                  <TableHead className="font-semibold text-gray-900">Type</TableHead>
                  <TableHead className="font-semibold text-gray-900">E-mail</TableHead>
                  <TableHead className="font-semibold text-gray-900">Telefoon</TableHead>
                  <TableHead className="font-semibold text-gray-900">KvK</TableHead>
                  <TableHead className="font-semibold text-gray-900">Aangemaakt</TableHead>
                  <TableHead className="font-semibold text-gray-900 w-[100px]">Acties</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tenants.map((tenant) => (
                  <TableRow key={tenant.id} className="border-gray-100 hover:bg-gray-50">
                    <TableCell className="font-medium">{tenant.name}</TableCell>
                    <TableCell>
                      <Badge variant={getTypeBadgeVariant(tenant.type)}>{getTypeLabel(tenant.type)}</Badge>
                    </TableCell>
                    <TableCell className="text-gray-600">{tenant.email || "-"}</TableCell>
                    <TableCell className="text-gray-600">{tenant.phone || "-"}</TableCell>
                    <TableCell className="text-gray-600">{tenant.kvk_number || "-"}</TableCell>
                    <TableCell className="text-gray-600">{formatDate(tenant.created_at)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0 rounded-xl">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-2xl border-gray-200">
                          <DropdownMenuItem
                            onClick={() => openDetailsDialog(tenant)}
                            className="rounded-xl cursor-pointer"
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => openEditDialog(tenant)}
                            className="rounded-xl cursor-pointer"
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            Bewerken
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => openDeleteDialog(tenant)}
                            className="rounded-xl cursor-pointer text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Verwijderen
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}

      {/* Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="rounded-2xl border-gray-200 shadow-2xl shadow-blue-500/20 w-[95vw] max-w-2xl mx-auto max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg md:text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Tenant Details
            </DialogTitle>
          </DialogHeader>
          {selectedTenant && (
            <div className="space-y-6 py-4">
              {/* Basic Info */}
              <div className="space-y-4">
                <h3 className="text-base font-semibold text-gray-900">Basis informatie</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Bedrijfsnaam</Label>
                    <p className="text-gray-900 font-medium">{selectedTenant.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Type</Label>
                    <div className="mt-1">
                      <Badge variant={getTypeBadgeVariant(selectedTenant.type)}>
                        {getTypeLabel(selectedTenant.type)}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">E-mail</Label>
                    <p className="text-gray-900">{selectedTenant.email || "-"}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Telefoon</Label>
                    <p className="text-gray-900">{selectedTenant.phone || "-"}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">KvK-nummer</Label>
                    <p className="text-gray-900">{selectedTenant.kvk_number || "-"}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">BTW-nummer</Label>
                    <p className="text-gray-900">{selectedTenant.vat_number || "-"}</p>
                  </div>
                </div>
              </div>

              {/* Return Address */}
              {(selectedTenant.return_company || selectedTenant.return_street || selectedTenant.return_city) && (
                <div className="space-y-4">
                  <h3 className="text-base font-semibold text-gray-900">Retouradres</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <Label className="text-sm font-medium text-gray-700">Bedrijfsnaam</Label>
                      <p className="text-gray-900">{selectedTenant.return_company || "-"}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Straat</Label>
                      <p className="text-gray-900">
                        {selectedTenant.return_street && selectedTenant.return_house_number
                          ? `${selectedTenant.return_street} ${selectedTenant.return_house_number}`
                          : "-"}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Postcode & Stad</Label>
                      <p className="text-gray-900">
                        {selectedTenant.return_postal_code && selectedTenant.return_city
                          ? `${selectedTenant.return_postal_code} ${selectedTenant.return_city}`
                          : "-"}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Land</Label>
                      <p className="text-gray-900">
                        {countries.find((c) => c.value === selectedTenant.return_country)?.label || "-"}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Logo */}
              {selectedTenant.logo_url && (
                <div className="space-y-4">
                  <h3 className="text-base font-semibold text-gray-900">Logo</h3>
                  <div className="w-32 h-32 border border-gray-200 rounded-2xl flex items-center justify-center bg-gray-50">
                    <img
                      src={selectedTenant.logo_url || "/placeholder.svg"}
                      alt="Tenant logo"
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

              {/* Meta Info */}
              <div className="space-y-4">
                <h3 className="text-base font-semibold text-gray-900">Systeem informatie</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Tenant ID</Label>
                    <p className="text-gray-900 font-mono text-sm">{selectedTenant.id}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Aangemaakt op</Label>
                    <p className="text-gray-900">{formatDate(selectedTenant.created_at)}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDetailsOpen(false)}
              className="rounded-2xl w-full"
            >
              Sluiten
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="rounded-2xl border-gray-200 shadow-2xl shadow-blue-500/20 w-[95vw] max-w-2xl mx-auto max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg md:text-xl font-semibold text-gray-900">Tenant bewerken</DialogTitle>
            <DialogDescription className="text-sm md:text-base text-gray-600">
              Wijzig de gegevens van de tenant. Domein-gerelateerde instellingen kunnen niet gewijzigd worden.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-gray-900">Basis informatie</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_name">Bedrijfsnaam *</Label>
                  <Input
                    id="edit_name"
                    value={editForm.name}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
                    className={`rounded-2xl ${errors.name ? "border-red-500" : ""}`}
                    placeholder="Bijv. Packway B.V."
                  />
                  {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit_type">Type *</Label>
                  <Select
                    value={editForm.type}
                    onValueChange={(value: "FC" | "WS") => setEditForm((prev) => ({ ...prev, type: value }))}
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
                  <Label htmlFor="edit_email">E-mail *</Label>
                  <Input
                    id="edit_email"
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, email: e.target.value }))}
                    className={`rounded-2xl ${errors.email ? "border-red-500" : ""}`}
                    placeholder="info@bedrijf.nl"
                  />
                  {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit_phone">Telefoonnummer *</Label>
                  <Input
                    id="edit_phone"
                    value={editForm.phone}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, phone: e.target.value }))}
                    className={`rounded-2xl ${errors.phone ? "border-red-500" : ""}`}
                    placeholder="+31 20 123 4567"
                  />
                  {errors.phone && <p className="text-sm text-red-600">{errors.phone}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit_kvk_number">KvK-nummer *</Label>
                  <Input
                    id="edit_kvk_number"
                    value={editForm.kvk_number}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, kvk_number: e.target.value }))}
                    className={`rounded-2xl ${errors.kvk_number ? "border-red-500" : ""}`}
                    placeholder="12345678"
                  />
                  {errors.kvk_number && <p className="text-sm text-red-600">{errors.kvk_number}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit_vat_number">BTW-nummer</Label>
                  <Input
                    id="edit_vat_number"
                    value={editForm.vat_number}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, vat_number: e.target.value }))}
                    className="rounded-2xl"
                    placeholder="NL123456789B01"
                  />
                </div>
              </div>
            </div>

            {/* Return Address */}
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-gray-900">Retouradres</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="edit_return_company">Bedrijfsnaam</Label>
                  <Input
                    id="edit_return_company"
                    value={editForm.return_company}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, return_company: e.target.value }))}
                    className="rounded-2xl"
                    placeholder="Retour bedrijfsnaam"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit_return_street">Straat</Label>
                  <Input
                    id="edit_return_street"
                    value={editForm.return_street}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, return_street: e.target.value }))}
                    className="rounded-2xl"
                    placeholder="Retourstraat"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit_return_house_number">Huisnummer</Label>
                  <Input
                    id="edit_return_house_number"
                    value={editForm.return_house_number}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, return_house_number: e.target.value }))}
                    className="rounded-2xl"
                    placeholder="456"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit_return_postal_code">Postcode</Label>
                  <Input
                    id="edit_return_postal_code"
                    value={editForm.return_postal_code}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, return_postal_code: e.target.value }))}
                    className="rounded-2xl"
                    placeholder="5678 CD"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit_return_city">Stad</Label>
                  <Input
                    id="edit_return_city"
                    value={editForm.return_city}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, return_city: e.target.value }))}
                    className="rounded-2xl"
                    placeholder="Rotterdam"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit_return_country">Land</Label>
                  <Select
                    value={editForm.return_country}
                    onValueChange={(value) => setEditForm((prev) => ({ ...prev, return_country: value }))}
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

            {/* Logo */}
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-gray-900">Logo</h3>
              <div className="space-y-2">
                <Label htmlFor="edit_logo_url">Logo URL</Label>
                <Input
                  id="edit_logo_url"
                  value={editForm.logo_url}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, logo_url: e.target.value }))}
                  className="rounded-2xl"
                  placeholder="https://example.com/logo.png"
                />
              </div>

              {editForm.logo_url && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Logo preview:</p>
                  <div className="w-32 h-32 border border-gray-200 rounded-2xl flex items-center justify-center bg-gray-50">
                    <img
                      src={editForm.logo_url || "/placeholder.svg"}
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
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditOpen(false)}
              className="rounded-2xl w-full sm:w-auto"
            >
              Annuleren
            </Button>
            <Button
              onClick={handleEditSubmit}
              disabled={actionLoading}
              className="rounded-2xl bg-[#0065FF] hover:bg-[#0052CC] shadow-lg shadow-blue-500/25 w-full sm:w-auto"
            >
              {actionLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Bezig...
                </>
              ) : (
                "Opslaan"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="rounded-2xl border-gray-200 shadow-2xl shadow-red-500/20 w-[95vw] max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle className="text-lg md:text-xl font-semibold text-gray-900">Tenant verwijderen</DialogTitle>
            <DialogDescription className="text-sm md:text-base text-gray-600">
              Weet je zeker dat je <strong>{selectedTenant?.name}</strong> wilt verwijderen? Deze actie kan niet
              ongedaan worden gemaakt en verwijdert ook alle gerelateerde gegevens.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteOpen(false)}
              className="rounded-2xl w-full sm:w-auto"
            >
              Annuleren
            </Button>
            <Button
              onClick={handleDelete}
              disabled={actionLoading}
              className="rounded-2xl bg-[#FF4757] hover:bg-[#FF3742] text-white shadow-lg shadow-red-500/25 w-full sm:w-auto"
            >
              {actionLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Bezig...
                </>
              ) : (
                "Verwijderen"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
