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
        // Sla user data op in localStorage
        localStorage.setItem("user", JSON.stringify(data.user))

        // Redirect op basis van rol
        if (data.user.rol === "admin") {
          router.push("/admin-dashboard")
        } else {
          router.push("/customer-dashboard")
        }
      } else {
        setError(data.error || "Er is een fout opgetreden bij het inloggen")
      }
    } catch (error) {
      setError("Netwerkfout. Probeer het opnieuw.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDemoLogin = (type: "admin" | "klant") => {
    if (type === "admin") {
      setFormData({
        gebruikersnaam: "admin",
        wachtwoord: "admin123",
      })
    } else {
      setFormData({
        gebruikersnaam: "jdoe",
        wachtwoord: "klant123",
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Floating packages animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <Package className="absolute top-20 left-20 w-8 h-8 text-blue-300 opacity-30 animate-float" />
        <Package className="absolute top-40 right-32 w-6 h-6 text-purple-300 opacity-40 animate-float-delayed" />
        <Package className="absolute bottom-32 left-32 w-10 h-10 text-pink-300 opacity-20 animate-float-slow" />
        <Package className="absolute bottom-20 right-20 w-7 h-7 text-blue-400 opacity-35 animate-float" />
      </div>

      <Card className="w-full max-w-md relative z-10 backdrop-blur-sm bg-white/80 border-0 shadow-2xl">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Image
                src="/images/parcxl-logo.png"
                alt="Parcxl Logo"
                width={120}
                height={60}
                className="object-contain"
              />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Welkom bij Parcxl
          </CardTitle>
          <CardDescription className="text-gray-600">Log in om toegang te krijgen tot uw dashboard</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertDescription className="text-red-700">{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="gebruikersnaam" className="text-sm font-medium text-gray-700">
                Gebruikersnaam
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="gebruikersnaam"
                  type="text"
                  value={formData.gebruikersnaam}
                  onChange={(e) => setFormData({ ...formData, gebruikersnaam: e.target.value })}
                  className="pl-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Voer uw gebruikersnaam in"
                  required
                />
              </div>
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
                  className="pr-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Voer uw wachtwoord in"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-2.5 transition-all duration-200 transform hover:scale-[1.02]"
              disabled={isLoading}
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

          {/* Demo accounts */}
          <div className="pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600 text-center mb-3">Demo accounts:</p>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleDemoLogin("admin")}
                className="flex-1 text-xs border-purple-200 text-purple-700 hover:bg-purple-50"
              >
                <Shield className="w-3 h-3 mr-1" />
                Admin
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleDemoLogin("klant")}
                className="flex-1 text-xs border-blue-200 text-blue-700 hover:bg-blue-50"
              >
                <User className="w-3 h-3 mr-1" />
                Klant
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 4s ease-in-out infinite;
        }
        .animate-float-slow {
          animation: float-slow 5s ease-in-out infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  )
}
