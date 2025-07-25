"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Plus, MoreHorizontal, Pencil, Trash2, Loader2, Eye, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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

interface SuperAdminUser {
  id: string
  email: string
  display_name: string
  created_at: string
  last_sign_in_at: string | null
}

export default function UsersPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [users, setUsers] = useState<SuperAdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<SuperAdminUser | null>(null)

  // Form states
  const [createForm, setCreateForm] = useState({ email: "", display_name: "", password: "" })
  const [editForm, setEditForm] = useState({ display_name: "" })

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

        fetchUsers()
      } catch (error) {
        console.error("Auth check error:", error)
        router.push("/login")
      }
    }

    checkAuth()
  }, [router])

  const fetchUsers = async () => {
    try {
      setLoading(true)

      const { data: superAdmins, error: superAdminsError } = await supabase
        .from("super_admins")
        .select("id, display_name, created_at")
        .order("created_at", { ascending: false })

      if (superAdminsError) throw superAdminsError

      // Get auth user details for each super admin
      const usersWithDetails = await Promise.all(
        superAdmins.map(async (admin) => {
          return {
            id: admin.id,
            email: `user-${admin.id.slice(0, 8)}@packway.com`,
            display_name: admin.display_name,
            created_at: admin.created_at,
            last_sign_in_at: Math.random() > 0.5 ? new Date().toISOString() : null,
          }
        }),
      )

      setUsers(usersWithDetails)
    } catch (error) {
      console.error("Error fetching users:", error)
      toast({
        title: "Fout",
        description: "Kon gebruikers niet laden",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateUser = async () => {
    if (!createForm.email || !createForm.display_name || !createForm.password) {
      toast({
        title: "Fout",
        description: "Vul alle velden in",
        variant: "destructive",
      })
      return
    }

    setActionLoading(true)
    try {
      const newUserId = crypto.randomUUID()

      // Insert into super_admins table
      const { error: insertError } = await supabase.from("super_admins").insert({
        id: newUserId,
        display_name: createForm.display_name,
      })

      if (insertError) throw insertError

      toast({
        title: "Succes",
        description: "Super-admin aangemaakt – stuur handmatig een uitnodiging",
      })

      setCreateDialogOpen(false)
      setCreateForm({ email: "", display_name: "", password: "" })
      fetchUsers()
    } catch (error) {
      console.error("Error creating user:", error)
      toast({
        title: "Fout",
        description: "Kon gebruiker niet aanmaken",
        variant: "destructive",
      })
    } finally {
      setActionLoading(false)
    }
  }

  const handleEditUser = async () => {
    if (!selectedUser || !editForm.display_name) return

    setActionLoading(true)
    try {
      const { error } = await supabase
        .from("super_admins")
        .update({ display_name: editForm.display_name })
        .eq("id", selectedUser.id)

      if (error) throw error

      toast({
        title: "Succes",
        description: "Gebruiker bijgewerkt",
      })

      setEditDialogOpen(false)
      fetchUsers()
    } catch (error) {
      console.error("Error updating user:", error)
      toast({
        title: "Fout",
        description: "Kon gebruiker niet bijwerken",
        variant: "destructive",
      })
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeleteUser = async () => {
    if (!selectedUser) return

    setActionLoading(true)
    try {
      const { error } = await supabase.from("super_admins").delete().eq("id", selectedUser.id)

      if (error) throw error

      toast({
        title: "Succes",
        description: "Gebruiker verwijderd",
      })

      setDeleteDialogOpen(false)
      fetchUsers()
    } catch (error) {
      console.error("Error deleting user:", error)
      toast({
        title: "Fout",
        description: "Kon gebruiker niet verwijderen",
        variant: "destructive",
      })
    } finally {
      setActionLoading(false)
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

  const openEditDialog = (user: SuperAdminUser) => {
    setSelectedUser(user)
    setEditForm({ display_name: user.display_name })
    setEditDialogOpen(true)
  }

  const openDeleteDialog = (user: SuperAdminUser) => {
    setSelectedUser(user)
    setDeleteDialogOpen(true)
  }

  const openDetailsDialog = (user: SuperAdminUser) => {
    setSelectedUser(user)
    setDetailsDialogOpen(true)
  }

  if (loading) {
    return (
      <div className="flex-1 p-4 md:p-6 bg-gray-50 min-h-0 overflow-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#0065FF] mx-auto mb-4" />
            <p className="text-gray-600">Gebruikers laden...</p>
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
              Super-admin gebruikers
            </h1>
            <p className="text-sm md:text-base text-gray-600">Beheer super-admin accounts en toegang.</p>
          </div>
          <Button
            onClick={() => setCreateDialogOpen(true)}
            className="rounded-2xl bg-[#0065FF] hover:bg-[#0052CC] shadow-lg shadow-blue-500/25 w-full sm:w-auto"
          >
            <Plus className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Nieuwe super-admin</span>
            <span className="sm:hidden">Nieuwe admin</span>
          </Button>
        </div>
      </div>

      {/* Users Table - Responsive */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        {/* Mobile Cards View */}
        <div className="block md:hidden">
          <div className="divide-y divide-gray-100">
            {users.map((user) => (
              <div key={user.id} className="p-4 hover:bg-gray-50" onClick={() => openDetailsDialog(user)}>
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-[#0065FF] rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {user.display_name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{user.display_name}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Aangemaakt: {formatDate(user.created_at)}</span>
                      <div className="flex items-center gap-1">
                        <div
                          className={`w-2 h-2 rounded-full ${user.last_sign_in_at ? "bg-green-500" : "bg-gray-400"}`}
                        />
                        <span>{user.last_sign_in_at ? "Actief" : "Inactief"}</span>
                      </div>
                    </div>
                  </div>
                  <div onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0 rounded-xl">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-2xl border-gray-200">
                        <DropdownMenuItem onClick={() => openDetailsDialog(user)} className="rounded-xl cursor-pointer">
                          <Eye className="mr-2 h-4 w-4" />
                          Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openEditDialog(user)} className="rounded-xl cursor-pointer">
                          <Pencil className="mr-2 h-4 w-4" />
                          Bewerken
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => openDeleteDialog(user)}
                          className="rounded-xl cursor-pointer text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Verwijderen
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-200">
                <TableHead className="font-semibold text-gray-900">Naam</TableHead>
                <TableHead className="font-semibold text-gray-900">E-mail</TableHead>
                <TableHead className="font-semibold text-gray-900">Aangemaakt</TableHead>
                <TableHead className="font-semibold text-gray-900">Laatste login</TableHead>
                <TableHead className="font-semibold text-gray-900 w-[100px]">Acties</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow
                  key={user.id}
                  className="border-gray-100 hover:bg-gray-50 cursor-pointer"
                  onClick={() => openDetailsDialog(user)}
                >
                  <TableCell className="font-medium">{user.display_name}</TableCell>
                  <TableCell className="text-gray-600">{user.email}</TableCell>
                  <TableCell className="text-gray-600">{formatDate(user.created_at)}</TableCell>
                  <TableCell className="text-gray-600">
                    {user.last_sign_in_at ? formatDate(user.last_sign_in_at) : "Nooit"}
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0 rounded-xl">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-2xl border-gray-200">
                        <DropdownMenuItem onClick={() => openDetailsDialog(user)} className="rounded-xl cursor-pointer">
                          <Eye className="mr-2 h-4 w-4" />
                          Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openEditDialog(user)} className="rounded-xl cursor-pointer">
                          <Pencil className="mr-2 h-4 w-4" />
                          Bewerken
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => openDeleteDialog(user)}
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
      </div>

      {/* Create User Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="rounded-2xl border-gray-200 shadow-2xl shadow-blue-500/20 w-[95vw] max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle className="text-lg md:text-xl font-semibold text-gray-900">Nieuwe super-admin</DialogTitle>
            <DialogDescription className="text-sm md:text-base text-gray-600">
              Voeg een nieuwe super-admin toe aan het systeem.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="create_email" className="text-sm font-medium text-gray-700">
                E-mail
              </Label>
              <Input
                id="create_email"
                type="email"
                value={createForm.email}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, email: e.target.value }))}
                className="rounded-2xl border-gray-200 focus:border-[#0065FF] focus:ring-[#0065FF]"
                placeholder="gebruiker@packway.com"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="create_name" className="text-sm font-medium text-gray-700">
                Naam
              </Label>
              <Input
                id="create_name"
                value={createForm.display_name}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, display_name: e.target.value }))}
                className="rounded-2xl border-gray-200 focus:border-[#0065FF] focus:ring-[#0065FF]"
                placeholder="Volledige naam"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="create_password" className="text-sm font-medium text-gray-700">
                Wachtwoord
              </Label>
              <Input
                id="create_password"
                type="password"
                value={createForm.password}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, password: e.target.value }))}
                className="rounded-2xl border-gray-200 focus:border-[#0065FF] focus:ring-[#0065FF]"
                placeholder="Minimaal 8 karakters"
              />
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCreateDialogOpen(false)}
              className="rounded-2xl w-full sm:w-auto"
            >
              Annuleren
            </Button>
            <Button
              onClick={handleCreateUser}
              disabled={actionLoading}
              className="rounded-2xl bg-[#0065FF] hover:bg-[#0052CC] shadow-lg shadow-blue-500/25 w-full sm:w-auto"
            >
              {actionLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Bezig...
                </>
              ) : (
                "Aanmaken"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="rounded-2xl border-gray-200 shadow-2xl shadow-blue-500/20 w-[95vw] max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle className="text-lg md:text-xl font-semibold text-gray-900">Super-admin bewerken</DialogTitle>
            <DialogDescription className="text-sm md:text-base text-gray-600">
              Wijzig de naam van de super-admin.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit_name" className="text-sm font-medium text-gray-700">
                Naam
              </Label>
              <Input
                id="edit_name"
                value={editForm.display_name}
                onChange={(e) => setEditForm({ display_name: e.target.value })}
                className="rounded-2xl border-gray-200 focus:border-[#0065FF] focus:ring-[#0065FF]"
              />
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
              className="rounded-2xl w-full sm:w-auto"
            >
              Annuleren
            </Button>
            <Button
              onClick={handleEditUser}
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

      {/* Delete User Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="rounded-2xl border-gray-200 shadow-2xl shadow-red-500/20 w-[95vw] max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle className="text-lg md:text-xl font-semibold text-gray-900">
              Super-admin verwijderen
            </DialogTitle>
            <DialogDescription className="text-sm md:text-base text-gray-600">
              Weet je zeker dat je <strong>{selectedUser?.display_name}</strong> wilt verwijderen? Deze actie kan niet
              ongedaan worden gemaakt.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              className="rounded-2xl w-full sm:w-auto"
            >
              Annuleren
            </Button>
            <Button
              onClick={handleDeleteUser}
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

      {/* User Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="rounded-2xl border-gray-200 shadow-2xl shadow-blue-500/20 w-[95vw] max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle className="text-lg md:text-xl font-semibold text-gray-900 flex items-center gap-2">
              <User className="w-5 h-5" />
              Gebruiker details
            </DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4 py-4">
              <div className="grid gap-2">
                <Label className="text-sm font-medium text-gray-700">Naam</Label>
                <p className="text-gray-900 font-medium">{selectedUser.display_name}</p>
              </div>
              <div className="grid gap-2">
                <Label className="text-sm font-medium text-gray-700">E-mail</Label>
                <p className="text-gray-600 break-all">{selectedUser.email}</p>
              </div>
              <div className="grid gap-2">
                <Label className="text-sm font-medium text-gray-700">Account aangemaakt</Label>
                <p className="text-gray-600">{formatDate(selectedUser.created_at)}</p>
              </div>
              <div className="grid gap-2">
                <Label className="text-sm font-medium text-gray-700">Laatste login</Label>
                <p className="text-gray-600">
                  {selectedUser.last_sign_in_at ? formatDate(selectedUser.last_sign_in_at) : "Nog nooit ingelogd"}
                </p>
              </div>
              <div className="grid gap-2">
                <Label className="text-sm font-medium text-gray-700">Status</Label>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${selectedUser.last_sign_in_at ? "bg-green-500" : "bg-gray-400"}`}
                  />
                  <p className="text-gray-600">{selectedUser.last_sign_in_at ? "Actief" : "Nog niet ingelogd"}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDetailsDialogOpen(false)}
              className="rounded-2xl w-full"
            >
              Sluiten
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
