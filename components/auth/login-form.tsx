"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const supabase = createClient()

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        toast({
          variant: "destructive",
          title: "Fout bij inloggen",
          description: error.message,
        })
        return
      }

      if (data.user) {
        // Get user profile to determine redirect
        const { data: profile } = await supabase.from("profiles").select("user_type").eq("id", data.user.id).single()

        toast({
          title: "Succesvol ingelogd",
          description: "Je wordt doorgestuurd naar je dashboard...",
        })

        // Redirect based on user type
        if (profile?.user_type === "admin") {
          router.push("/admin")
        } else {
          router.push("/customer")
        }
        router.refresh()
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Fout",
        description: "Er is een onverwachte fout opgetreden",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Inloggen</CardTitle>
        <CardDescription>Voer je e-mailadres en wachtwoord in om in te loggen</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">E-mailadres</Label>
            <Input
              id="email"
              type="email"
              placeholder="je@voorbeeld.nl"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Wachtwoord</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Inloggen...
              </>
            ) : (
              "Inloggen"
            )}
          </Button>
        </form>
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Nog geen account?{" "}
            <a href="/signup" className="text-blue-600 hover:underline">
              Registreer hier
            </a>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
