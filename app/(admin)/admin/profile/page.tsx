"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Lock, User, Mail, Loader2, Edit, Save, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"

export default function ProfilePage() {
  const router = useRouter()
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [editingProfile, setEditingProfile] = useState(false)
  const [user, setUser] = useState<{ email: string; display_name: string; id: string } | null>(null)

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    display_name: "",
    email: "",
  })

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session) {
          router.push("/login")
          return
        }

        // Get super admin data
        const { data: superAdmin } = await supabase
          .from("super_admins")
          .select("display_name")
          .eq("id", session.user.id)
          .single()

        if (!superAdmin) {
          router.push("/login")
          return
        }

        const userData = {
          id: session.user.id,
          email: session.user.email || "",
          display_name: superAdmin.display_name,
        }

        setUser(userData)
        setProfileForm({
          display_name: userData.display_name,
          email: userData.email,
        })
      } catch (error) {
        console.error("Error loading user data:", error)
        router.push("/login")
      } finally {
        setLoading(false)
      }
    }

    loadUserData()
  }, [router])

  const validatePasswordForm = () => {
    const newErrors: { [key: string]: string } = {}

    if (!passwordForm.currentPassword) {
      newErrors.currentPassword = "Huidig wachtwoord is verplicht"
    }

    if (!passwordForm.newPassword) {
      newErrors.newPassword = "Nieuw wachtwoord is verplicht"
    } else if (passwordForm.newPassword.length < 8) {
      newErrors.newPassword = "Wachtwoord moet minimaal 8 karakters zijn"
    }

    if (!passwordForm.confirmPassword) {
      newErrors.confirmPassword = "Bevestig het nieuwe wachtwoord"
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      newErrors.confirmPassword = "Wachtwoorden komen niet overeen"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateProfileForm = () => {
    const newErrors: { [key: string]: string } = {}

    if (!profileForm.display_name.trim()) {
      newErrors.display_name = "Naam is verplicht"
    }

    if (!profileForm.email.trim()) {
      newErrors.email = "E-mail is verplicht"
    } else if (!/\S+@\S+\.\S+/.test(profileForm.email)) {
      newErrors.email = "Voer een geldig e-mailadres in"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleProfileUpdate = async () => {
    if (!validateProfileForm() || !user) return

    setUpdating(true)
    try {
      // Update display name in super_admins table
      const { error: updateNameError } = await supabase
        .from("super_admins")
        .update({ display_name: profileForm.display_name })
        .eq("id", user.id)

      if (updateNameError) throw updateNameError

      // Update email in auth if changed
      if (profileForm.email !== user.email) {
        const { error: updateEmailError } = await supabase.auth.updateUser({
          email: profileForm.email,
        })

        if (updateEmailError) throw updateEmailError
      }

      // Update local state
      setUser((prev) => (prev ? { ...prev, display_name: profileForm.display_name, email: profileForm.email } : null))

      toast({
        title: "Succes",
        description: "Profiel succesvol bijgewerkt",
      })

      setEditingProfile(false)
      setErrors({})
    } catch (error: any) {
      toast({
        title: "Fout",
        description: error.message || "Kon profiel niet bijwerken",
        variant: "destructive",
      })
    } finally {
      setUpdating(false)
    }
  }

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validatePasswordForm()) return

    setUpdating(true)
    try {
      // First verify current password by trying to sign in
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser()

      if (!currentUser?.email) {
        throw new Error("Geen gebruiker gevonden")
      }

      // Try to sign in with current password to verify it
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: currentUser.email,
        password: passwordForm.currentPassword,
      })

      if (signInError) {
        setErrors({ currentPassword: "Huidig wachtwoord is onjuist" })
        return
      }

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: passwordForm.newPassword,
      })

      if (updateError) {
        throw updateError
      }

      toast({
        title: "Succes",
        description: "Wachtwoord succesvol bijgewerkt",
      })

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
      setErrors({})
    } catch (error: any) {
      toast({
        title: "Fout",
        description: error.message || "Kon wachtwoord niet bijwerken",
        variant: "destructive",
      })
    } finally {
      setUpdating(false)
    }
  }

  const cancelProfileEdit = () => {
    if (user) {
      setProfileForm({
        display_name: user.display_name,
        email: user.email,
      })
    }
    setEditingProfile(false)
    setErrors({})
  }

  if (loading) {
    return (
      <div className="flex-1 p-4 md:p-6 bg-gray-50 min-h-0 overflow-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#0065FF] mx-auto mb-4" />
            <p className="text-gray-600">Profiel laden...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 p-4 md:p-6 bg-gray-50 min-h-0 overflow-auto">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-2" style={{ fontFamily: "Poppins" }}>
          Mijn profiel
        </h1>
        <p className="text-sm md:text-base text-gray-600">Beheer je account instellingen en wachtwoord.</p>
      </div>

      <div className="grid gap-6 max-w-4xl">
        {/* Profile Info Card */}
        <Card className="rounded-2xl border-gray-200 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Profiel informatie
                </CardTitle>
                <CardDescription>Je account gegevens</CardDescription>
              </div>
              {!editingProfile && (
                <Button variant="outline" size="sm" onClick={() => setEditingProfile(true)} className="rounded-2xl">
                  <Edit className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Bewerken</span>
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {editingProfile ? (
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit_name" className="text-sm font-medium text-gray-700">
                    Naam
                  </Label>
                  <Input
                    id="edit_name"
                    value={profileForm.display_name}
                    onChange={(e) => setProfileForm((prev) => ({ ...prev, display_name: e.target.value }))}
                    className={`rounded-2xl border-gray-200 focus:border-[#0065FF] focus:ring-[#0065FF] ${
                      errors.display_name ? "border-red-500" : ""
                    }`}
                    placeholder="Volledige naam"
                  />
                  {errors.display_name && <p className="text-sm text-red-600">{errors.display_name}</p>}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit_email" className="text-sm font-medium text-gray-700">
                    E-mail
                  </Label>
                  <Input
                    id="edit_email"
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm((prev) => ({ ...prev, email: e.target.value }))}
                    className={`rounded-2xl border-gray-200 focus:border-[#0065FF] focus:ring-[#0065FF] ${
                      errors.email ? "border-red-500" : ""
                    }`}
                    placeholder="je@email.com"
                  />
                  {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    onClick={handleProfileUpdate}
                    disabled={updating}
                    className="rounded-2xl bg-[#0065FF] hover:bg-[#0052CC] shadow-lg shadow-blue-500/25 w-full sm:w-auto"
                  >
                    {updating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Bezig...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Opslaan
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={cancelProfileEdit}
                    className="rounded-2xl w-full sm:w-auto bg-transparent"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Annuleren
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label className="text-sm font-medium text-gray-700">Naam</Label>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-2xl">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900">{user?.display_name}</span>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label className="text-sm font-medium text-gray-700">E-mail</Label>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-2xl">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900 break-all">{user?.email}</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Password Change Card */}
        <Card className="rounded-2xl border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Wachtwoord wijzigen
            </CardTitle>
            <CardDescription>Wijzig je wachtwoord voor extra beveiliging</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordUpdate} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="current_password" className="text-sm font-medium text-gray-700">
                  Huidig wachtwoord
                </Label>
                <Input
                  id="current_password"
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))}
                  className={`rounded-2xl border-gray-200 focus:border-[#0065FF] focus:ring-[#0065FF] ${
                    errors.currentPassword ? "border-red-500" : ""
                  }`}
                  placeholder="••••••••"
                />
                {errors.currentPassword && <p className="text-sm text-red-600">{errors.currentPassword}</p>}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="new_password" className="text-sm font-medium text-gray-700">
                  Nieuw wachtwoord
                </Label>
                <Input
                  id="new_password"
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))}
                  className={`rounded-2xl border-gray-200 focus:border-[#0065FF] focus:ring-[#0065FF] ${
                    errors.newPassword ? "border-red-500" : ""
                  }`}
                  placeholder="••••••••"
                />
                {errors.newPassword && <p className="text-sm text-red-600">{errors.newPassword}</p>}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="confirm_password" className="text-sm font-medium text-gray-700">
                  Bevestig nieuw wachtwoord
                </Label>
                <Input
                  id="confirm_password"
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                  className={`rounded-2xl border-gray-200 focus:border-[#0065FF] focus:ring-[#0065FF] ${
                    errors.confirmPassword ? "border-red-500" : ""
                  }`}
                  placeholder="••••••••"
                />
                {errors.confirmPassword && <p className="text-sm text-red-600">{errors.confirmPassword}</p>}
              </div>

              <Button
                type="submit"
                disabled={updating}
                className="rounded-2xl bg-[#0065FF] hover:bg-[#0052CC] shadow-lg shadow-blue-500/25 w-full sm:w-auto"
              >
                {updating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Bezig met bijwerken...
                  </>
                ) : (
                  "Wachtwoord bijwerken"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
