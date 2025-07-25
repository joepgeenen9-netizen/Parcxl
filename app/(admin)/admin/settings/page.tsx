"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Save, Loader2, Eye, EyeOff, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"
import { getSetting, upsertSetting } from "./actions"

export default function SettingsPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showToken, setShowToken] = useState(false)
  const [hostingerToken, setHostingerToken] = useState("")
  const [hasExistingToken, setHasExistingToken] = useState(false)

  // Check authentication and authorization
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session) {
          router.push("/login")
          return
        }

        // Check if user is super-admin
        const { data: superAdmin } = await supabase.from("super_admins").select("id").eq("id", session.user.id).single()

        if (!superAdmin) {
          router.push("/login")
          return
        }

        await loadSettings()
      } catch (error) {
        console.error("Auth check error:", error)
        router.push("/login")
      }
    }

    checkAuth()
  }, [router])

  const loadSettings = async () => {
    try {
      setLoading(true)

      // Load Hostinger token
      const tokenResult = await getSetting("HOSTINGER_TOKEN")
      if (tokenResult.success && tokenResult.value) {
        setHasExistingToken(true)
        setHostingerToken("*".repeat(20)) // Show masked token
      }
    } catch (error) {
      console.error("Error loading settings:", error)
      toast({
        title: "Fout",
        description: "Kon instellingen niet laden",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSaveHostingerToken = async () => {
    if (!hostingerToken.trim()) {
      toast({
        title: "Fout",
        description: "Vul een geldige API token in",
        variant: "destructive",
      })
      return
    }

    // Don't save if it's just the masked value
    if (hostingerToken.startsWith("*")) {
      toast({
        title: "Geen wijzigingen",
        description: "Token is niet gewijzigd",
      })
      return
    }

    setSaving(true)
    try {
      const result = await upsertSetting("HOSTINGER_TOKEN", hostingerToken)

      if (result.success) {
        toast({
          title: "Opgeslagen",
          description: result.message,
        })
        setHasExistingToken(true)
        setHostingerToken("*".repeat(20)) // Mask the token again
        setShowToken(false)
      } else {
        toast({
          title: "Fout",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Fout",
        description: "Er is een onverwachte fout opgetreden",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleTokenInputChange = (value: string) => {
    setHostingerToken(value)
    // If user starts typing and it was masked, clear it
    if (hasExistingToken && hostingerToken.startsWith("*") && value !== hostingerToken) {
      setHostingerToken(value)
    }
  }

  const toggleTokenVisibility = () => {
    if (!showToken && hasExistingToken) {
      // When showing, clear the masked value so user can enter new token
      setHostingerToken("")
    } else if (showToken && hasExistingToken && !hostingerToken) {
      // When hiding and no new value entered, restore masked value
      setHostingerToken("*".repeat(20))
    }
    setShowToken(!showToken)
  }

  if (loading) {
    return (
      <div className="flex-1 p-4 md:p-6 bg-gray-50 min-h-0 overflow-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#0065FF] mx-auto mb-4" />
            <p className="text-gray-600">Instellingen laden...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 p-4 md:p-6 bg-gray-50 min-h-0 overflow-auto">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-2" style={{ fontFamily: "Poppins" }}>
            Instellingen
          </h1>
          <p className="text-sm md:text-base text-gray-600">Beheer systeem configuratie en API tokens.</p>
        </div>

        {/* Hostinger API Token Card */}
        <Card className="rounded-2xl border-gray-200 shadow-sm mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Hostinger API Token
            </CardTitle>
            <CardDescription>
              API token voor Hostinger integratie. Deze wordt gebruikt voor domein management en DNS configuratie.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="hostinger_token">API Token</Label>
              <div className="relative">
                <Input
                  id="hostinger_token"
                  type={showToken ? "text" : "password"}
                  value={hostingerToken}
                  onChange={(e) => handleTokenInputChange(e.target.value)}
                  className="rounded-2xl pr-10"
                  placeholder={hasExistingToken ? "••••••••••••••••••••" : "Voer je Hostinger API token in"}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={toggleTokenVisibility}
                >
                  {showToken ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
                </Button>
              </div>
              {hasExistingToken && (
                <p className="text-xs text-gray-500">
                  Er is al een token opgeslagen. Voer een nieuwe token in om deze te vervangen.
                </p>
              )}
            </div>

            <div className="flex items-center gap-4">
              <Button
                onClick={handleSaveHostingerToken}
                disabled={saving}
                className="rounded-2xl bg-[#0065FF] hover:bg-[#0052CC] shadow-lg shadow-blue-500/25"
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Bezig met opslaan...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Opslaan
                  </>
                )}
              </Button>

              {hasExistingToken && (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  Token geconfigureerd
                </div>
              )}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
              <h4 className="text-sm font-medium text-blue-900 mb-2">Hoe krijg je een Hostinger API token?</h4>
              <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                <li>Log in op je Hostinger account</li>
                <li>Ga naar API sectie in je dashboard</li>
                <li>Genereer een nieuwe API token</li>
                <li>Kopieer de token en plak deze hier</li>
              </ol>
            </div>
          </CardContent>
        </Card>

        {/* Future Settings Cards */}
        <Card className="rounded-2xl border-gray-200 shadow-sm opacity-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Meer instellingen
            </CardTitle>
            <CardDescription>Aanvullende configuratie opties komen hier beschikbaar.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500 text-sm">Binnenkort beschikbaar...</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
