"use client"

import type React from "react"
import { CustomerSidebar } from "./customer-sidebar"
import { CustomerNavbar } from "./customer-navbar"

interface CustomerLayoutProps {
  children: React.ReactNode
}

export function CustomerLayout({ children }: CustomerLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <CustomerSidebar />
      <div className="lg:pl-64">
        <CustomerNavbar />
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}
