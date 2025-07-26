"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Plus, Package, FileText, BarChart3, Settings, HelpCircle } from "lucide-react"
import Image from "next/image"

interface CustomerSidebarProps {
  user: any
  isMobile?: boolean
}

export function CustomerSidebar({ user, isMobile = false }: CustomerSidebarProps) {
  const pathname = usePathname()

  const getActiveItem = (currentPath: string) => {
    if (currentPath === "/dashboard" || currentPath === "/dashboard/") {
      return "Dashboard"
    }
    if (currentPath.startsWith("/dashboard/verzenden")) {
      return "Verzenden"
    }
    if (currentPath.startsWith("/dashboard/zendingen")) {
      return "Mijn Zendingen"
    }
    if (currentPath.startsWith("/dashboard/adressen")) {
      return "Adresboek"
    }
    if (currentPath.startsWith("/dashboard/facturen")) {
      return "Facturen"
    }
    if (currentPath.startsWith("/dashboard/rapporten")) {
      return "Rapporten"
    }
    if (currentPath.startsWith("/dashboard/instellingen")) {
      return "Instellingen"
    }
    if (currentPath.startsWith("/dashboard/help")) {
      return "Help & Support"
    }
    return "Dashboard"
  }

  const [activeItem, setActiveItem] = useState(() => getActiveItem(pathname || ""))

  useEffect(() => {
    if (pathname) {
      setActiveItem(getActiveItem(pathname))
    }
  }, [pathname])

  const navItems = [
    { name: "Dashboard", badge: null, icon: LayoutDashboard, href: "/dashboard" },
    { name: "Orders", badge: "12", icon: Package, href: "/dashboard/orders" },
    { name: "Verzenden", badge: "Nieuw", icon: Plus, href: "/dashboard/verzenden" },
    { name: "Facturen", badge: "3", icon: FileText, href: "/dashboard/facturen" },
    { name: "Prijzen", badge: null, icon: BarChart3, href: "/dashboard/prijzen" },
    { name: "Integraties", badge: null, icon: Settings, href: "/dashboard/integraties" },
  ]

  const managementItems = [
    { name: "Help & Support", badge: null, icon: HelpCircle, href: "/dashboard/help" },
    { name: "Instellingen", badge: null, icon: Settings, href: "/dashboard/instellingen" },
  ]

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Left border gradient */}
      <div className="absolute top-0 left-0 w-[3px] h-full bg-gradient-to-b from-[#2069ff] to-[#1557d4] opacity-80" />

      {/* Logo container with fixed height */}
      <div
        className={`${isMobile ? "h-[56px]" : "h-[64px]"} px-4 relative border-b border-[#2069ff]/[0.08] flex-shrink-0 overflow-hidden flex items-center justify-center`}
      >
        {/* Enhanced animated background */}
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(135deg, #F0F8FF 0%, #E8F4FD 100%)",
            animation: "timedBlueTransition 26s ease-in-out infinite",
          }}
        />

        {/* Animated package elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute w-3 h-2 bg-gradient-to-br from-amber-400/50 to-amber-500/50 rounded-sm opacity-70"
            style={{
              top: "20%",
              left: "8%",
              animation: "packageFloat1 12s ease-in-out infinite",
              animationDelay: "0s",
            }}
          >
            <div className="absolute inset-0 border border-amber-600/30 rounded-sm" />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1.5 h-[1px] bg-amber-700/60" />
          </div>

          <div
            className="absolute w-2.5 h-3 bg-gradient-to-br from-blue-400/45 to-blue-500/45 rounded-sm opacity-60"
            style={{
              top: "25%",
              right: "12%",
              animation: "packageFloat2 15s ease-in-out infinite",
              animationDelay: "3s",
            }}
          >
            <div className="absolute inset-0 border border-blue-600/30 rounded-sm" />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rotate-90 w-1.5 h-[1px] bg-blue-700/60" />
          </div>

          <div
            className="absolute w-2.5 h-2.5 bg-gradient-to-br from-green-400/45 to-green-500/45 rounded-sm opacity-55"
            style={{
              bottom: "20%",
              left: "15%",
              animation: "packageFloat3 10s ease-in-out infinite",
              animationDelay: "6s",
            }}
          >
            <div className="absolute inset-0 border border-green-600/30 rounded-sm" />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1.5 h-[1px] bg-green-700/60" />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rotate-90 w-1.5 h-[1px] bg-green-700/60" />
          </div>
        </div>

        {/* Parcxl Logo */}
        <div className="relative z-10">
          <Image
            src="/images/parcxl-logo.png"
            alt="Parcxl Logo"
            width={isMobile ? 110 : 100}
            height={isMobile ? 40 : 36}
            className="object-contain transition-all duration-300 hover:scale-105"
            priority
          />
        </div>

        {/* Keyframe animations */}
        <style jsx>{`
          @keyframes timedBlueTransition {
            0% { 
              background: linear-gradient(135deg, #F0F8FF 0%, #E8F4FD 100%);
              transform: scale(1);
            }
            15% { 
              background: linear-gradient(135deg, #EBF5FE 0%, #E3F1FE 100%);
              transform: scale(1.001);
            }
            30% { 
              background: linear-gradient(135deg, #E6F2FE 0%, #DEF0FE 100%);
              transform: scale(1.002);
            }
            50% { 
              background: linear-gradient(135deg, #D6E7FF 0%, #CCE7FF 100%);
              transform: scale(1.005);
            }
            70% { 
              background: linear-gradient(135deg, #E6F2FE 0%, #DEF0FE 100%);
              transform: scale(1.002);
            }
            85% { 
              background: linear-gradient(135deg, #EBF5FE 0%, #E3F1FE 100%);
              transform: scale(1.001);
            }
            100% { 
              background: linear-gradient(135deg, #F0F8FF 0%, #E8F4FD 100%);
              transform: scale(1);
            }
          }

          @keyframes packageFloat1 {
            0%, 100% { 
              opacity: 0.7;
              transform: translateY(0px) translateX(0px) rotate(0deg);
            }
            25% { 
              opacity: 0.9;
              transform: translateY(-4px) translateX(2px) rotate(6deg);
            }
            50% { 
              opacity: 0.5;
              transform: translateY(-2px) translateX(4px) rotate(-4deg);
            }
            75% { 
              opacity: 0.8;
              transform: translateY(1px) translateX(1px) rotate(2deg);
            }
          }

          @keyframes packageFloat2 {
            0%, 100% { 
              opacity: 0.6;
              transform: translateY(0px) translateX(0px) rotate(0deg);
            }
            33% { 
              opacity: 0.8;
              transform: translateY(3px) translateX(-3px) rotate(-10deg);
            }
            66% { 
              opacity: 0.4;
              transform: translateY(-1px) translateX(-5px) rotate(5deg);
            }
          }

          @keyframes packageFloat3 {
            0%, 100% { 
              opacity: 0.55;
              transform: translateY(0px) translateX(0px) rotate(0deg);
            }
            30% { 
              opacity: 0.85;
              transform: translateY(-3px) translateX(3px) rotate(12deg);
            }
            70% { 
              opacity: 0.65;
              transform: translateY(2px) translateX(-2px) rotate(-6deg);
            }
          }
        `}</style>
      </div>

      {/* Navigation */}
      <nav
        className={`${isMobile ? "py-3 flex-1 min-h-0 overflow-y-auto" : "py-4 flex-1 overflow-y-auto"} flex flex-col`}
      >
        <div className={`${isMobile ? "mb-3 flex-1" : "mb-8"}`}>
          {navItems.map((item) => {
            const IconComponent = item.icon
            const isActive = activeItem === item.name
            return (
              <div
                key={item.name}
                className={`mx-3 ${isMobile ? "my-0.5 px-3 py-2.5" : "my-1 px-3 py-2.5"} rounded-xl cursor-pointer transition-all duration-200 flex items-center gap-3 font-medium ${isMobile ? "text-sm" : "text-sm"} relative overflow-hidden border border-transparent ${
                  isActive
                    ? "bg-gradient-to-br from-[#2069ff] to-[#1557d4] text-white shadow-[0_10px_30px_rgba(32,105,255,0.3)] border-white/20"
                    : "text-slate-600 hover:bg-[#2069ff]/[0.1] hover:border-[#2069ff]/25 hover:text-[#2069ff] hover:translate-x-1 hover:scale-[1.01] hover:shadow-[0_3px_12px_rgba(32,105,255,0.12)]"
                }`}
                onClick={() => {
                  if (item.href) {
                    window.location.href = item.href
                  }
                }}
              >
                {!isActive && (
                  <div className="absolute top-0 left-[-100%] w-full h-full bg-gradient-to-r from-transparent via-[#2069ff]/[0.08] to-transparent transition-all duration-300 hover:left-full" />
                )}
                <IconComponent
                  className={`${isMobile ? "w-4 h-4" : "w-4 h-4"} transition-all duration-200 ${
                    isActive ? "text-white" : "text-current opacity-70"
                  }`}
                />
                <span>{item.name}</span>
                {item.badge && (
                  <div
                    className={`${
                      item.badge === "Nieuw"
                        ? "bg-gradient-to-br from-green-500 to-green-600"
                        : "bg-gradient-to-br from-amber-500 to-amber-600"
                    } text-white ${isMobile ? "px-2 py-0.5 text-[11px]" : "px-3 py-1 text-xs"} rounded-xl font-bold ml-auto shadow-[0_2px_8px_rgba(245,158,11,0.3)] animate-pulse`}
                  >
                    {item.badge}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Management Section */}
        <div
          className={`bg-gradient-to-br from-[#2069ff]/[0.03] to-[#1557d4]/[0.03] border border-[#2069ff]/10 rounded-2xl ${isMobile ? "p-2.5 mx-3 mb-3" : "p-3 mx-3 mb-4"} relative backdrop-blur-[10px] flex-shrink-0`}
        >
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#2069ff] to-[#1557d4] rounded-t-2xl" />
          {managementItems.map((item) => {
            const IconComponent = item.icon
            const isActive = activeItem === item.name
            return (
              <div
                key={item.name}
                className={`${isMobile ? "my-0.5 px-3 py-2.5" : "my-1 px-3 py-3"} rounded-xl cursor-pointer transition-all duration-200 flex items-center gap-3 font-medium ${isMobile ? "text-sm" : "text-sm"} ${
                  isActive
                    ? "bg-gradient-to-br from-[#2069ff] to-[#1557d4] text-white shadow-[0_10px_30px_rgba(32,105,255,0.3)] border-white/20"
                    : "text-slate-600 hover:bg-[#2069ff]/[0.1] hover:border-[#2069ff]/25 hover:text-[#2069ff] hover:translate-x-1"
                }`}
                onClick={() => {
                  if (item.href) {
                    window.location.href = item.href
                  }
                }}
              >
                <IconComponent className={`${isMobile ? "w-4 h-4" : "w-4 h-4"} opacity-70`} />
                <span>{item.name}</span>
              </div>
            )
          })}
        </div>
      </nav>
    </div>
  )

  return sidebarContent
}
