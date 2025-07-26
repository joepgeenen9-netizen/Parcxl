"use client"

import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { logoutAction } from "@/app/actions/auth"
import { useTransition } from "react"

export function LogoutButton() {
  const [isPending, startTransition] = useTransition()

  const handleLogout = () => {
    startTransition(async () => {
      await logoutAction()
    })
  }

  return (
    <Button
      onClick={handleLogout}
      disabled={isPending}
      variant="ghost"
      size="sm"
      className="text-slate-600 hover:text-slate-900"
    >
      <LogOut className="w-4 h-4 mr-2" />
      {isPending ? "Uitloggen..." : "Uitloggen"}
    </Button>
  )
}
