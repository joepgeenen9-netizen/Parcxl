"use client"

import type React from "react"
import { useEffect } from "react"

interface MobileSidebarOverlayProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
}

export function MobileSidebarOverlay({ isOpen, onClose, children }: MobileSidebarOverlayProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }

    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="lg:hidden fixed inset-0 z-50">
      {/* Backdrop with fade animation */}
      <div
        className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ease-out ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      {/* Sidebar with slide animation */}
      <div
        className={`absolute left-0 top-0 h-full w-[280px] bg-white/95 backdrop-blur-[20px] border-r border-[#2069ff]/20 shadow-[0_0_50px_rgba(32,105,255,0.15)] transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {children}
      </div>
    </div>
  )
}
