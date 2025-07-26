"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Loader2, Mail, Lock } from "lucide-react"
import { loginAction } from "@/app/actions/auth"

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleSubmit = async (formData: FormData) => {
    setError("")

    startTransition(async () => {
      const result = await loginAction(formData)

      if (result.success) {
        // Refresh the page to trigger middleware redirect
        window.location.href = "/"
      } else if (result.error) {
        setError(result.error)
      }
    })
  }

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/20">
      <form action={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-slate-700">
            Email adres
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <Input
              id="email"
              name="email"
              type="email"
              required
              placeholder="je@email.com"
              className="pl-10 h-12 bg-white/50 border-slate-200 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium text-slate-700">
            Wachtwoord
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              placeholder="••••••••"
              className="pl-10 pr-10 h-12 bg-white/50 border-slate-200 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <Button
          type="submit"
          disabled={isPending}
          className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isPending ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Bezig met inloggen...
            </>
          ) : (
            "Inloggen"
          )}
        </Button>

        <div className="text-center">
          <button type="button" className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors">
            Wachtwoord vergeten?
          </button>
        </div>
      </form>
    </div>
  )
}
