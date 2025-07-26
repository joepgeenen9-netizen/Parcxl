"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Mail, Lock, User, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase"
import { toast } from "sonner"

export function SignupForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const router = useRouter()
  const supabase = createClient()

  const handleInputChange = (e: any) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSignup = async (e: any) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Validate passwords match
      if (formData.password !== formData.confirmPassword) {
        toast.error("Wachtwoorden komen niet overeen")
        return
      }

      // Validate password strength
      if (formData.password.length < 6) {
        toast.error("Wachtwoord moet minimaal 6 karakters lang zijn")
        return
      }

      // Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
          },
        },
      })

      if (authError) {
        console.error("Signup error:", authError)
        if (authError.message.includes("User already registered")) {
          toast.error("Er bestaat al een account met dit e-mailadres")
        } else {
          toast.error("Fout bij registreren: " + authError.message)
        }
        return
      }

      if (!authData.user) {
        toast.error("Fout bij het aanmaken van account")
        return
      }

      console.log("User created:", authData.user.id)

      // Check if email confirmation is required
      if (!authData.session) {
        toast.success("Account aangemaakt! Controleer je e-mail voor bevestiging.")
        router.push("/login")
      } else {
        // User is automatically signed in
        toast.success("Account succesvol aangemaakt!")

        // Wait a moment for the profile to be created by the trigger
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Redirect to customer dashboard (new users are customers by default)
        router.push("/customer")
      }
    } catch (error) {
      console.error("Signup error:", error)
      toast.error("Er is een fout opgetreden")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="mx-auto h-16 w-16 rounded-2xl bg-gradient-to-br from-[#2069ff] to-[#1557d4] flex items-center justify-center mb-6 shadow-[0_8px_32px_rgba(32,105,255,0.3)]">
          <div className="text-white font-bold text-2xl">P</div>
        </div>
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Account aanmaken</h2>
        <p className="text-slate-600">Maak je Parcxl account aan</p>
      </div>

      {/* Signup Form */}
      <form onSubmit={handleSignup} className="space-y-6">
        <div className="space-y-4">
          {/* First Name Field */}
          <div className="space-y-2">
            <Label htmlFor="firstName" className="text-sm font-medium text-slate-700">
              Voornaam
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
              <Input
                id="firstName"
                name="firstName"
                type="text"
                required
                value={formData.firstName}
                onChange={handleInputChange}
                className="pl-10 h-12 border-slate-200 focus:border-[#2069ff] focus:ring-[#2069ff] rounded-xl"
                placeholder="Je voornaam"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Last Name Field */}
          <div className="space-y-2">
            <Label htmlFor="lastName" className="text-sm font-medium text-slate-700">
              Achternaam
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
              <Input
                id="lastName"
                name="lastName"
                type="text"
                required
                value={formData.lastName}
                onChange={handleInputChange}
                className="pl-10 h-12 border-slate-200 focus:border-[#2069ff] focus:ring-[#2069ff] rounded-xl"
                placeholder="Je achternaam"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-slate-700">
              E-mailadres
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
              <Input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="pl-10 h-12 border-slate-200 focus:border-[#2069ff] focus:ring-[#2069ff] rounded-xl"
                placeholder="je@email.com"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium text-slate-700">
              Wachtwoord
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                value={formData.password}
                onChange={handleInputChange}
                className="pl-10 pr-10 h-12 border-slate-200 focus:border-[#2069ff] focus:ring-[#2069ff] rounded-xl"
                placeholder="••••••••"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                disabled={isLoading}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Confirm Password Field */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-sm font-medium text-slate-700">
              Bevestig wachtwoord
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                required
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="pl-10 pr-10 h-12 border-slate-200 focus:border-[#2069ff] focus:ring-[#2069ff] rounded-xl"
                placeholder="••••••••"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                disabled={isLoading}
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Terms and Conditions */}
        <div className="flex items-center">
          <input
            id="terms"
            name="terms"
            type="checkbox"
            required
            className="h-4 w-4 text-[#2069ff] focus:ring-[#2069ff] border-slate-300 rounded"
            disabled={isLoading}
          />
          <label htmlFor="terms" className="ml-2 block text-sm text-slate-700">
            Ik ga akkoord met de{" "}
            <button type="button" className="text-[#2069ff] hover:text-[#1557d4] font-medium">
              algemene voorwaarden
            </button>
          </label>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-12 bg-gradient-to-r from-[#2069ff] to-[#1557d4] hover:from-[#1557d4] hover:to-[#0f4cb8] text-white font-semibold rounded-xl shadow-[0_4px_16px_rgba(32,105,255,0.3)] hover:shadow-[0_6px_20px_rgba(32,105,255,0.4)] transition-all duration-300 transform hover:translate-y-[-1px]"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Account aanmaken...
            </>
          ) : (
            "Account aanmaken"
          )}
        </Button>
      </form>

      {/* Footer */}
      <div className="text-center">
        <p className="text-sm text-slate-600">
          Al een account?{" "}
          <button
            type="button"
            onClick={() => router.push("/login")}
            className="text-[#2069ff] hover:text-[#1557d4] font-medium transition-colors"
            disabled={isLoading}
          >
            Log hier in
          </button>
        </p>
      </div>
    </div>
  )
}
