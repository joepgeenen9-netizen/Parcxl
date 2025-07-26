"use client"

import type React from "react"

import { useState } from "react"
import { CustomerNavbar } from "./customer-navbar"
import { CustomerSidebar } from "./customer-sidebar"
import { MobileSidebarOverlay } from "./mobile-sidebar-overlay"
import { BackgroundElements } from "./background-elements"

interface CustomerUser {
  id: string
  name: string
  email: string
  company?: string
}

interface CustomerLayoutProps {
  children: React.ReactNode
  user: CustomerUser
}

export function CustomerLayout({ children, user }: CustomerLayoutProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  const handleMobileMenuClick = () => {
    setIsMobileSidebarOpen(true)
  }

  const handleMobileSidebarClose = () => {
    setIsMobileSidebarOpen(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 relative overflow-hidden">
      <BackgroundElements />

      {/* Desktop Sidebar */}
      <div className="hidden lg:block fixed left-0 top-0 h-full w-[280px] bg-white/95 backdrop-blur-[20px] border-r border-[#2069ff]/20 shadow-[0_0_50px_rgba(32,105,255,0.15)] z-30">
        <CustomerSidebar user={user} />
      </div>

      {/* Mobile Sidebar Overlay */}
      <MobileSidebarOverlay isOpen={isMobileSidebarOpen} onClose={handleMobileSidebarClose}>
        <CustomerSidebar user={user} isMobile={true} />
      </MobileSidebarOverlay>

      {/* Main Content */}
      <div className="lg:ml-[280px] min-h-screen flex flex-col">
        <CustomerNavbar user={user} onMenuClick={handleMobileMenuClick} />
        <main className="flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
