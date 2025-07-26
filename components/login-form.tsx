"use client"

import { useState, useTransition } from "react"
import { Eye, EyeOff, Mail, Lock, ArrowRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { loginAction } from "@/app/actions/auth"
import Image from "next/image"

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isPending, startTransition] = useTransition()

  const handleSubmit = async (formData: FormData) => {
    startTransition(async () => {
      setError("")
      const result = await loginAction(formData)
      if (result?.error) {
        setError(result.error)
      }
    })
  }

  return (
    <div className="relative">
      {/* Animated background elements */}
      <div className="absolute -top-20 -left-20 w-40 h-40 bg-gradient-to-br from-[#2069ff]/20 to-purple-500/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-gradient-to-br from-amber-500/20 to-[#2069ff]/20 rounded-full blur-3xl animate-pulse delay-1000" />

      <div className="bg-white/95 backdrop-blur-[20px] rounded-3xl p-8 border border-[#2069ff]/10 shadow-[0_20px_60px_rgba(32,105,255,0.15)] relative overflow-hidden">
        {/* Header gradient line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#2069ff] via-purple-500 to-amber-500" />

        {/* Logo and header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-[#2069ff] to-[#1557d4] rounded-2xl flex items-center justify-center shadow-[0_8px_24px_rgba(32,105,255,0.3)]">
            <Image src="/images/parcxl-logo.png" alt="Parcxl" width={32} height={32} className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Welkom terug</h1>
          <p className="text-slate-600">Log in op je Parcxl account</p>
        </div>

        {/* Demo credentials info */}
        <div className="mb-6 p-4 bg-blue-50/80 rounded-xl border border-blue-200/50">
          <h3 className="font-semibold text-blue-900 mb-2">Demo Accounts:</h3>
          <div className="text-sm text-blue-800 space-y-1">
            <div>
              <strong>Admin:</strong> admin@parcxl.com
            </div>
            <div>
              <strong>Klant:</strong> jan@example.com
            </div>
            <div>
              <strong>Wachtwoord:</strong> password
            </div>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {/* Login form */}
        <form action={handleSubmit} className="space-y-6">
          {/* Email field */}
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-semibold text-slate-700">
              E-mailadres
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                id="email"
                name="email"
                type="email"
                required
                placeholder="je@email.com"
                className="pl-11 h-12 border-slate-200 focus:border-[#2069ff] focus:ring-[#2069ff]/20 rounded-xl bg-slate-50/50 transition-all duration-300"
                disabled={isPending}
              />
            </div>
          </div>

          {/* Password field */}
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-semibold text-slate-700">
              Wachtwoord
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                className="pl-11 pr-11 h-12 border-slate-200 focus:border-[#2069ff] focus:ring-[#2069ff]/20 rounded-xl bg-slate-50/50 transition-all duration-300"
                disabled={isPending}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                disabled={isPending}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Login button */}
          <Button
            type="submit"
            disabled={isPending}
            className="w-full h-12 bg-gradient-to-r from-[#2069ff] to-[#1557d4] hover:from-[#1557d4] hover:to-[#0f4bc4] text-white font-semibold rounded-xl shadow-[0_8px_24px_rgba(32,105,255,0.3)] hover:shadow-[0_12px_32px_rgba(32,105,255,0.4)] transition-all duration-300 transform hover:translate-y-[-2px] relative overflow-hidden group"
          >
            {isPending ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Bezig met inloggen...
              </>
            ) : (
              <>
                Inloggen
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </>
            )}

            {/* Button shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          </Button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-slate-500">
            Problemen met inloggen?{" "}
            <a href="#" className="text-[#2069ff] hover:text-[#1557d4] font-semibold transition-colors">
              Neem contact op
            </a>
          </p>
        </div>

        {/* Floating particles animation */}
        <div className="absolute top-4 right-4 w-2 h-2 bg-[#2069ff]/30 rounded-full animate-bounce delay-300" />
        <div className="absolute bottom-8 left-6 w-1 h-1 bg-purple-500/40 rounded-full animate-bounce delay-700" />
        <div className="absolute top-1/2 right-8 w-1.5 h-1.5 bg-amber-500/30 rounded-full animate-bounce delay-1000" />
      </div>
    </div>
  )
}
