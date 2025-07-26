"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Loader2, Package, Shield, User } from "lucide-react"
import { BackgroundElements } from "@/components/background-elements"
import Image from "next/image"

export default function LoginPage() {
  const [formData, setFormData] = useState({
    gebruikersnaam: "",
    wachtwoord: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        // Store user data in localStorage or session
        localStorage.setItem("user", JSON.stringify(data.user))

        // Redirect based on role
        if (data.user.rol === "admin") {
          router.push("/admin-dashboard")
        } else {
          router.push("/customer-dashboard")
        }
      } else {
        setError(data.message || "Inloggen mislukt")
      }
    } catch (error) {
      setError("Er is een fout opgetreden. Probeer het opnieuw.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4 relative overflow-hidden">
      <BackgroundElements />

      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-32 h-32 bg-blue-200/30 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-32 w-24 h-24 bg-purple-200/30 rounded-full blur-lg animate-bounce"></div>
        <div className="absolute bottom-32 left-32 w-40 h-40 bg-indigo-200/20 rounded-full blur-2xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 right-20 w-28 h-28 bg-pink-200/25 rounded-full blur-xl animate-bounce delay-500"></div>
      </div>

      <Card className="w-full max-w-md relative z-10 shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="space-y-6 text-center pb-8">
          {/* Logo */}
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Image src="/images/parcxl-logo.png" alt="Parcxl Logo" width={120} height={40} className="h-10 w-auto" />
            </div>
          </div>

          <div className="space-y-2">
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Welkom terug
            </CardTitle>
            <CardDescription className="text-gray-600">Log in op uw Parcxl account</CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-700">{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="gebruikersnaam" className="text-sm font-medium text-gray-700">
                Gebruikersnaam
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="gebruikersnaam"
                  name="gebruikersnaam"
                  type="text"
                  required
                  value={formData.gebruikersnaam}
                  onChange={handleInputChange}
                  className="pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Voer uw gebruikersnaam in"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="wachtwoord" className="text-sm font-medium text-gray-700">
                Wachtwoord
              </Label>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="wachtwoord"
                  name="wachtwoord"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.wachtwoord}
                  onChange={handleInputChange}
                  className="pl-10 pr-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Voer uw wachtwoord in"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Inloggen...
                </>
              ) : (
                <>
                  <Package className="mr-2 h-4 w-4" />
                  Inloggen
                </>
              )}
            </Button>
          </form>

          {/* Demo Accounts */}
          <div className="pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center mb-3">Demo accounts:</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-blue-50 p-2 rounded text-center">
                <p className="font-medium text-blue-700">Admin</p>
                <p className="text-blue-600">admin / admin123</p>
              </div>
              <div className="bg-green-50 p-2 rounded text-center">
                <p className="font-medium text-green-700">Klant</p>
                <p className="text-green-600">jdoe / klant123</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
