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
        // Store user data in localStorage
        localStorage.setItem("user", JSON.stringify(data.user))

        // Redirect based on role
        if (data.user.rol === "admin") {
          router.push("/admin-dashboard")
        } else {
          router.push("/customer-dashboard")
        }
      } else {
        setError(data.error || "Er is een fout opgetreden bij het inloggen")
      }
    } catch (error) {
      setError("Er is een netwerkfout opgetreden. Probeer het opnieuw.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDemoLogin = (username: string, password: string) => {
    setFormData({ gebruikersnaam: username, wachtwoord: password })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-200/10 to-purple-200/10 rounded-full blur-3xl animate-spin-slow"></div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 left-20 animate-float">
        <Package className="w-8 h-8 text-blue-400/30" />
      </div>
      <div className="absolute top-40 right-32 animate-float-delay-1">
        <Shield className="w-6 h-6 text-purple-400/30" />
      </div>
      <div className="absolute bottom-32 left-32 animate-float-delay-2">
        <User className="w-7 h-7 text-blue-400/30" />
      </div>

      <Card className="w-full max-w-md relative z-10 backdrop-blur-sm bg-white/80 border-white/20 shadow-2xl">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="relative w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-4 shadow-lg">
              <Image
                src="/images/parcxl-logo.png"
                alt="Parcxl Logo"
                width={64}
                height={64}
                className="w-full h-full object-contain filter brightness-0 invert"
              />
            </div>
          </div>
          <div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Welkom bij Parcxl
            </CardTitle>
            <CardDescription className="text-gray-600 mt-2">
              Log in om toegang te krijgen tot uw dashboard
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="gebruikersnaam" className="text-sm font-medium text-gray-700">
                Gebruikersnaam
              </Label>
              <Input
                id="gebruikersnaam"
                type="text"
                value={formData.gebruikersnaam}
                onChange={(e) => setFormData({ ...formData, gebruikersnaam: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Voer uw gebruikersnaam in"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="wachtwoord" className="text-sm font-medium text-gray-700">
                Wachtwoord
              </Label>
              <div className="relative">
                <Input
                  id="wachtwoord"
                  type={showPassword ? "text" : "password"}
                  value={formData.wachtwoord}
                  onChange={(e) => setFormData({ ...formData, wachtwoord: e.target.value })}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Voer uw wachtwoord in"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-700 text-sm">{error}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Inloggen...
                </>
              ) : (
                "Inloggen"
              )}
            </Button>
          </form>

          {/* Demo Accounts */}
          <div className="pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center mb-3">Demo accounts voor testen:</p>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleDemoLogin("admin", "admin123")}
                className="text-xs hover:bg-purple-50 hover:border-purple-300 transition-colors"
              >
                <Shield className="w-3 h-3 mr-1" />
                Admin Demo
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleDemoLogin("jdoe", "klant123")}
                className="text-xs hover:bg-blue-50 hover:border-blue-300 transition-colors"
              >
                <User className="w-3 h-3 mr-1" />
                Klant Demo
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes spin-slow {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-delay-1 {
          animation: float 6s ease-in-out infinite;
          animation-delay: 2s;
        }
        .animate-float-delay-2 {
          animation: float 6s ease-in-out infinite;
          animation-delay: 4s;
        }
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
      `}</style>
    </div>
  )
}
