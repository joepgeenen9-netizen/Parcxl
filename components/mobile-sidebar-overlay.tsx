"use client"

import type React from "react"
import { useEffect, useState } from "react"

interface MobileSidebarOverlayProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
}

export function MobileSidebarOverlay({ isOpen, onClose, children }: MobileSidebarOverlayProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
      setIsAnimating(true)
      document.body.style.overflow = "hidden"

      // Start the slide-in animation after the overlay is visible
      setTimeout(() => {
        setIsAnimating(false)
      }, 10)
    } else {
      setIsAnimating(true)

      // Wait for slide-out animation to complete before hiding
      setTimeout(() => {
        setIsVisible(false)
        setIsAnimating(false)
        document.body.style.overflow = "unset"
      }, 300)
    }

    return () => {
      if (!isOpen) {
        document.body.style.overflow = "unset"
      }
    }
  }, [isOpen])

  if (!isVisible) return null

  return (
    <div className="lg:hidden fixed inset-0 z-50">
      {/* Backdrop with fade animation */}
      <div
        className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
          isAnimating ? "opacity-0" : "opacity-100"
        }`}
        onClick={onClose}
      />

      {/* Sidebar with slide animation */}
      <div
        className={`absolute left-0 top-0 h-full w-[280px] bg-white/95 backdrop-blur-[20px] border-r border-[#2069ff]/20 shadow-[0_0_50px_rgba(32,105,255,0.15)] transition-transform duration-300 ease-out ${
          isAnimating ? "transform -translate-x-full" : "transform translate-x-0"
        }`}
      >
        {children}
      </div>
    </div>
  )
}
