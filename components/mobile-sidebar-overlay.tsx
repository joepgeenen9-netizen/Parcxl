"use client"

import type React from "react"
import { cn } from "@/lib/utils"

interface MobileSidebarOverlayProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
}

export function MobileSidebarOverlay({ isOpen, onClose, children }: MobileSidebarOverlayProps) {
  if (!isOpen) return null

  return (
    <div className="lg:hidden">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onClose} />

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 w-64 bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {children}
      </div>
    </div>
  )
}
