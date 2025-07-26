"use client"

import { LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { logoutAction } from "@/app/actions/auth"

export function LogoutButton() {
  return (
    <form action={logoutAction}>
      <Button
        type="submit"
        variant="ghost"
        size="sm"
        className="text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
      >
        <LogOut className="w-4 h-4 mr-2" />
        Uitloggen
      </Button>
    </form>
  )
}
