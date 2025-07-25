"use client"

import React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { SuperAdmin, CreateSuperAdminData } from "@/types/user"

interface CreateUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: CreateSuperAdminData) => Promise<void>
  isLoading: boolean
}

export function CreateUserDialog({ open, onOpenChange, onSubmit, isLoading }: CreateUserDialogProps) {
  const [formData, setFormData] = useState<CreateSuperAdminData>({
    display_name: "",
    email: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit(formData)
    setFormData({ display_name: "", email: "" })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl border-gray-200 shadow-2xl shadow-blue-500/20">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900">Nieuwe super-admin</DialogTitle>
          <DialogDescription className="text-gray-600">
            Voeg een nieuwe super-admin toe aan het systeem.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="display_name" className="text-sm font-medium text-gray-700">
                Naam
              </Label>
              <Input
                id="display_name"
                value={formData.display_name}
                onChange={(e) => setFormData((prev) => ({ ...prev, display_name: e.target.value }))}
                className="rounded-2xl border-gray-200 focus:border-[#0065FF] focus:ring-[#0065FF]"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                E-mail
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                className="rounded-2xl border-gray-200 focus:border-[#0065FF] focus:ring-[#0065FF]"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="rounded-2xl">
              Annuleren
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="rounded-2xl bg-[#0065FF] hover:bg-[#0052CC] shadow-lg shadow-blue-500/25"
            >
              {isLoading ? "Bezig..." : "Opslaan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

interface EditUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: SuperAdmin | null
  onSubmit: (id: string, display_name: string) => Promise<void>
  isLoading: boolean
}

export function EditUserDialog({ open, onOpenChange, user, onSubmit, isLoading }: EditUserDialogProps) {
  const [displayName, setDisplayName] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (user) {
      await onSubmit(user.id, displayName)
    }
  }

  // Update form when user changes
  React.useEffect(() => {
    if (user) {
      setDisplayName(user.display_name)
    }
  }, [user])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl border-gray-200 shadow-2xl shadow-blue-500/20">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900">Super-admin bewerken</DialogTitle>
          <DialogDescription className="text-gray-600">Wijzig de gegevens van de super-admin.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit_display_name" className="text-sm font-medium text-gray-700">
                Naam
              </Label>
              <Input
                id="edit_display_name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="rounded-2xl border-gray-200 focus:border-[#0065FF] focus:ring-[#0065FF]"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="rounded-2xl">
              Annuleren
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="rounded-2xl bg-[#0065FF] hover:bg-[#0052CC] shadow-lg shadow-blue-500/25"
            >
              {isLoading ? "Bezig..." : "Opslaan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

interface DeleteUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: SuperAdmin | null
  onConfirm: (id: string) => Promise<void>
  isLoading: boolean
}

export function DeleteUserDialog({ open, onOpenChange, user, onConfirm, isLoading }: DeleteUserDialogProps) {
  const handleConfirm = async () => {
    if (user) {
      await onConfirm(user.id)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl border-gray-200 shadow-2xl shadow-red-500/20">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900">Super-admin verwijderen</DialogTitle>
          <DialogDescription className="text-gray-600">
            Weet je zeker dat je <strong>{user?.display_name}</strong> wilt verwijderen? Deze actie kan niet ongedaan
            worden gemaakt.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="rounded-2xl">
            Annuleren
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading}
            className="rounded-2xl bg-[#FF4757] hover:bg-[#FF3742] text-white shadow-lg shadow-red-500/25"
          >
            {isLoading ? "Bezig..." : "Verwijderen"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
