"use client"

import { Button } from "@/components/ui/button"
import { Bell, Search, User, LogOut, Settings, Menu } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface AdminNavbarProps {
  user: {
    id: string
    first_name: string | null
    last_name: string | null
    email: string
    user_type: "customer" | "admin"
  }
  onMenuClick: () => void
  searchPlaceholder?: string
}

export function AdminNavbar({
  user,
  onMenuClick,
  searchPlaceholder = "Zoek gebruikers, zendingen...",
}: AdminNavbarProps) {
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      toast.success("Succesvol uitgelogd")
      router.push("/login")
    } catch (error) {
      console.error("Logout error:", error)
      toast.error("Fout bij uitloggen")
    }
  }

  const displayName = user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : user.email

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center lg:hidden">
              <Button variant="ghost" size="sm" onClick={onMenuClick}>
                <Menu className="h-6 w-6" />
              </Button>
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center px-2 lg:ml-6 lg:justify-end">
            <div className="max-w-lg w-full lg:max-w-xs">
              <label htmlFor="search" className="sr-only">
                Search
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  id="search"
                  name="search"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                  placeholder={searchPlaceholder}
                  type="search"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center lg:ml-6">
            {/* Admin badge */}
            <Badge variant="secondary" className="bg-purple-100 text-purple-700 mr-4">
              Admin
            </Badge>

            <Button variant="ghost" size="sm" className="p-1 relative">
              <Bell className="h-6 w-6" />
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                3
              </span>
            </Button>

            {/* Profile dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="ml-3 relative">
                  <div className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500">
                    <div className="h-8 w-8 rounded-full bg-purple-500 flex items-center justify-center">
                      <span className="text-sm font-medium text-white">
                        {user.first_name ? user.first_name[0].toUpperCase() : user.email[0].toUpperCase()}
                      </span>
                    </div>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium text-gray-900">{displayName}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profiel</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Instellingen</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Bell className="mr-2 h-4 w-4" />
                  <span>Notificaties</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Uitloggen</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  )
}
