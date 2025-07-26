"use client"

import { useState } from "react"
import { useActionState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Mail, Lock, Loader2 } from "lucide-react"
import { loginAction } from "@/app/actions/auth"

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [state, action, isPending] = useActionState(loginAction, null)

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

      {/* Error Message */}
      {state?.error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">{state.error}</div>
      )}

      {/* Login Form */}
      <form action={action} className="space-y-6">
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
                className="pl-10 h-12 border-slate-200 focus:border-[#2069ff] focus:ring-[#2069ff] rounded-xl"
                placeholder="je@email.com"
                disabled={isPending}
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
                className="pl-10 pr-10 h-12 border-slate-200 focus:border-[#2069ff] focus:ring-[#2069ff] rounded-xl"
                placeholder="••••••••"
                disabled={isPending}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                disabled={isPending}
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
              disabled={isPending}
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-700">
              Onthoud mij
            </label>
          </div>
          <a href="#" className="text-sm text-[#2069ff] hover:text-[#1557d4] font-medium transition-colors">
            Wachtwoord vergeten?
          </a>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isPending}
          className="w-full h-12 bg-gradient-to-r from-[#2069ff] to-[#1557d4] hover:from-[#1557d4] hover:to-[#0f4cb8] text-white font-semibold rounded-xl shadow-[0_4px_16px_rgba(32,105,255,0.3)] hover:shadow-[0_6px_20px_rgba(32,105,255,0.4)] transition-all duration-300 transform hover:translate-y-[-1px]"
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Bezig met inloggen...
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
          <a href="#" className="text-[#2069ff] hover:text-[#1557d4] font-medium transition-colors">
            Registreer hier
          </a>
        </p>
      </div>
    </div>
  )
}
