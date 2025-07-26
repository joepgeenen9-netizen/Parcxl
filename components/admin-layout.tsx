"use client"

import type React from "react"

import { useState } from "react"
import { AdminSidebar } from "./admin-sidebar"
import { AdminNavbar } from "./admin-navbar"
import { MobileSidebarOverlay } from "./mobile-sidebar-overlay"

interface AdminLayoutProps {
  children: React.ReactNode
  user: {
    id: string
    first_name: string | null
    last_name: string | null
    email: string
    user_type: "customer" | "admin"
  }
  searchPlaceholder?: string
}

export function AdminLayout({ children, user, searchPlaceholder = "Zoeken..." }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      <MobileSidebarOverlay isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)}>
        <AdminSidebar />
      </MobileSidebarOverlay>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <AdminSidebar />
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        <AdminNavbar user={user} onMenuClick={() => setSidebarOpen(true)} searchPlaceholder={searchPlaceholder} />
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>
    </div>
  )
}
