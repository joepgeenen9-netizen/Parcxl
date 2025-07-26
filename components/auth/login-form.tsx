"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Mail, Lock, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const router = useRouter()
  const supabase = createClient()
  const { toast } = useToast()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Sign in with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      })

      if (authError) {
        console.error("Login error:", authError)
        if (authError.message.includes("Invalid login credentials")) {
          toast({
            title: "Fout",
            description: "Ongeldige inloggegevens",
            variant: "destructive",
          })
        } else {
          toast({
            title: "Fout",
            description: "Fout bij inloggen",
            variant: "destructive",
          })
        }
        return
      }

      if (!authData.user) {
        toast({
          title: "Fout",
          description: "Geen gebruiker gevonden",
          variant: "destructive",
        })
        return
      }

      console.log("User authenticated:", authData.user.id)

      // Wait for session to be properly established
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Refresh the session to ensure it's properly set
      await supabase.auth.refreshSession()

      // Get user profile using a direct query without complex policies
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("user_type, first_name, last_name")
        .eq("id", authData.user.id)
        .maybeSingle()

      console.log("Profile query result:", { profileData, profileError })

      if (profileError) {
        console.error("Profile fetch error:", profileError)
        toast({
          title: "Fout",
          description: "Fout bij ophalen profiel. Probeer opnieuw in te loggen.",
          variant: "destructive",
        })
        await supabase.auth.signOut()
        return
      }

      if (!profileData) {
        console.log("No profile found, this might be a new user")
        toast({
          title: "Fout",
          description: "Geen profiel gevonden. Neem contact op met support.",
          variant: "destructive",
        })
        await supabase.auth.signOut()
        return
      }

      console.log("Profile found:", profileData)

      // Redirect based on user_type
      const welcomeMessage = profileData.first_name ? `Welkom terug, ${profileData.first_name}!` : "Welkom terug!"

      if (profileData.user_type === "admin") {
        console.log("Redirecting to admin dashboard")
        router.push("/admin")
        toast({
          title: "Succes",
          description: welcomeMessage,
        })
      } else if (profileData.user_type === "customer") {
        console.log("Redirecting to customer dashboard")
        router.push("/customer")
        toast({
          title: "Succes",
          description: welcomeMessage,
        })
      } else {
        console.error("Unknown user type:", profileData.user_type)
        toast({
          title: "Fout",
          description: "Onbekende gebruikersrol",
          variant: "destructive",
        })
        return
      }
    } catch (error) {
      console.error("Login error:", error)
      toast({
        title: "Fout",
        description: "Er is een fout opgetreden",
        variant: "destructive",
      })
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
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Welkom terug</h2>
        <p className="text-slate-600">Log in op je Parcxl account</p>
      </div>

      {/* Login Form */}
      <form onSubmit={handleLogin} className="space-y-6">
        <div className="space-y-4">
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
        </div>

        {/* Remember Me & Forgot Password */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 text-[#2069ff] focus:ring-[#2069ff] border-slate-300 rounded"
              disabled={isLoading}
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-700">
              Onthoud mij
            </label>
          </div>
          <button
            type="button"
            className="text-sm text-[#2069ff] hover:text-[#1557d4] font-medium transition-colors"
            disabled={isLoading}
          >
            Wachtwoord vergeten?
          </button>
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
              Inloggen...
            </>
          ) : (
            "Inloggen"
          )}
        </Button>
      </form>

      {/* Footer */}
      <div className="text-center">
        <p className="text-sm text-slate-600">
          Nog geen account?{" "}
          <button
            type="button"
            onClick={() => router.push("/signup")}
            className="text-[#2069ff] hover:text-[#1557d4] font-medium transition-colors"
            disabled={isLoading}
          >
            Registreer hier
          </button>
        </p>
      </div>
    </div>
  )
}
