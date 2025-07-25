"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Package, Users, Settings, User, LogOut, Building2 } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarFooter,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useSidebar } from "@/components/ui/sidebar"
import { performSecureLogout } from "@/lib/auth-utils"
import { useState } from "react"

const menuItems = [
  {
    title: "Home",
    icon: LayoutDashboard,
    href: "/dashboard/superadmin",
  },
  {
    title: "Users",
    icon: Users,
    href: "/admin/users",
  },
  {
    title: "Tenants",
    icon: Building2,
    href: "/admin/tenants",
  },
  {
    title: "Inventory",
    icon: Package,
    href: "/inventory",
  },
  {
    title: "Settings",
    icon: Settings,
    href: "/admin/settings",
  },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { toast } = useToast()
  const { isMobile, setOpenMobile } = useSidebar()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/"
    }
    return pathname.startsWith(href)
  }

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

  const handleNavClick = () => {
    if (isMobile) {
      setOpenMobile(false)
    }
  }

  return (
    <Sidebar
      className="border-r border-gray-200 w-64 font-poppins"
      style={
        isMobile
          ? {
              backgroundColor: "white",
              borderRight: "1px solid #e5e7eb",
              fontFamily: "Poppins, sans-serif",
            }
          : {
              fontFamily: "Poppins, sans-serif",
            }
      }
    >
      <div className={isMobile ? "bg-white h-full" : ""} style={{ fontFamily: "Poppins, sans-serif" }}>
        <SidebarHeader
          className="p-6 border-b border-gray-100"
          style={
            isMobile
              ? { backgroundColor: "white", fontFamily: "Poppins, sans-serif" }
              : { fontFamily: "Poppins, sans-serif" }
          }
        >
          <div className="flex items-center justify-center">
            {isMobile ? (
              <div className="relative w-16 h-16 transform hover:scale-110 transition-transform duration-300 ease-out">
                <Image
                  src="/packway-icon.png"
                  alt="Packway"
                  fill
                  className="object-contain rounded-2xl shadow-lg shadow-blue-500/20"
                />
              </div>
            ) : (
              <div className="relative w-12 h-12 md:h-16 md:w-40">
                <Image src="/packway-logo.webp" alt="Packway" fill className="object-contain" />
              </div>
            )}
          </div>
        </SidebarHeader>

        <SidebarContent
          className="p-4"
          style={
            isMobile
              ? { backgroundColor: "white", fontFamily: "Poppins, sans-serif" }
              : { fontFamily: "Poppins, sans-serif" }
          }
        >
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-3">
                {menuItems.map((item, index) => {
                  const active = isActive(item.href)
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={active}
                        className={`
                          w-full justify-start rounded-2xl transition-all duration-300 ease-out transform hover:scale-105
                          ${isMobile ? "h-16 px-6 py-4" : "px-3 md:px-4 py-2 md:py-3"}
                          ${
                            active
                              ? "bg-[#E9F2FF] text-[#0065FF] font-bold shadow-lg shadow-blue-500/20 scale-105"
                              : "text-gray-700 hover:bg-gray-50 hover:text-gray-900 hover:shadow-md"
                          }
                        `}
                        style={{
                          animationDelay: `${index * 100}ms`,
                          animation: isMobile ? "slideInLeft 0.5s ease-out forwards" : "none",
                          backgroundColor: isMobile && !active ? "white" : undefined,
                          fontFamily: "Poppins, sans-serif",
                        }}
                      >
                        <Link
                          href={item.href}
                          className="flex items-center gap-4 w-full font-poppins"
                          onClick={handleNavClick}
                        >
                          <item.icon className={`${isMobile ? "w-6 h-6" : "w-4 h-4 md:w-5 md:h-5"} flex-shrink-0`} />
                          <span
                            className={`${isMobile ? "text-lg" : "text-sm md:text-base"} font-semibold font-poppins`}
                          >
                            {item.title}
                          </span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        {/* Mobile Footer - Simplified */}
        <SidebarFooter
          className={`${isMobile ? "block" : "hidden"} p-6 border-t border-gray-100`}
          style={
            isMobile
              ? { backgroundColor: "white", fontFamily: "Poppins, sans-serif" }
              : { fontFamily: "Poppins, sans-serif" }
          }
        >
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              size="lg"
              asChild
              className="rounded-2xl border-gray-200 h-14 bg-white hover:bg-gray-50 transition-all duration-300 hover:scale-105 hover:shadow-md font-poppins font-semibold disabled:opacity-50"
              onClick={handleNavClick}
            >
              <Link href="/admin/profile" className="flex items-center justify-center gap-2">
                <User className="w-4 h-4" />
                <span className="text-sm font-semibold font-poppins">Profiel</span>
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={handleSignOut}
              disabled={isLoggingOut}
              className="rounded-2xl border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 h-14 transition-all duration-300 hover:scale-105 hover:shadow-md bg-white font-poppins font-semibold disabled:opacity-50"
            >
              <div className="flex items-center justify-center gap-2">
                <LogOut className="w-4 h-4" />
                <span className="text-sm font-semibold font-poppins">
                  {isLoggingOut ? "Uitloggen..." : "Uitloggen"}
                </span>
              </div>
            </Button>
          </div>
        </SidebarFooter>
      </div>

      <SidebarRail />

      {/* Add custom CSS for animations */}
      <style jsx>{`
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </Sidebar>
  )
}
