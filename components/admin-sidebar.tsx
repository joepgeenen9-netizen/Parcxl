"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Users, Package, FileText, BarChart3, HelpCircle, Shield, Database, Cog } from "lucide-react"
import Image from "next/image"

interface AdminSidebarProps {
  user: any
  isMobile?: boolean
}

export function AdminSidebar({ user, isMobile = false }: AdminSidebarProps) {
  const pathname = usePathname()

  const getActiveItem = (currentPath: string) => {
    if (currentPath === "/admin" || currentPath === "/admin/" || currentPath === "/admin/dashboard") {
      return "Dashboard"
    }
    if (currentPath.startsWith("/admin/klanten")) {
      return "Klanten Beheer"
    }
    if (currentPath.startsWith("/admin/zendingen")) {
      return "Zendingen Overzicht"
    }
    if (currentPath.startsWith("/admin/facturen")) {
      return "Facturen Beheer"
    }
    if (currentPath.startsWith("/admin/rapporten")) {
      return "Rapporten"
    }
    if (currentPath.startsWith("/admin/systeem")) {
      return "Systeem Beheer"
    }
    if (currentPath.startsWith("/admin/instellingen")) {
      return "Instellingen"
    }
    if (currentPath.startsWith("/admin/support")) {
      return "Support"
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
    { name: "Dashboard", badge: null, icon: LayoutDashboard, href: "/admin/dashboard" },
    { name: "Klanten Beheer", badge: "1247", icon: Users, href: "/admin/klanten" },
    { name: "Zendingen Overzicht", badge: "89", icon: Package, href: "/admin/zendingen" },
    { name: "Facturen Beheer", badge: "23", icon: FileText, href: "/admin/facturen" },
    { name: "Rapporten", badge: null, icon: BarChart3, href: "/admin/rapporten" },
    { name: "Systeem Beheer", badge: "Alert", icon: Database, href: "/admin/systeem" },
  ]

  const managementItems = [
    { name: "Support", badge: "12", icon: HelpCircle, href: "/admin/support" },
    { name: "Instellingen", badge: null, icon: Cog, href: "/admin/instellingen" },
  ]

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Left border gradient */}
      <div className="absolute top-0 left-0 w-[3px] h-full bg-gradient-to-b from-purple-500 to-[#2069ff] opacity-80" />

      {/* Logo container with fixed height */}
      <div
        className={`${isMobile ? "h-[100px]" : "h-[100px]"} relative border-b border-[#2069ff]/[0.08] flex-shrink-0 overflow-hidden flex items-center justify-center px-4`}
      >
        {/* Enhanced animated background with admin theme */}
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(135deg, #F3E8FF 0%, #E8F4FD 100%)",
            animation: "timedPurpleTransition 26s ease-in-out infinite",
          }}
        />

        {/* Animated admin elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute w-4 h-3 bg-gradient-to-br from-purple-400/50 to-purple-500/50 rounded-sm opacity-70"
            style={{
              top: "25%",
              left: "10%",
              animation: "adminFloat1 12s ease-in-out infinite",
              animationDelay: "0s",
            }}
          >
            <div className="absolute inset-0 border border-purple-600/30 rounded-sm" />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-[1px] bg-purple-700/60" />
          </div>

          <div
            className="absolute w-3 h-4 bg-gradient-to-br from-blue-400/45 to-blue-500/45 rounded-sm opacity-60"
            style={{
              top: "30%",
              right: "15%",
              animation: "adminFloat2 15s ease-in-out infinite",
              animationDelay: "3s",
            }}
          >
            <div className="absolute inset-0 border border-blue-600/30 rounded-sm" />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rotate-90 w-2 h-[1px] bg-blue-700/60" />
          </div>

          <div
            className="absolute w-3 h-3 bg-gradient-to-br from-indigo-400/45 to-indigo-500/45 rounded-sm opacity-55"
            style={{
              bottom: "35%",
              left: "18%",
              animation: "adminFloat3 10s ease-in-out infinite",
              animationDelay: "6s",
            }}
          >
            <div className="absolute inset-0 border border-indigo-600/30 rounded-sm" />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-[1px] bg-indigo-700/60" />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rotate-90 w-2 h-[1px] bg-indigo-700/60" />
          </div>
        </div>

        {/* Parcxl Logo with admin badge */}
        <div className="relative z-10">
          <Image
            src="/images/parcxl-logo.png"
            alt="Parcxl Admin Logo"
            width={isMobile ? 192 : 175}
            height={isMobile ? 70 : 63}
            className="object-contain transition-all duration-300 hover:scale-105"
            priority
          />
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
            <Shield className="w-3 h-3 text-white" />
          </div>
        </div>

        {/* Keyframe animations */}
        <style jsx>{`
          @keyframes timedPurpleTransition {
            0% { 
              background: linear-gradient(135deg, #F3E8FF 0%, #E8F4FD 100%);
              transform: scale(1);
            }
            15% { 
              background: linear-gradient(135deg, #EDE9FE 0%, #E3F1FE 100%);
              transform: scale(1.001);
            }
            30% { 
              background: linear-gradient(135deg, #E9D5FF 0%, #DEF0FE 100%);
              transform: scale(1.002);
            }
            50% { 
              background: linear-gradient(135deg, #DDD6FE 0%, #CCE7FF 100%);
              transform: scale(1.005);
            }
            70% { 
              background: linear-gradient(135deg, #E9D5FF 0%, #DEF0FE 100%);
              transform: scale(1.002);
            }
            85% { 
              background: linear-gradient(135deg, #EDE9FE 0%, #E3F1FE 100%);
              transform: scale(1.001);
            }
            100% { 
              background: linear-gradient(135deg, #F3E8FF 0%, #E8F4FD 100%);
              transform: scale(1);
            }
          }

          @keyframes adminFloat1 {
            0%, 100% { 
              opacity: 0.7;
              transform: translateY(0px) translateX(0px) rotate(0deg);
            }
            25% { 
              opacity: 0.9;
              transform: translateY(-6px) translateX(3px) rotate(6deg);
            }
            50% { 
              opacity: 0.5;
              transform: translateY(-3px) translateX(6px) rotate(-4deg);
            }
            75% { 
              opacity: 0.8;
              transform: translateY(2px) translateX(2px) rotate(2deg);
            }
          }

          @keyframes adminFloat2 {
            0%, 100% { 
              opacity: 0.6;
              transform: translateY(0px) translateX(0px) rotate(0deg);
            }
            33% { 
              opacity: 0.8;
              transform: translateY(5px) translateX(-5px) rotate(-10deg);
            }
            66% { 
              opacity: 0.4;
              transform: translateY(-2px) translateX(-8px) rotate(5deg);
            }
          }

          @keyframes adminFloat3 {
            0%, 100% { 
              opacity: 0.55;
              transform: translateY(0px) translateX(0px) rotate(0deg);
            }
            30% { 
              opacity: 0.85;
              transform: translateY(-5px) translateX(5px) rotate(12deg);
            }
            70% { 
              opacity: 0.65;
              transform: translateY(3px) translateX(-3px) rotate(-6deg);
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
                    ? "bg-gradient-to-br from-purple-500 to-[#2069ff] text-white shadow-[0_10px_30px_rgba(147,51,234,0.3)] border-white/20"
                    : "text-slate-600 hover:bg-purple-500/[0.1] hover:border-purple-500/25 hover:text-purple-600 hover:translate-x-1 hover:scale-[1.01] hover:shadow-[0_3px_12px_rgba(147,51,234,0.12)]"
                }`}
                onClick={() => {
                  if (item.href) {
                    window.location.href = item.href
                  }
                }}
              >
                {!isActive && (
                  <div className="absolute top-0 left-[-100%] w-full h-full bg-gradient-to-r from-transparent via-purple-500/[0.08] to-transparent transition-all duration-300 hover:left-full" />
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
                      item.badge === "Alert"
                        ? "bg-gradient-to-br from-red-500 to-red-600"
                        : "bg-gradient-to-br from-amber-500 to-amber-600"
                    } text-white ${isMobile ? "px-2 py-0.5 text-[11px]" : "px-3 py-1 text-xs"} rounded-xl font-bold ml-auto shadow-[0_2px_8px_rgba(245,158,11,0.3)] ${item.badge === "Alert" ? "animate-pulse" : ""}`}
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
          className={`bg-gradient-to-br from-purple-500/[0.03] to-[#2069ff]/[0.03] border border-purple-500/10 rounded-2xl ${isMobile ? "p-2.5 mx-3 mb-3" : "p-3 mx-3 mb-4"} relative backdrop-blur-[10px] flex-shrink-0`}
        >
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-purple-500 to-[#2069ff] rounded-t-2xl" />
          {managementItems.map((item) => {
            const IconComponent = item.icon
            const isActive = activeItem === item.name
            return (
              <div
                key={item.name}
                className={`${isMobile ? "my-0.5 px-3 py-2.5" : "my-1 px-3 py-3"} rounded-xl cursor-pointer transition-all duration-200 flex items-center gap-3 font-medium ${isMobile ? "text-sm" : "text-sm"} ${
                  isActive
                    ? "bg-gradient-to-br from-purple-500 to-[#2069ff] text-white shadow-[0_10px_30px_rgba(147,51,234,0.3)] border-white/20"
                    : "text-slate-600 hover:bg-purple-500/[0.1] hover:border-purple-500/25 hover:text-purple-600 hover:translate-x-1"
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
                  <div className="bg-gradient-to-br from-red-500 to-red-600 text-white px-2 py-0.5 text-[11px] rounded-xl font-bold ml-auto shadow-[0_2px_8px_rgba(239,68,68,0.3)] animate-pulse">
                    {item.badge}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Admin Promo Card at the bottom */}
        <div className="mx-3 mb-4">
          <div className="bg-gradient-to-br from-purple-500 to-[#2069ff] rounded-2xl p-5 text-white relative overflow-hidden group cursor-pointer transition-all duration-500 hover:shadow-[0_20px_40px_rgba(147,51,234,0.4)] hover:transform hover:translate-y-[-4px] hover:scale-[1.02]">
            {/* Enhanced decorative background elements */}
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full transform translate-x-8 -translate-y-8 transition-all duration-700 group-hover:scale-110 group-hover:bg-white/15"></div>
            <div className="absolute bottom-0 left-0 w-12 h-12 bg-white/10 rounded-full transform -translate-x-4 translate-y-4 transition-all duration-700 group-hover:scale-125 group-hover:bg-white/15"></div>

            {/* Admin badge */}
            <div className="absolute top-3 right-3 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
              <Shield className="w-3 h-3 text-white" />
            </div>

            {/* Content */}
            <div className="relative z-10">
              <h3 className="font-bold text-base mb-2 leading-tight transition-all duration-300 group-hover:text-purple-50">
                Admin Tools
              </h3>
              <p className="text-purple-100 text-sm mb-4 leading-relaxed transition-all duration-300 group-hover:text-purple-50">
                Geavanceerde beheertools
              </p>
              <button className="bg-white/20 hover:bg-white/35 backdrop-blur-sm text-white text-sm font-medium py-2.5 px-5 rounded-xl transition-all duration-300 hover:transform hover:translate-y-[-2px] hover:shadow-[0_8px_20px_rgba(255,255,255,0.2)] group-hover:bg-white/30 group-hover:scale-105 border border-white/10 hover:border-white/20">
                Bekijk tools
              </button>
            </div>
          </div>
        </div>
      </nav>
    </div>
  )

  return sidebarContent
}
