"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  ShoppingCart,
  RotateCcw,
  ClipboardList,
  Package2,
  ArrowDownToLine,
  Package,
  Warehouse,
  Users,
  Ticket,
  Receipt,
  Settings,
} from "lucide-react"

interface FCSidebarProps {
  tenant: any
  isMobile?: boolean
}

export function FCSidebar({ tenant, isMobile = false }: FCSidebarProps) {
  const pathname = usePathname()

  // Function to determine active item based on current pathname
  const getActiveItem = (currentPath: string) => {
    if (currentPath === "/dashboard/fc" || currentPath === "/dashboard/fc/") {
      return "Dashboard"
    }
    if (currentPath.startsWith("/dashboard/fc/producten")) {
      return "Producten"
    }
    if (currentPath.startsWith("/dashboard/fc/klanten")) {
      return "Klanten"
    }
    if (currentPath.startsWith("/dashboard/fc/settings")) {
      return "Instellingen"
    }
    if (currentPath.includes("/bestellingen")) {
      return "Bestellingen"
    }
    if (currentPath.includes("/retouren")) {
      return "Retouren"
    }
    if (currentPath.includes("/picklijsten")) {
      return "Picklijsten"
    }
    if (currentPath.includes("/batches")) {
      return "Batches"
    }
    if (currentPath.includes("/leveringen")) {
      return "Leveringen"
    }
    if (currentPath.includes("/voorraad")) {
      return "Voorraad"
    }
    if (currentPath.includes("/tickets")) {
      return "Tickets"
    }
    if (currentPath.includes("/facturatie")) {
      return "Facturatie"
    }

    // Default to Dashboard if no match
    return "Dashboard"
  }

  const [activeItem, setActiveItem] = useState(() => getActiveItem(pathname || ""))

  // Update active item when pathname changes
  useEffect(() => {
    if (pathname) {
      setActiveItem(getActiveItem(pathname))
    }
  }, [pathname])

  const navItems = [
    { name: "Dashboard", badge: null, icon: LayoutDashboard, href: "/dashboard/fc" },
    { name: "Bestellingen", badge: "465", icon: ShoppingCart },
    { name: "Retouren", badge: "16", icon: RotateCcw },
    { name: "Picklijsten", badge: "271", icon: ClipboardList },
    { name: "Batches", badge: null, icon: Package2 },
    {
      name: "Leveringen",
      badge: "15",
      icon: ArrowDownToLine,
      href: "/dashboard/fc/leveringen",
      submenu: [
        { name: "Overzicht", href: "/dashboard/fc/leveringen" },
        { name: "Nieuwe Levering", href: "/dashboard/fc/leveringen/new" },
      ],
    },
    { name: "Producten", badge: "43", icon: Package, href: "/dashboard/fc/producten" },
    { name: "Voorraad", badge: null, icon: Warehouse, href: "/dashboard/fc/voorraad" },
    { name: "Klanten", badge: null, icon: Users, href: "/dashboard/fc/klanten" },
  ]

  const managementItems = [
    { name: "Tickets", badge: "9", icon: Ticket },
    { name: "Facturatie", badge: null, icon: Receipt },
    { name: "Instellingen", badge: null, icon: Settings, href: "/dashboard/fc/settings" },
  ]

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Left border gradient */}
      <div className="absolute top-0 left-0 w-[3px] h-full bg-gradient-to-b from-[#2069ff] to-[#1557d4] opacity-80" />

      {/* Logo container */}
      <div
        className={`${isMobile ? "p-2.5 pt-9" : "p-3 px-6"} relative border-b border-[#2069ff]/[0.08] flex-shrink-0 overflow-hidden`}
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
            className="absolute w-4 h-3 bg-gradient-to-br from-amber-400/50 to-amber-500/50 rounded-sm opacity-70"
            style={{
              top: "18%",
              left: "10%",
              animation: "packageFloat1 12s ease-in-out infinite",
              animationDelay: "0s",
            }}
          >
            <div className="absolute inset-0 border border-amber-600/30 rounded-sm" />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-[1px] bg-amber-700/60" />
          </div>

          <div
            className="absolute w-3 h-4 bg-gradient-to-br from-blue-400/45 to-blue-500/45 rounded-sm opacity-60"
            style={{
              top: "22%",
              right: "15%",
              animation: "packageFloat2 15s ease-in-out infinite",
              animationDelay: "3s",
            }}
          >
            <div className="absolute inset-0 border border-blue-600/30 rounded-sm" />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rotate-90 w-2 h-[1px] bg-blue-700/60" />
          </div>

          <div
            className="absolute w-3 h-3 bg-gradient-to-br from-green-400/45 to-green-500/45 rounded-sm opacity-55"
            style={{
              bottom: "28%",
              left: "18%",
              animation: "packageFloat3 10s ease-in-out infinite",
              animationDelay: "6s",
            }}
          >
            <div className="absolute inset-0 border border-green-600/30 rounded-sm" />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-[1px] bg-green-700/60" />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rotate-90 w-2 h-[1px] bg-green-700/60" />
          </div>

          <div
            className="absolute w-4 h-3 bg-gradient-to-br from-purple-400/45 to-purple-500/45 rounded-sm opacity-65"
            style={{
              bottom: "18%",
              right: "12%",
              animation: "packageFloat4 14s ease-in-out infinite",
              animationDelay: "9s",
            }}
          >
            <div className="absolute inset-0 border border-purple-600/30 rounded-sm" />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-[1px] bg-purple-700/60" />
          </div>

          <div
            className="absolute w-1.5 h-1.5 bg-slate-400/35 rounded-full opacity-50"
            style={{
              top: "38%",
              left: "28%",
              animation: "dotFloat1 8s ease-in-out infinite",
              animationDelay: "2s",
            }}
          />
          <div
            className="absolute w-1.5 h-1.5 bg-slate-400/35 rounded-full opacity-45"
            style={{
              top: "62%",
              right: "32%",
              animation: "dotFloat2 11s ease-in-out infinite",
              animationDelay: "5s",
            }}
          />
        </div>

        {/* Logo */}
        <div className="flex items-center justify-center relative z-10">
          <div className="flex items-center justify-center relative">
            {tenant?.logo_url ? (
              <div className="relative">
                <div
                  className={`absolute inset-0 ${isMobile ? "w-24 h-24" : "w-20 h-20"} bg-gradient-to-br from-white/50 to-white/25 rounded-2xl blur-sm`}
                />
                <img
                  src={tenant.logo_url || "/placeholder.svg"}
                  alt={`${tenant.name} logo`}
                  className={`${isMobile ? "w-24 h-24" : "w-20 h-20"} object-contain relative z-10 drop-shadow-[0_4px_18px_rgba(32,105,255,0.35)] transition-all duration-300 hover:scale-105 hover:drop-shadow-[0_6px_26px_rgba(32,105,255,0.45)] rounded-xl`}
                />
              </div>
            ) : (
              <div className="relative">
                <div
                  className={`absolute inset-0 ${isMobile ? "w-24 h-24" : "w-20 h-20"} bg-gradient-to-br from-white/50 to-white/25 rounded-2xl blur-sm`}
                />
                <div
                  className={`${isMobile ? "w-24 h-24" : "w-20 h-20"} bg-gradient-to-br from-[#2069ff] to-[#1557d4] rounded-2xl flex items-center justify-center relative overflow-hidden shadow-[0_8px_26px_rgba(32,105,255,0.4)] transition-all duration-300 hover:scale-105 hover:shadow-[0_10px_32px_rgba(32,105,255,0.5)] z-10`}
                >
                  <div
                    className={`absolute ${isMobile ? "w-12 h-12" : "w-10 h-10"} bg-white rounded-xl top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2`}
                  />
                  <div
                    className={`absolute text-[#2069ff] ${isMobile ? "text-2xl" : "text-xl"} font-bold top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2`}
                  >
                    ↗
                  </div>
                  <div className="absolute inset-2 bg-gradient-to-br from-white/[0.3] to-transparent rounded-xl animate-[logoShimmer_8s_ease-in-out_infinite]" />
                </div>
              </div>
            )}
          </div>
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
            38.5% { 
              background: linear-gradient(135deg, #E1EFFF 0%, #D9EDFF 100%);
              transform: scale(1.003);
            }
            46% { 
              background: linear-gradient(135deg, #DCE9FF 0%, #D4E9FF 100%);
              transform: scale(1.004);
            }
            50% { 
              background: linear-gradient(135deg, #D6E7FF 0%, #CCE7FF 100%);
              transform: scale(1.005);
            }
            54% { 
              background: linear-gradient(135deg, #DCE9FF 0%, #D4E9FF 100%);
              transform: scale(1.004);
            }
            61.5% { 
              background: linear-gradient(135deg, #E1EFFF 0%, #D9EDFF 100%);
              transform: scale(1.003);
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
              transform: translateY(-8px) translateX(4px) rotate(6deg);
            }
            50% { 
              opacity: 0.5;
              transform: translateY(-4px) translateX(8px) rotate(-4deg);
            }
            75% { 
              opacity: 0.8;
              transform: translateY(2px) translateX(2px) rotate(2deg);
            }
          }

          @keyframes packageFloat2 {
            0%, 100% { 
              opacity: 0.6;
              transform: translateY(0px) translateX(0px) rotate(0deg);
            }
            33% { 
              opacity: 0.8;
              transform: translateY(6px) translateX(-6px) rotate(-10deg);
            }
            66% { 
              opacity: 0.4;
              transform: translateY(-2px) translateX(-10px) rotate(5deg);
            }
          }

          @keyframes packageFloat3 {
            0%, 100% { 
              opacity: 0.55;
              transform: translateY(0px) translateX(0px) rotate(0deg);
            }
            30% { 
              opacity: 0.85;
              transform: translateY(-6px) translateX(6px) rotate(12deg);
            }
            70% { 
              opacity: 0.65;
              transform: translateY(4px) translateX(-4px) rotate(-6deg);
            }
          }

          @keyframes packageFloat4 {
            0%, 100% { 
              opacity: 0.65;
              transform: translateY(0px) translateX(0px) rotate(0deg);
            }
            40% { 
              opacity: 0.45;
              transform: translateY(8px) translateX(-8px) rotate(-8deg);
            }
            80% { 
              opacity: 0.95;
              transform: translateY(-6px) translateX(-2px) rotate(10deg);
            }
          }

          @keyframes dotFloat1 {
            0%, 100% { 
              opacity: 0.5;
              transform: translateY(0px) scale(1);
            }
            50% { 
              opacity: 0.8;
              transform: translateY(-12px) scale(1.2);
            }
          }

          @keyframes dotFloat2 {
            0%, 100% { 
              opacity: 0.45;
              transform: translateY(0px) scale(1);
            }
            50% { 
              opacity: 0.7;
              transform: translateY(10px) scale(0.8);
            }
          }

          @keyframes logoShimmer {
            0%, 100% { 
              opacity: 0.25;
              transform: translateX(-100%) rotate(0deg);
            }
            50% { 
              opacity: 0.45;
              transform: translateX(100%) rotate(180deg);
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
                    className={`bg-gradient-to-br from-amber-500 to-amber-600 text-white ${isMobile ? "px-2 py-0.5 text-[11px]" : "px-3 py-1 text-xs"} rounded-xl font-bold ml-auto shadow-[0_2px_8px_rgba(245,158,11,0.3)] animate-pulse`}
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
                {item.badge && (
                  <div
                    className={`bg-gradient-to-br from-amber-500 to-amber-600 text-white ${isMobile ? "px-2 py-0.5 text-[11px]" : "px-3 py-1 text-xs"} rounded-xl font-bold ml-auto`}
                  >
                    {item.badge}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </nav>
    </div>
  )

  return sidebarContent
}
