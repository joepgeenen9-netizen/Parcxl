"use client"

import { useState } from "react"
import { Menu, ChevronDown, User, LogOut, Bell } from "lucide-react"
import { useRouter } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface CustomerUser {
  id: string
  name: string
  email: string
  company?: string
}

interface CustomerNavbarProps {
  user: CustomerUser
  onMenuClick: () => void
  searchPlaceholder?: string
}

export function CustomerNavbar({ user, onMenuClick, searchPlaceholder = "Zoek zendingen..." }: CustomerNavbarProps) {
  const [isMenuPressed, setIsMenuPressed] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const router = useRouter()

  const handleMenuClick = () => {
    setIsMenuPressed(true)
    setTimeout(() => setIsMenuPressed(false), 250)
    onMenuClick()
  }

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)

      if (typeof window !== "undefined") {
        localStorage.clear()
        sessionStorage.clear()

        const cookies = document.cookie.split(";")
        for (const cookie of cookies) {
          const eqPos = cookie.indexOf("=")
          const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim()
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`
        }

        window.location.replace("/login")
      }
    } catch (error) {
      console.error("Logout error:", error)
      if (typeof window !== "undefined") {
        window.location.replace("/login")
      }
    }
  }

  const handleEditProfile = () => {
    router.push("/dashboard/profiel")
  }

  return (
    <div className="bg-white/95 backdrop-blur-[20px] border-b border-[#2069ff]/[0.08] px-4 lg:px-8 py-4 lg:py-6 sticky top-0 z-20 shadow-[0_1px_10px_rgba(32,105,255,0.05)]">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button
            onClick={handleMenuClick}
            className={`lg:hidden w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-50/80 to-white/80 border border-[#2069ff]/10 flex items-center justify-center cursor-pointer transition-all duration-350 hover:bg-gradient-to-br hover:from-[#2069ff]/[0.05] hover:to-[#2069ff]/[0.08] hover:border-[#2069ff]/20 hover:scale-105 hover:shadow-[0_4px_15px_rgba(32,105,255,0.1)] active:scale-95 backdrop-blur-sm ${
              isMenuPressed
                ? "bg-gradient-to-br from-[#2069ff]/10 to-[#2069ff]/15 border-[#2069ff]/30 scale-95 shadow-[0_2px_8px_rgba(32,105,255,0.2)]"
                : ""
            }`}
          >
            <Menu
              className={`w-6 h-6 text-slate-600 transition-all duration-350 ${
                isMenuPressed ? "text-[#2069ff] scale-110 rotate-180" : "group-hover:text-[#2069ff]"
              }`}
            />
          </button>
          <div className="flex flex-col gap-2">{/* Empty left side */}</div>
        </div>

        <div className="flex gap-3 lg:gap-6 items-center">
          {/* Search */}
          <div className="relative w-full max-w-[200px] lg:max-w-[400px]">
            <div className="absolute left-3 lg:left-5 top-1/2 transform -translate-y-1/2 w-4 h-4 lg:w-5 lg:h-5 bg-gradient-to-br from-[#2069ff] to-[#1557d4] rounded-full transition-all duration-300 shadow-[0_2px_8px_rgba(32,105,255,0.2)]">
              <div className="absolute top-[2px] lg:top-[3px] left-[2px] lg:left-[3px] w-2 h-2 lg:w-3 lg:h-3 border-2 border-white rounded-full bg-transparent" />
              <div className="absolute bottom-[1px] lg:bottom-[2px] right-[1px] lg:right-[2px] w-[4px] lg:w-[6px] h-[1px] lg:h-[2px] bg-white rounded-[1px] transform rotate-45" />
            </div>
            <input
              type="text"
              className="w-full py-3 lg:py-4 px-4 lg:px-6 pl-10 lg:pl-14 border-2 border-[#2069ff]/15 rounded-2xl lg:rounded-[20px] bg-slate-50/80 backdrop-blur-[15px] text-sm transition-all duration-300 text-slate-900 shadow-[0_2px_10px_rgba(32,105,255,0.08)] focus:outline-none focus:border-[#2069ff] focus:bg-white/95 focus:shadow-[0_0_0_4px_rgba(32,105,255,0.12),_0_8px_25px_rgba(32,105,255,0.15)] focus:transform focus:translate-y-[-2px] focus:scale-[1.02]"
              placeholder={searchPlaceholder}
            />
          </div>

          {/* Notification */}
          <div className="relative w-10 h-10 lg:w-11 lg:h-11 rounded-xl bg-slate-50/80 border border-[#2069ff]/10 flex items-center justify-center cursor-pointer transition-all duration-300 hover:bg-[#2069ff]/[0.05] hover:border-[#2069ff]/20 hover:transform hover:translate-y-[-1px] hover:shadow-[0_4px_15px_rgba(32,105,255,0.1)]">
            <Bell className="w-4 h-4 lg:w-5 lg:h-5 text-slate-500" />
            <div className="absolute top-[-4px] right-[-4px] w-4 h-4 lg:w-[18px] lg:h-[18px] bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-[0.6rem] lg:text-[0.7rem] font-bold text-white border-2 border-white shadow-[0_2px_8px_rgba(239,68,68,0.3)]">
              3
            </div>
          </div>

          {/* Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center gap-2 lg:gap-3 py-2 px-3 lg:px-4 rounded-xl bg-slate-50/80 border border-[#2069ff]/10 cursor-pointer transition-all duration-300 hover:bg-white/90 hover:border-[#2069ff]/20 hover:shadow-[0_4px_15px_rgba(32,105,255,0.1)] hover:transform hover:translate-y-[-1px] group">
                <div className="w-8 h-8 lg:w-9 lg:h-9 rounded-full bg-gradient-to-br from-[#2069ff] to-[#1557d4] flex items-center justify-center text-white font-bold text-xs lg:text-sm shadow-[0_4px_12px_rgba(32,105,255,0.3)]">
                  {user.name.substring(0, 2).toUpperCase()}
                </div>
                <div className="hidden sm:flex flex-col">
                  <div className="font-semibold text-sm text-slate-900">{user.name}</div>
                  <div className="text-xs text-slate-500">{user.company || "Particulier"}</div>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400 transition-transform duration-200 group-data-[state=open]:rotate-180" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56 bg-white/95 backdrop-blur-[20px] border border-[#2069ff]/10 shadow-[0_8px_30px_rgba(32,105,255,0.12)] rounded-xl p-2"
              sideOffset={8}
            >
              <div className="px-3 py-2 mb-2">
                <div className="font-medium text-sm text-slate-900">{user.name}</div>
                <div className="text-xs text-slate-500">{user.email}</div>
              </div>
              <DropdownMenuSeparator className="bg-[#2069ff]/10" />
              <DropdownMenuItem
                onClick={handleEditProfile}
                className="flex items-center gap-3 px-3 py-2 text-sm text-slate-700 hover:bg-[#2069ff]/[0.05] hover:text-[#2069ff] rounded-lg cursor-pointer transition-all duration-200 focus:bg-[#2069ff]/[0.05] focus:text-[#2069ff]"
              >
                <User className="w-4 h-4" />
                Profiel bewerken
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-[#2069ff]/10" />
              <DropdownMenuItem
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg cursor-pointer transition-all duration-200 focus:bg-red-50 focus:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <LogOut className="w-4 h-4" />
                {isLoggingOut ? "Uitloggen..." : "Uitloggen"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}
