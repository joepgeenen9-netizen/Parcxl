"use client"

import type React from "react"
import { useState } from "react"
import { AdminSidebar } from "./admin-sidebar"
import { AdminNavbar } from "./admin-navbar"
import { BackgroundElements } from "./background-elements"
import { MobileSidebarOverlay } from "./mobile-sidebar-overlay"

interface AdminUser {
  id: string
  name: string
  email: string
  role: string
}

interface AdminLayoutProps {
  user: AdminUser
  children: React.ReactNode
  searchPlaceholder?: string
}

export function AdminLayout({ user, children, searchPlaceholder = "Zoek klanten, zendingen..." }: AdminLayoutProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-slate-50">
      <div
        className="min-h-screen bg-white text-slate-900 overflow-x-hidden lg:transform lg:origin-top-left lg:scale-[0.98]"
        style={{ width: "100%", height: "100%" }}
      >
        <BackgroundElements />

        <div className="flex h-screen relative">
          {/* Desktop Sidebar */}
          <div className="hidden lg:flex w-[280px] bg-white/95 backdrop-blur-[20px] border-r border-[#2069ff]/20 relative z-10 shadow-[0_0_50px_rgba(32,105,255,0.15)] flex-col h-full">
            <AdminSidebar user={user} />
          </div>

          {/* Mobile Sidebar Overlay */}
          <MobileSidebarOverlay isOpen={isMobileSidebarOpen} onClose={() => setIsMobileSidebarOpen(false)}>
            <AdminSidebar user={user} isMobile={true} />
          </MobileSidebarOverlay>

          {/* Main Content */}
          <div className="flex-1 bg-white relative z-[5] flex flex-col h-full overflow-hidden">
            <AdminNavbar
              user={user}
              onMenuClick={() => setIsMobileSidebarOpen(true)}
              searchPlaceholder={searchPlaceholder}
            />

            <div className="flex-1 p-3 sm:p-4 lg:p-10 bg-slate-50 overflow-y-auto pb-safe">
              <div className="pb-16 sm:pb-20 md:pb-12 max-w-full">{children}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminLayout
