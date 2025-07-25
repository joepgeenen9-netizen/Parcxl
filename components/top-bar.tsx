"use client"

import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { LogOut, User } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { useSidebar } from "@/components/ui/sidebar"
import { performSecureLogout } from "@/lib/auth-utils"
import { useState } from "react"

export function TopBar() {
  const { toast } = useToast()
  const { isMobile } = useSidebar()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleSignOut = async () => {
    if (isLoggingOut) return

    setIsLoggingOut(true)

    try {
      toast({
        title: "Uitloggen...",
        description: "Je wordt uitgelogd.",
      })

      // Perform secure logout with hard redirect
      await performSecureLogout()
    } catch (error) {
      console.error("Logout error:", error)
      // Force redirect even on error
      window.location.href = "/login"
    }
  }

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 bg-white font-poppins">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />

      {/* Desktop Actions */}
      <div className={`${isMobile ? "hidden" : "flex"} ml-auto items-center gap-2`}>
        <Button
          variant="outline"
          size="sm"
          asChild
          className="rounded-2xl border-gray-200 bg-white hover:bg-gray-50 transition-all duration-300 hover:scale-105 hover:shadow-md font-poppins font-semibold"
        >
          <Link href="/admin/profile" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            <span className="text-sm font-semibold font-poppins">Profiel</span>
          </Link>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleSignOut}
          disabled={isLoggingOut}
          className="rounded-2xl border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 transition-all duration-300 hover:scale-105 hover:shadow-md bg-white font-poppins font-semibold disabled:opacity-50"
        >
          <LogOut className="w-4 h-4 mr-2" />
          <span className="text-sm font-semibold font-poppins">{isLoggingOut ? "Uitloggen..." : "Uitloggen"}</span>
        </Button>
      </div>
    </header>
  )
}
