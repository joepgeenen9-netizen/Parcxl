"use client"

import * as React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import { Loader2, Building2, MapPin, UserPlus, Users, Shield, Save, Trash2, Edit, Plus } from "lucide-react"

import { useToast } from "@/hooks/use-toast"
import { useTenant } from "@/contexts/tenant-context"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"

import {
  getTenantSettings,
  updateTenantSettings,
  getTenantUsers,
  createTenantUser,
  updateTenantUser,
  deleteTenantUser,
  getTenantRoles,
  createRole,
  updateRole,
  deleteRole,
  getRolePermissions,
} from "./actions"

import type { TenantRole, RolePermission, TenantUserWithRole } from "@/types/roles"

import FCLayout from "../_components/fc-layout"

/* -------------------------------------------------------------------------------------------------
 * Local Types
 * -------------------------------------------------------------------------------------------------*/

interface TenantUser {
  id: string
  tenant_id: string
  username: string
  email: string
  is_admin: boolean
}

/* -------------------------------------------------------------------------------------------------
 * General Settings Tab
 * -------------------------------------------------------------------------------------------------*/

function GeneralSettingsTab({ tenantId }: { tenantId: string }) {
  const { toast } = useToast()

  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    return_company: "",
    return_street: "",
    return_house_number: "",
    return_postal_code: "",
    return_city: "",
    return_country: "Nederland",
    logo_url: "",
  })

  // Fetch existing settings
  useEffect(() => {
    async function load() {
      try {
        const res = await getTenantSettings(tenantId)

        if (!res.success || !res.data) {
          toast({
            title: "Fout",
            description: res.message ?? "Kon instellingen niet laden",
            variant: "destructive",
          })
          return
        }

        const data = res.data
        setFormData({
          name: data.name ?? "",
          email: data.email ?? "",
          phone: data.phone ?? "",
          return_company: data.return_company ?? "",
          return_street: data.return_street ?? "",
          return_house_number: data.return_house_number ?? "",
          return_postal_code: data.return_postal_code ?? "",
          return_city: data.return_city ?? "",
          return_country: data.return_country ?? "Nederland",
          logo_url: data.logo_url ?? "",
        })
      } catch (err) {
        toast({
          title: "Fout",
          description: "Er ging iets mis bij het ophalen van de instellingen.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    load()
  }, [tenantId, toast])

  /* ----------------------------- Form submit ----------------------------- */

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSaving(true)

    try {
      const res = await updateTenantSettings(tenantId, formData)
      if (res.success) {
        toast({ title: "Opgeslagen", description: res.message ?? "Instellingen zijn opgeslagen." })
      } else {
        toast({ title: "Fout", description: res.message, variant: "destructive" })
      }
    } catch (err) {
      toast({
        title: "Fout",
        description: "Er ging iets mis bij het opslaan.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-[#2069ff]" />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* ------------------------ Bedrijfsgegevens ------------------------- */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Bedrijfsgegevens
          </CardTitle>
          <CardDescription>Algemene contact- en bedrijfsinformatie.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Bedrijfsnaam</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Telefoon</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="logo_url">Logo-URL</Label>
            <Input
              id="logo_url"
              value={formData.logo_url}
              onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      {/* --------------------------- Retouradres --------------------------- */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Retouradres
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="return_company">Bedrijfsnaam</Label>
            <Input
              id="return_company"
              value={formData.return_company}
              onChange={(e) => setFormData({ ...formData, return_company: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="return_street">Straat</Label>
              <Input
                id="return_street"
                value={formData.return_street}
                onChange={(e) => setFormData({ ...formData, return_street: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="return_house_number">Nr</Label>
              <Input
                id="return_house_number"
                value={formData.return_house_number}
                onChange={(e) => setFormData({ ...formData, return_house_number: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="return_postal_code">Postcode</Label>
              <Input
                id="return_postal_code"
                value={formData.return_postal_code}
                onChange={(e) => setFormData({ ...formData, return_postal_code: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="return_city">Plaats</Label>
              <Input
                id="return_city"
                value={formData.return_city}
                onChange={(e) => setFormData({ ...formData, return_city: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="return_country">Land</Label>
            <Input
              id="return_country"
              value={formData.return_country}
              onChange={(e) => setFormData({ ...formData, return_country: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSaving} className="bg-[#2069ff] hover:bg-[#1557d4]">
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Opslaan...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Opslaan
            </>
          )}
        </Button>
      </div>
    </form>
  )
}

/* -------------------------------------------------------------------------------------------------
 * Users Tab
 * -------------------------------------------------------------------------------------------------*/

function UsersTab({ tenantId }: { tenantId: string }) {
  const { toast } = useToast()
  const [users, setUsers] = useState<TenantUserWithRole[]>([])
  const [roles, setRoles] = useState<TenantRole[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<TenantUserWithRole | null>(null)
  const [loading, setLoading] = useState(true)

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    is_admin: false,
    role_id: "defaultRole",
  })

  /* --------------------------- Data fetch helpers --------------------------- */

  const load = React.useCallback(async () => {
    setLoading(true)
    try {
      const [uRes, rRes] = await Promise.all([getTenantUsers(tenantId), getTenantRoles(tenantId)])

      if (uRes.success) setUsers(uRes.data ?? [])
      if (rRes.success) setRoles(rRes.data ?? [])
    } catch {
      toast({ title: "Fout", description: "Kon gebruikers niet laden", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }, [tenantId, toast])

  useEffect(() => {
    load()
  }, [load])

  /* ----------------------------- Dialog helpers ----------------------------- */

  const resetDialog = () => {
    setEditingUser(null)
    setFormData({ username: "", email: "", password: "", is_admin: false, role_id: "defaultRole" })
  }

  /* -------------------------------- Handlers -------------------------------- */

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    try {
      let res
      if (editingUser) {
        // For editing, only include password if it's provided
        const updateData: any = {
          username: formData.username,
          email: formData.email,
          is_admin: formData.is_admin,
          role_id: formData.role_id || undefined,
        }

        // Only include password if it's not empty
        if (formData.password && formData.password.trim() !== "") {
          updateData.password = formData.password
        }

        res = await updateTenantUser(editingUser.id, updateData)
      } else {
        // For creating, password is required
        if (!formData.password || formData.password.trim() === "") {
          toast({
            title: "Fout",
            description: "Wachtwoord is verplicht voor nieuwe gebruikers",
            variant: "destructive",
          })
          setLoading(false)
          return
        }
        res = await createTenantUser(tenantId, formData)
      }

      if (res.success) {
        toast({ title: "Succes", description: res.message })
        setDialogOpen(false)
        resetDialog()
        load()
      } else {
        toast({ title: "Fout", description: res.message, variant: "destructive" })
      }
    } catch {
      toast({ title: "Fout", description: "Onbekende fout", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Weet je zeker dat je deze gebruiker wilt verwijderen?")) return
    setLoading(true)

    try {
      const res = await deleteTenantUser(id)
      if (res.success) {
        toast({ title: "Verwijderd", description: res.message })
        load()
      } else {
        toast({ title: "Fout", description: res.message, variant: "destructive" })
      }
    } catch {
      toast({ title: "Fout", description: "Onbekende fout", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  /* --------------------------------- Render --------------------------------- */

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-[#2069ff]" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Gebruikers</h3>

        <Dialog
          open={dialogOpen}
          onOpenChange={(o) => {
            if (!o) resetDialog()
            setDialogOpen(o)
          }}
        >
          <DialogTrigger asChild>
            <Button className="bg-[#2069ff] hover:bg-[#1557d4]">
              <UserPlus className="w-4 h-4 mr-2" />
              Gebruiker toevoegen
            </Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingUser ? "Gebruiker bewerken" : "Nieuwe gebruiker"}</DialogTitle>
              <DialogDescription>
                {editingUser
                  ? "Pas de gegevens van de gebruiker aan."
                  : "Voeg een nieuwe gebruiker toe aan het systeem."}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Gebruikersnaam</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">
                  {editingUser ? "Nieuw wachtwoord (laat leeg om ongewijzigd te laten)" : "Wachtwoord"}
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required={!editingUser}
                  placeholder={editingUser ? "Laat leeg om ongewijzigd te laten" : ""}
                />
              </div>

              <div className="space-y-2">
                <Label>Rol</Label>
                <Select value={formData.role_id} onValueChange={(val) => setFormData({ ...formData, role_id: val })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecteer rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="defaultRole">Geen rol</SelectItem>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_admin"
                  checked={formData.is_admin}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_admin: checked })}
                />
                <Label htmlFor="is_admin">Administrator</Label>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Annuleren
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : editingUser ? (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Bijwerken
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Toevoegen
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0 divide-y">
          {users.map((u) => (
            <div key={u.id} className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#2069ff]/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-[#2069ff]" />
                </div>
                <div>
                  <div className="font-medium">{u.username}</div>
                  <div className="text-sm text-muted-foreground">{u.email}</div>
                  <div className="flex gap-1 mt-1">
                    {u.is_admin && <Badge>Admin</Badge>}
                    {u.role_name && <Badge variant="outline">{u.role_name}</Badge>}
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    setEditingUser(u)
                    setFormData({
                      username: u.username,
                      email: u.email,
                      password: "", // Always empty for editing
                      is_admin: u.is_admin,
                      role_id: u.role_id ?? "defaultRole",
                    })
                    setDialogOpen(true)
                  }}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={() => handleDelete(u.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
          {users.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">Nog geen gebruikers toegevoegd</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

/* -------------------------------------------------------------------------------------------------
 * Roles Tab
 * -------------------------------------------------------------------------------------------------*/

function RolesTab({ tenantId }: { tenantId: string }) {
  const { toast } = useToast()
  const [roles, setRoles] = useState<TenantRole[]>([])
  const [permissions, setPermissions] = useState<RolePermission[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<TenantRole | null>(null)
  const [loading, setLoading] = useState(true)

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    permissions: [] as string[],
  })

  /* --------------------------- Data fetch helpers --------------------------- */

  const load = React.useCallback(async () => {
    setLoading(true)
    try {
      const [rRes, pRes] = await Promise.all([getTenantRoles(tenantId), getRolePermissions("")])

      if (rRes.success) setRoles(rRes.data ?? [])
      if (pRes.success) setPermissions(pRes.data ?? [])
    } catch {
      toast({ title: "Fout", description: "Kon rollen niet laden", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }, [tenantId, toast])

  useEffect(() => {
    load()
  }, [load])

  /* -------------------------------- Handlers -------------------------------- */

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    try {
      const res = editingRole ? await updateRole(editingRole.id, formData) : await createRole(tenantId, formData)

      if (res.success) {
        toast({ title: "Succes", description: res.message })
        setDialogOpen(false)
        setEditingRole(null)
        setFormData({ name: "", description: "", permissions: [] })
        load()
      } else {
        toast({ title: "Fout", description: res.message, variant: "destructive" })
      }
    } catch {
      toast({ title: "Fout", description: "Onbekende fout", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Weet je zeker dat je deze rol wilt verwijderen?")) return
    setLoading(true)

    try {
      const res = await deleteRole(id)
      if (res.success) {
        toast({ title: "Verwijderd", description: res.message })
        load()
      } else {
        toast({ title: "Fout", description: res.message, variant: "destructive" })
      }
    } catch {
      toast({ title: "Fout", description: "Onbekende fout", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  /* --------------------------------- Render --------------------------------- */

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-[#2069ff]" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Rollen</h3>

        <Dialog
          open={dialogOpen}
          onOpenChange={(o) => {
            if (!o) {
              setEditingRole(null)
              setFormData({ name: "", description: "", permissions: [] })
            }
            setDialogOpen(o)
          }}
        >
          <DialogTrigger asChild>
            <Button className="bg-[#2069ff] hover:bg-[#1557d4]">
              <Plus className="w-4 h-4 mr-2" />
              Rol toevoegen
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingRole ? "Rol bewerken" : "Nieuwe rol"}</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="role_name">Naam</Label>
                <Input
                  id="role_name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role_description">Beschrijving</Label>
                <Textarea
                  id="role_description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Rechten</Label>
                <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto border rounded-lg p-4">
                  {permissions.map((perm) => {
                    const checked = formData.permissions.includes(perm.id)
                    return (
                      <div key={perm.id} className="flex items-center space-x-2">
                        <Switch
                          id={perm.id}
                          checked={checked}
                          onCheckedChange={() => {
                            setFormData((prev) => ({
                              ...prev,
                              permissions: checked
                                ? prev.permissions.filter((p) => p !== perm.id)
                                : [...prev.permissions, perm.id],
                            }))
                          }}
                        />
                        <Label htmlFor={perm.id} className="text-sm">
                          {perm.permission_name}
                        </Label>
                      </div>
                    )
                  })}
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Annuleren
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      {editingRole ? "Bijwerken" : "Toevoegen"}
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0 divide-y">
          {roles.map((role) => (
            <div key={role.id} className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#2069ff]/10 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-[#2069ff]" />
                </div>
                <div>
                  <div className="font-medium">{role.name}</div>
                  <div className="text-sm text-muted-foreground">{role.description}</div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    setEditingRole(role)
                    setFormData({
                      name: role.name,
                      description: role.description ?? "",
                      permissions: [], // This would need to be loaded from the role's permissions
                    })
                    setDialogOpen(true)
                  }}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={() => handleDelete(role.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
          {roles.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">Nog geen rollen aangemaakt</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

/* -------------------------------------------------------------------------------------------------
 * Page Component
 * -------------------------------------------------------------------------------------------------*/

export default function FCSettings() {
  const router = useRouter()
  const { tenant, isTenantDomain, isLoading: tenantLoading } = useTenant()
  const [user, setUser] = useState<TenantUser | null>(null)
  const [pageLoading, setPageLoading] = useState(true)

  /* ------------------------------ Auth checks ------------------------------ */

  useEffect(() => {
    if (tenantLoading) return

    // Must be on tenant domain
    if (!isTenantDomain || !tenant || tenant.type !== "FC") {
      router.push("/login")
      return
    }

    // Must have tenant user in localStorage
    const stored = localStorage.getItem("tenant-user")
    if (!stored) {
      router.push("/login")
      return
    }

    try {
      const parsed: TenantUser = JSON.parse(stored)
      if (parsed.tenant_id !== tenant.id) {
        router.push("/login")
        return
      }
      setUser(parsed)
      setPageLoading(false)
    } catch {
      router.push("/login")
    }
  }, [tenantLoading, isTenantDomain, tenant, router])

  if (tenantLoading || pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-[#2069ff]" />
      </div>
    )
  }

  if (!tenant || !user) return null

  return (
    <FCLayout user={user} tenant={tenant} searchPlaceholder="Zoek instellingen...">
      <div className="max-w-6xl mx-auto space-y-10">
        <header>
          <h1 className="text-3xl font-bold text-slate-900">Instellingen</h1>
          <p className="text-slate-600">Beheer jouw bedrijfsinstellingen, gebruikers en rollen.</p>
        </header>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="general" className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Algemeen
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Gebruikers
            </TabsTrigger>
            <TabsTrigger value="roles" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Rollen
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <GeneralSettingsTab tenantId={tenant.id} />
          </TabsContent>
          <TabsContent value="users">
            <UsersTab tenantId={tenant.id} />
          </TabsContent>
          <TabsContent value="roles">
            <RolesTab tenantId={tenant.id} />
          </TabsContent>
        </Tabs>
      </div>
    </FCLayout>
  )
}
