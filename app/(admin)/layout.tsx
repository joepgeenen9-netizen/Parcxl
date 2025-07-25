"use client"

import type React from "react"

import { AppSidebar } from "@/components/app-sidebar"
import { TopBar } from "@/components/top-bar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen w-full">
      <SidebarProvider>
        <div className="flex min-h-screen w-full bg-white">
          <AppSidebar />
          <SidebarInset className="flex-1 flex flex-col min-h-screen w-full">
            <TopBar />
            {children}
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  )
}
