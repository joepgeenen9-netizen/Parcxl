"use client"

import type React from "react"

import { useState } from "react"
import { FCLayout } from "../_components/fc-layout"
import { updateUserProfile } from "./actions"
import { Eye, EyeOff, User, Lock, Save } from "lucide-react"

interface TenantUser {
  id: string
  tenant_id: string
  username: string
  email: string
  is_admin: boolean
  created_at: string
}

interface TenantContext {
  id: string
  name: string
  type: string
  logo_url?: string
  status: string
  domain: string
}

interface ProfilePageClientProps {
  user: TenantUser
  tenant: TenantContext
}

export function ProfilePageClient({ user, tenant }: ProfilePageClientProps) {
  const [formData, setFormData] = useState({
    username: user.username,
    email: user.email,
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })

  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.username.trim()) {
      newErrors.username = "Gebruikersnaam is verplicht"
    }

    if (!formData.email.trim()) {
      newErrors.email = "E-mailadres is verplicht"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Ongeldig e-mailadres"
    }

    if (formData.newPassword) {
      if (!formData.currentPassword) {
        newErrors.currentPassword = "Huidig wachtwoord is verplicht om het wachtwoord te wijzigen"
      }

      if (formData.newPassword.length < 8) {
        newErrors.newPassword = "Nieuw wachtwoord moet minimaal 8 karakters bevatten"
      }

      if (formData.newPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = "Wachtwoorden komen niet overeen"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    console.log("Form submitted with data:", {
      username: formData.username,
      email: formData.email,
      hasCurrentPassword: !!formData.currentPassword,
      hasNewPassword: !!formData.newPassword,
    })

    if (!validateForm()) {
      console.log("Form validation failed")
      return
    }

    setIsLoading(true)
    setMessage(null)

    try {
      const formDataToSend = new FormData()
      formDataToSend.append("username", formData.username)
      formDataToSend.append("email", formData.email)

      if (formData.newPassword) {
        formDataToSend.append("currentPassword", formData.currentPassword)
        formDataToSend.append("newPassword", formData.newPassword)
      }

      console.log("Sending form data to server...")
      const result = await updateUserProfile(formDataToSend)
      console.log("Server response:", result)

      if (result.success) {
        setMessage({ type: "success", text: result.message || "Profiel succesvol bijgewerkt" })
        // Clear password fields
        setFormData((prev) => ({
          ...prev,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        }))
      } else {
        setMessage({ type: "error", text: result.error || "Er is een fout opgetreden" })
      }
    } catch (error) {
      console.error("Client-side error:", error)
      setMessage({ type: "error", text: "Er is een onverwachte fout opgetreden" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const togglePasswordVisibility = (field: "current" | "new" | "confirm") => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }))
  }

  return (
    <FCLayout user={user} tenant={tenant} searchPlaceholder="Zoek in profiel...">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 p-4 lg:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#2069ff] to-[#1557d4] flex items-center justify-center text-white font-bold text-xl shadow-[0_8px_25px_rgba(32,105,255,0.3)]">
                {user.username.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Profiel bewerken</h1>
                <p className="text-slate-600">Beheer je persoonlijke gegevens en instellingen</p>
              </div>
            </div>
          </div>

          {/* Message */}
          {message && (
            <div
              className={`mb-6 p-4 rounded-xl border ${
                message.type === "success"
                  ? "bg-green-50 border-green-200 text-green-800"
                  : "bg-red-50 border-red-200 text-red-800"
              }`}
            >
              {message.text}
            </div>
          )}

          {/* Profile Form */}
          <div className="bg-white/80 backdrop-blur-[20px] rounded-3xl border border-[#2069ff]/10 shadow-[0_8px_30px_rgba(32,105,255,0.08)] overflow-hidden">
            <form onSubmit={handleSubmit} className="p-8">
              {/* Basic Information */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-slate-900 mb-6 flex items-center gap-3">
                  <User className="w-5 h-5 text-[#2069ff]" />
                  Basisgegevens
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Username */}
                  <div>
                    <label htmlFor="username" className="block text-sm font-medium text-slate-700 mb-2">
                      Gebruikersnaam
                    </label>
                    <input
                      type="text"
                      id="username"
                      value={formData.username}
                      onChange={(e) => handleInputChange("username", e.target.value)}
                      className={`w-full px-4 py-3 border-2 rounded-xl bg-slate-50/50 transition-all duration-300 focus:outline-none focus:bg-white/90 focus:shadow-[0_0_0_4px_rgba(32,105,255,0.12)] ${
                        errors.username
                          ? "border-red-300 focus:border-red-500"
                          : "border-slate-200 focus:border-[#2069ff]"
                      }`}
                      placeholder="Voer je gebruikersnaam in"
                    />
                    {errors.username && <p className="mt-1 text-sm text-red-600">{errors.username}</p>}
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                      E-mailadres
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      className={`w-full px-4 py-3 border-2 rounded-xl bg-slate-50/50 transition-all duration-300 focus:outline-none focus:bg-white/90 focus:shadow-[0_0_0_4px_rgba(32,105,255,0.12)] ${
                        errors.email ? "border-red-300 focus:border-red-500" : "border-slate-200 focus:border-[#2069ff]"
                      }`}
                      placeholder="Voer je e-mailadres in"
                    />
                    {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                  </div>
                </div>
              </div>

              {/* Password Change */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-slate-900 mb-6 flex items-center gap-3">
                  <Lock className="w-5 h-5 text-[#2069ff]" />
                  Wachtwoord wijzigen
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Current Password */}
                  <div className="md:col-span-2">
                    <label htmlFor="currentPassword" className="block text-sm font-medium text-slate-700 mb-2">
                      Huidig wachtwoord
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.current ? "text" : "password"}
                        id="currentPassword"
                        value={formData.currentPassword}
                        onChange={(e) => handleInputChange("currentPassword", e.target.value)}
                        className={`w-full px-4 py-3 pr-12 border-2 rounded-xl bg-slate-50/50 transition-all duration-300 focus:outline-none focus:bg-white/90 focus:shadow-[0_0_0_4px_rgba(32,105,255,0.12)] ${
                          errors.currentPassword
                            ? "border-red-300 focus:border-red-500"
                            : "border-slate-200 focus:border-[#2069ff]"
                        }`}
                        placeholder="Voer je huidige wachtwoord in"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility("current")}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {errors.currentPassword && <p className="mt-1 text-sm text-red-600">{errors.currentPassword}</p>}
                  </div>

                  {/* New Password */}
                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-slate-700 mb-2">
                      Nieuw wachtwoord
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.new ? "text" : "password"}
                        id="newPassword"
                        value={formData.newPassword}
                        onChange={(e) => handleInputChange("newPassword", e.target.value)}
                        className={`w-full px-4 py-3 pr-12 border-2 rounded-xl bg-slate-50/50 transition-all duration-300 focus:outline-none focus:bg-white/90 focus:shadow-[0_0_0_4px_rgba(32,105,255,0.12)] ${
                          errors.newPassword
                            ? "border-red-300 focus:border-red-500"
                            : "border-slate-200 focus:border-[#2069ff]"
                        }`}
                        placeholder="Voer nieuw wachtwoord in"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility("new")}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {errors.newPassword && <p className="mt-1 text-sm text-red-600">{errors.newPassword}</p>}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-2">
                      Bevestig nieuw wachtwoord
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.confirm ? "text" : "password"}
                        id="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                        className={`w-full px-4 py-3 pr-12 border-2 rounded-xl bg-slate-50/50 transition-all duration-300 focus:outline-none focus:bg-white/90 focus:shadow-[0_0_0_4px_rgba(32,105,255,0.12)] ${
                          errors.confirmPassword
                            ? "border-red-300 focus:border-red-500"
                            : "border-slate-200 focus:border-[#2069ff]"
                        }`}
                        placeholder="Bevestig nieuw wachtwoord"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility("confirm")}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#2069ff] to-[#1557d4] text-white font-semibold rounded-xl shadow-[0_4px_15px_rgba(32,105,255,0.3)] hover:shadow-[0_8px_25px_rgba(32,105,255,0.4)] hover:transform hover:translate-y-[-2px] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  <Save className="w-5 h-5" />
                  {isLoading ? "Opslaan..." : "Opslaan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </FCLayout>
  )
}
