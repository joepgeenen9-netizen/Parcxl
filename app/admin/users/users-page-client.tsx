"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import type { SuperAdmin, CreateSuperAdminData } from "@/types/user"
import { UsersDataTable } from "@/components/users-data-table"
import { CreateUserDialog, EditUserDialog, DeleteUserDialog } from "@/components/user-dialogs"
import { createSuperAdmin, updateSuperAdmin, deleteSuperAdmin } from "./actions"

export default function UsersPageClient({ initialUsers }: { initialUsers: SuperAdmin[] }) {
  const router = useRouter()
  const { toast } = useToast()

  /* Local UI state */
  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selected, setSelected] = useState<SuperAdmin | null>(null)
  const [busy, setBusy] = useState(false)

  /* Helpers */
  const refresh = () => router.refresh()

  const handleCreate = async (data: CreateSuperAdminData) => {
    setBusy(true)
    const res = await createSuperAdmin(data)
    setBusy(false)
    toast({
      title: res.success ? "Succes" : "Fout",
      description: res.message,
      variant: res.success ? "default" : "destructive",
    })
    if (res.success) {
      setCreateOpen(false)
      refresh()
    }
  }

  const handleEdit = async (id: string, display_name: string) => {
    setBusy(true)
    const res = await updateSuperAdmin(id, display_name)
    setBusy(false)
    toast({
      title: res.success ? "Succes" : "Fout",
      description: res.message,
      variant: res.success ? "default" : "destructive",
    })
    if (res.success) {
      setEditOpen(false)
      refresh()
    }
  }

  const handleDelete = async (id: string) => {
    setBusy(true)
    const res = await deleteSuperAdmin(id)
    setBusy(false)
    toast({
      title: res.success ? "Succes" : "Fout",
      description: res.message,
      variant: res.success ? "default" : "destructive",
    })
    if (res.success) {
      setDeleteOpen(false)
      refresh()
    }
  }

  return (
    <div className="flex-1 p-6 bg-gray-50">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">Super-admin gebruikers</h1>
          <p className="text-gray-600">Beheer super-admin accounts en toegang.</p>
        </div>
        <Button
          onClick={() => setCreateOpen(true)}
          className="rounded-2xl bg-[#0065FF] hover:bg-[#0052CC] shadow-lg shadow-blue-500/25"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nieuwe super-admin
        </Button>
      </div>

      <UsersDataTable
        users={initialUsers}
        onEdit={(u) => {
          setSelected(u)
          setEditOpen(true)
        }}
        onDelete={(u) => {
          setSelected(u)
          setDeleteOpen(true)
        }}
      />

      {/* Dialogs */}
      <CreateUserDialog open={createOpen} onOpenChange={setCreateOpen} onSubmit={handleCreate} isLoading={busy} />
      <EditUserDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        user={selected}
        onSubmit={handleEdit}
        isLoading={busy}
      />
      <DeleteUserDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        user={selected}
        onConfirm={handleDelete}
        isLoading={busy}
      />
    </div>
  )
}
