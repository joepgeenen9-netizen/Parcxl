"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { X } from "lucide-react"

interface MobileSidebarOverlayProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
}

export function MobileSidebarOverlay({ isOpen, onClose, children }: MobileSidebarOverlayProps) {
  const [isAnimating, setIsAnimating] = useState(false)
  const [shouldRender, setShouldRender] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true)
      setIsAnimating(true)
      document.body.style.overflow = "hidden"
      document.body.style.position = "fixed"
      document.body.style.width = "100%"
      document.body.style.top = "0"
      setTimeout(() => setIsAnimating(false), 100)
    } else {
      setIsAnimating(true)
      document.body.style.overflow = "unset"
      document.body.style.position = "unset"
      document.body.style.width = "unset"
      document.body.style.top = "unset"
      const timer = setTimeout(() => {
        setShouldRender(false)
        setIsAnimating(false)
      }, 600)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  if (!shouldRender) return null

  return (
    <div className="fixed inset-0 z-[9999] lg:hidden">
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm transition-all duration-500 ease-out ${
          isOpen && !isAnimating ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
        style={{ touchAction: "none" }}
      />
      <div
        className={`fixed left-0 top-0 h-full w-[85vw] max-w-[320px] bg-white/95 backdrop-blur-[20px] border-r border-[#2069ff]/20 shadow-[0_0_50px_rgba(32,105,255,0.15)] transform transition-all duration-500 ease-out flex flex-col ${
          isOpen && !isAnimating ? "translate-x-0 opacity-100" : "-translate-x-full opacity-80"
        }`}
        style={{
          willChange: "transform, opacity, scale",
          backfaceVisibility: "hidden",
          transformOrigin: "left center",
          height: "100vh",
          height: "100dvh",
          touchAction: "pan-y",
          overscrollBehavior: "contain",
        }}
      >
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 w-12 h-12 rounded-xl bg-slate-100/80 hover:bg-slate-200/80 active:bg-slate-300/80 flex items-center justify-center transition-all duration-300 z-10 hover:scale-105 active:scale-95 backdrop-blur-sm border border-slate-200/50 touch-manipulation ${
            isOpen && !isAnimating ? "opacity-100 translate-y-0" : "opacity-0 translate-y-[-10px]"
          }`}
          style={{
            transitionDelay: isOpen ? "200ms" : "0ms",
            minHeight: "48px",
            minWidth: "48px",
          }}
        >
          <X className="w-5 h-5 text-slate-600" />
        </button>
        <div
          className={`h-full transition-all duration-400 ease-out overflow-y-auto overscroll-contain ${
            isOpen && !isAnimating ? "opacity-100 translate-x-0" : "opacity-0 translate-x-[-20px]"
          }`}
          style={{
            transitionDelay: isOpen ? "150ms" : "0ms",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  )
}
