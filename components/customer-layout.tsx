"use client"

import type React from "react"

import { CustomerSidebar } from "./customer-sidebar"
import { CustomerNavbar } from "./customer-navbar"
import { MobileSidebarOverlay } from "./mobile-sidebar-overlay"
import { BackgroundElements } from "./background-elements"
import { useState } from "react"
import type { User } from "@/lib/auth"

interface CustomerLayoutProps {
  children: React.ReactNode
  user: User
}

export function CustomerLayout({ children, user }: CustomerLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative">
      <BackgroundElements />

      <div className="flex h-screen relative z-10">
        <CustomerSidebar user={user} />

        <div className="flex-1 flex flex-col overflow-hidden">
          <CustomerNavbar user={user} onMenuClick={() => setSidebarOpen(true)} />

          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
      </div>

      <MobileSidebarOverlay isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} user={user} />
    </div>
  )
}
