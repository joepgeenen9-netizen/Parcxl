"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Mail, Lock, Loader2 } from "lucide-react"
import { useTenant } from "@/contexts/tenant-context"
import bcrypt from "bcryptjs"

export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { tenant, isTenantDomain, isLoading: tenantLoading } = useTenant()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
  const [authChecked, setAuthChecked] = useState(false)

  // Check if user is already logged in - ONLY ONCE
  useEffect(() => {
    if (tenantLoading || authChecked) return

    const checkUser = async () => {
      try {
        if (isTenantDomain) {
          // For tenant domains, check if there's a tenant user session
          const tenantUser = localStorage.getItem("tenant-user")
          if (tenantUser && tenant) {
            const userData = JSON.parse(tenantUser)
            if (userData.tenant_id === tenant.id) {
              // Redirect based on tenant type
              router.replace(tenant.type === "FC" ? "/dashboard/fc" : "/dashboard/ws")
              return
            }
          }
        } else {
          // For superadmin domains, check Supabase auth
          const {
            data: { session },
          } = await supabase.auth.getSession()

          if (session) {
            const { data: superAdmin } = await supabase
              .from("super_admins")
              .select("id")
              .eq("id", session.user.id)
              .single()

            if (superAdmin) {
              router.replace("/dashboard/superadmin")
              return
            }
          }
        }
      } catch (error) {
        console.error("Auth check error:", error)
      } finally {
        setAuthChecked(true)
      }
    }

    checkUser()
  }, [router, isTenantDomain, tenant, tenantLoading, authChecked])

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {}

    if (!email) {
      newErrors.email = "E-mail is verplicht"
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Voer een geldig e-mailadres in"
    }

    if (!password) {
      newErrors.password = "Wachtwoord is verplicht"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSuperadminLogin = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        toast({
          title: "Inloggen mislukt",
          description: error.message === "Invalid login credentials" ? "Onjuiste e-mail of wachtwoord" : error.message,
          variant: "destructive",
        })
        return
      }

      if (data.user) {
        // Check if user is super-admin
        const { data: superAdmin } = await supabase.from("super_admins").select("id").eq("id", data.user.id).single()

        if (superAdmin) {
          toast({
            title: "Welkom terug!",
            description: "Je bent succesvol ingelogd.",
          })
          router.replace("/dashboard/superadmin")
        } else {
          await supabase.auth.signOut()
          toast({
            title: "Toegang geweigerd",
            description: "Je hebt geen toegang tot het admin dashboard.",
            variant: "destructive",
          })
        }
      }
    } catch (error) {
      toast({
        title: "Er is een fout opgetreden",
        description: "Probeer het opnieuw.",
        variant: "destructive",
      })
    }
  }

  const handleTenantLogin = async () => {
    if (!tenant) {
      toast({
        title: "Fout",
        description: "Tenant informatie niet gevonden.",
        variant: "destructive",
      })
      return
    }

    try {
      // Get tenant user from database
      const { data: tenantUser, error } = await supabase
        .from("tenant_users")
        .select("*")
        .eq("tenant_id", tenant.id)
        .eq("email", email)
        .single()

      if (error || !tenantUser) {
        toast({
          title: "Inloggen mislukt",
          description: "Onjuiste e-mail of wachtwoord",
          variant: "destructive",
        })
        return
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, tenantUser.password_hash)

      if (!isValidPassword) {
        toast({
          title: "Inloggen mislukt",
          description: "Onjuiste e-mail of wachtwoord",
          variant: "destructive",
        })
        return
      }

      // Store tenant user session
      const userSession = {
        id: tenantUser.id,
        tenant_id: tenantUser.tenant_id,
        username: tenantUser.username,
        email: tenantUser.email,
        is_admin: tenantUser.is_admin,
      }

      localStorage.setItem("tenant-user", JSON.stringify(userSession))

      toast({
        title: "Welkom terug!",
        description: `Ingelogd bij ${tenant.name}`,
      })

      // Redirect based on tenant type
      router.replace(tenant.type === "FC" ? "/dashboard/fc" : "/dashboard/ws")
    } catch (error) {
      console.error("Tenant login error:", error)
      toast({
        title: "Er is een fout opgetreden",
        description: "Probeer het opnieuw.",
        variant: "destructive",
      })
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)
    setErrors({})

    try {
      if (isTenantDomain) {
        await handleTenantLogin()
      } else {
        await handleSuperadminLogin()
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (tenantLoading || !authChecked) {
    return (
      <div className="min-h-screen bg-[#F7F9FC] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#0065FF] mx-auto mb-4" />
          <p className="text-gray-600 font-poppins">Bezig met laden...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F7F9FC] flex flex-col items-center justify-center px-4">
      {/* Logo */}
      <div className="mb-8">
        {isTenantDomain && tenant?.logo_url ? (
          <div className="relative w-48 h-12">
            <Image
              src={tenant.logo_url || "/placeholder.svg"}
              alt={tenant.name}
              fill
              className="object-contain"
              priority
            />
          </div>
        ) : (
          <div className="relative w-48 h-12">
            <Image src="/packway-logo.webp" alt="Packway" fill className="object-contain" priority />
          </div>
        )}
      </div>

      {/* Login Card */}
      <Card className="w-full max-w-[420px] rounded-2xl border-gray-200 shadow-2xl shadow-blue-500/20 bg-white">
        <CardHeader className="space-y-1 pb-6">
          <CardTitle className="text-2xl font-semibold text-gray-900 text-center font-poppins">
            {isTenantDomain ? `Welkom bij ${tenant?.name}` : "Welkom terug"}
          </CardTitle>
          <CardDescription className="text-gray-600 text-center font-poppins">
            {isTenantDomain ? "Log in op je account" : "Log in op je Packway admin dashboard"}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700 font-poppins">
                E-mailadres
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`pl-10 rounded-2xl border-gray-200 focus:border-[#0065FF] focus:ring-[#0065FF] font-poppins ${
                    errors.email ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
                  }`}
                  placeholder="je@email.com"
                />
              </div>
              {errors.email && <p className="text-sm text-red-600 mt-1 font-poppins">{errors.email}</p>}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700 font-poppins">
                Wachtwoord
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`pl-10 rounded-2xl border-gray-200 focus:border-[#0065FF] focus:ring-[#0065FF] font-poppins ${
                    errors.password ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
                  }`}
                  placeholder="••••••••"
                />
              </div>
              {errors.password && <p className="text-sm text-red-600 mt-1 font-poppins">{errors.password}</p>}
            </div>

            {/* Login Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-2xl bg-[#0065FF] hover:bg-[#0050DB] text-white shadow-lg shadow-blue-500/25 h-11 mt-6 font-poppins"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Bezig met inloggen...
                </>
              ) : (
                "Inloggen"
              )}
            </Button>
          </form>

          {/* Help Text */}
          <p className="text-center text-sm text-gray-600 pt-4 font-poppins">
            {isTenantDomain ? (
              <>
                Problemen met inloggen?{" "}
                <span className="text-[#FF8200] hover:text-[#E6750A] cursor-pointer font-medium">
                  Neem contact op met je beheerder
                </span>
              </>
            ) : (
              <>
                Geen account?{" "}
                <span className="text-[#FF8200] hover:text-[#E6750A] cursor-pointer font-medium">
                  Neem contact op met je administrator
                </span>
              </>
            )}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
