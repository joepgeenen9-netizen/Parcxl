"use client"

import type React from "react"

import { useState } from "react"
import { AdminSidebar } from "./admin-sidebar"
import { AdminNavbar } from "./admin-navbar"
import { BackgroundElements } from "./background-elements"
import { MobileSidebarOverlay } from "./mobile-sidebar-overlay"

interface AdminLayoutProps {
  children: React.ReactNode
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 relative overflow-hidden">
      <BackgroundElements />

      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <AdminSidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      <MobileSidebarOverlay isOpen={isMobileSidebarOpen} onClose={() => setIsMobileSidebarOpen(false)}>
        <AdminSidebar />
      </MobileSidebarOverlay>

      {/* Main Content */}
      <div className="lg:ml-64">
        <AdminNavbar onMobileMenuClick={() => setIsMobileSidebarOpen(true)} />
        <main className="relative z-10">{children}</main>
      </div>
    </div>
  )
}

export default AdminLayout
