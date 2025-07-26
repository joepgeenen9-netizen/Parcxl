"use client"

import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { logoutAction } from "@/app/actions/auth"

export function LogoutButton() {
  return (
    <form action={logoutAction}>
      <Button variant="ghost" size="sm" type="submit">
        <LogOut className="w-4 h-4 mr-2" />
        Uitloggen
      </Button>
    </form>
  )
}
