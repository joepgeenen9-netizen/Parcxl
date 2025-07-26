"use client"

import { useEffect, useState } from "react"
import { Loader2, Package, Users, DollarSign, AlertTriangle } from "lucide-react"
import { AdminLayout } from "./components/admin-layout"

interface AdminUser {
  id: string
  name: string
  email: string
  role: string
}

interface AdminDashboardProps {
  initialUser?: {
    id: string
    name: string
    email: string
    company?: string
    rol: string
  }
}

// Enhanced Welcome section with admin theme
function AdminWelcomeSection({ user }: { user: AdminUser }) {
  return (
    <div className="relative bg-gradient-to-br from-[#2069ff]/[0.15] via-purple-500/[0.12] to-[#2069ff]/[0.15] rounded-2xl lg:rounded-3xl p-6 lg:p-10 mb-6 lg:mb-10 overflow-hidden border border-[#2069ff]/[0.25] min-h-[160px] lg:min-h-[200px] flex items-center cursor-pointer transition-all duration-400 hover:bg-gradient-to-br hover:from-[#2069ff]/[0.25] hover:via-purple-500/[0.2] hover:to-[#2069ff]/[0.25] hover:border-purple-500/20 hover:transform hover:translate-y-[-2px] hover:shadow-[0_10px_40px_rgba(32,105,255,0.15)] group">
      {/* Animated background circle */}
      <div className="absolute top-0 right-0 w-[200px] lg:w-[400px] h-[200px] lg:h-[400px] bg-gradient-radial from-purple-500/[0.12] via-[#2069ff]/[0.08] to-transparent rounded-full transform translate-x-1/2 -translate-y-1/2 animate-pulse" />

      {/* Content */}
      <div className="relative z-[2] flex flex-col justify-center h-full max-w-[85%] lg:max-w-[75%]">
        <h2 className="text-xl lg:text-4xl font-extrabold text-slate-900 mb-2 lg:mb-3 leading-tight">
          Welkom terug, {user.name.split(" ")[0]}! Beheer het platform
        </h2>
        <p className="text-slate-600 text-sm lg:text-lg font-normal leading-relaxed mb-4">
          Overzicht van alle klanten, zendingen en systeemprestaties. Alles onder controle.
        </p>
      </div>

      {/* Enhanced Admin Control Panel Animation */}
      <div className="absolute bottom-0 left-0 w-full h-10 lg:h-14 overflow-hidden">
        {/* Control panel base */}
        <div className="absolute bottom-0 left-0 w-full h-8 lg:h-10 bg-gradient-to-b from-slate-700/40 via-slate-800/50 to-slate-900/60 border-t-2 border-slate-600/60 shadow-inner">
          {/* Control indicators */}
          <div className="absolute top-1 left-4 flex gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-300 shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
            <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse delay-700 shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
          </div>

          {/* Data flow animation */}
          <div className="absolute top-2 right-4 flex gap-1">
            <div className="w-1 h-4 bg-[#2069ff]/60 animate-[dataFlow_2s_ease-in-out_infinite] rounded-sm" />
            <div className="w-1 h-4 bg-[#2069ff]/60 animate-[dataFlow_2s_ease-in-out_infinite_0.2s] rounded-sm" />
            <div className="w-1 h-4 bg-[#2069ff]/60 animate-[dataFlow_2s_ease-in-out_infinite_0.4s] rounded-sm" />
            <div className="w-1 h-4 bg-[#2069ff]/60 animate-[dataFlow_2s_ease-in-out_infinite_0.6s] rounded-sm" />
          </div>
        </div>

        {/* Admin monitoring elements */}
        <div className="absolute bottom-3 lg:bottom-4 left-0 w-full h-6 lg:h-8 pointer-events-none">
          {/* Server status indicator */}
          <div
            className="absolute w-8 h-6 lg:w-12 lg:h-8 bg-gradient-to-br from-green-300 via-green-400 to-green-600 rounded-[2px] shadow-[0_3px_12px_rgba(34,197,94,0.5)] animate-[serverPulse_3s_ease-in-out_infinite] border border-green-700/40"
            style={{ left: "10%" }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-green-200/30 via-transparent to-green-800/30 rounded-[2px]" />
            <div className="absolute top-1 left-1 w-2 h-2 bg-white/80 rounded-full animate-pulse" />
          </div>

          {/* Analytics dashboard */}
          <div
            className="absolute w-10 h-5 lg:w-14 lg:h-7 bg-gradient-to-br from-blue-300 via-blue-400 to-blue-600 rounded-[2px] shadow-[0_3px_12px_rgba(59,130,246,0.5)] animate-[analyticsMove_4s_ease-in-out_infinite] border border-blue-700/40"
            style={{ left: "40%" }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-200/30 via-transparent to-blue-800/30 rounded-[2px]" />
            <div className="absolute top-1 left-1 right-1 h-[1px] bg-white/60" />
            <div className="absolute top-2 left-1 right-1 h-[1px] bg-white/40" />
          </div>

          {/* User management */}
          <div
            className="absolute w-7 h-7 lg:w-10 lg:h-10 bg-gradient-to-br from-purple-300 via-purple-400 to-purple-600 rounded-[2px] shadow-[0_3px_12px_rgba(147,51,234,0.5)] animate-[userManagement_5s_ease-in-out_infinite] border border-purple-700/40"
            style={{ left: "70%" }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-200/30 via-transparent to-purple-800/30 rounded-[2px]" />
            <div className="absolute top-1 left-1 w-2 h-2 bg-white/80 rounded-full" />
            <div className="absolute bottom-1 right-1 w-1 h-1 bg-white/60 rounded-full" />
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes dataFlow {
          0%, 100% { height: 16px; opacity: 0.6; }
          50% { height: 24px; opacity: 1; }
        }
        @keyframes serverPulse {
          0%, 100% { 
            transform: scale(1);
            box-shadow: 0 3px 12px rgba(34,197,94,0.5);
          }
          50% { 
            transform: scale(1.05);
            box-shadow: 0 6px 20px rgba(34,197,94,0.8);
          }
        }
        @keyframes analyticsMove {
          0%, 100% { transform: translateY(0px) rotateX(0deg); }
          50% { transform: translateY(-2px) rotateX(5deg); }
        }
        @keyframes userManagement {
          0%, 100% { 
            transform: rotate(0deg) scale(1);
            opacity: 0.8;
          }
          50% { 
            transform: rotate(2deg) scale(1.1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  )
}

// Admin statistics cards
function AdminStatsGrid() {
  const [animatedValues, setAnimatedValues] = useState([0, 0, 0, 0])
  const targetValues = [1247, 89, 15847, 23]

  useEffect(() => {
    const animateValue = (index: number, start: number, end: number, duration: number) => {
      let startTimestamp: number | null = null
      const step = (timestamp: number) => {
        if (!startTimestamp) startTimestamp = timestamp
        const progress = Math.min((timestamp - startTimestamp) / duration, 1)
        const currentValue = Math.floor(progress * (end - start) + start)

        setAnimatedValues((prev) => {
          const newValues = [...prev]
          newValues[index] = currentValue
          return newValues
        })

        if (progress < 1) {
          window.requestAnimationFrame(step)
        }
      }
      window.requestAnimationFrame(step)
    }

    setTimeout(() => {
      targetValues.forEach((value, index) => {
        animateValue(index, 0, value, 2000)
      })
    }, 500)
  }, [])

  const stats = [
    {
      value: animatedValues[0],
      label: "Totaal Klanten",
      trend: "+47 deze maand",
      period: "Actieve gebruikers",
      positive: true,
      icon: Users,
    },
    {
      value: animatedValues[1],
      label: "Actieve Zendingen",
      trend: "In behandeling",
      period: "Real-time tracking",
      positive: true,
      icon: Package,
    },
    {
      value: `€${animatedValues[2]}`,
      label: "Maandelijkse Omzet",
      trend: "+12% t.o.v. vorige maand",
      period: "Deze maand",
      positive: true,
      icon: DollarSign,
    },
    {
      value: animatedValues[3],
      label: "Systeem Alerts",
      trend: "Vereist aandacht",
      period: "Laatste 24 uur",
      positive: false,
      icon: AlertTriangle,
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-10">
      {stats.map((stat, index) => {
        const IconComponent = stat.icon
        return (
          <div
            key={index}
            className="bg-white/90 backdrop-blur-[20px] rounded-2xl lg:rounded-[20px] p-6 lg:p-8 border border-[#2069ff]/[0.08] transition-all duration-400 hover:transform hover:translate-y-[-8px] hover:shadow-[0_20px_40px_rgba(32,105,255,0.15)] hover:border-[#2069ff]/20 relative overflow-hidden group"
          >
            <div
              className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.positive ? "from-[#2069ff] to-[#1557d4]" : "from-red-500 to-red-600"} transform scale-x-0 transition-transform duration-400 group-hover:scale-x-100`}
            />

            <div className="flex justify-between items-start mb-4 lg:mb-6">
              <div
                className={`w-10 h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-[14px] bg-gradient-to-br ${stat.positive ? "from-[#2069ff]/10 to-[#1557d4]/10" : "from-red-500/10 to-red-600/10"} flex items-center justify-center border ${stat.positive ? "border-[#2069ff]/10" : "border-red-500/10"}`}
              >
                <IconComponent
                  className={`w-5 h-5 lg:w-6 lg:h-6 ${stat.positive ? "text-[#2069ff]" : "text-red-500"}`}
                />
              </div>
            </div>

            <div className="text-3xl lg:text-[2.75rem] font-extrabold text-slate-900 leading-none mb-2">
              {typeof stat.value === "string" ? stat.value : stat.value.toLocaleString()}
            </div>
            <div className="text-slate-600 text-sm lg:text-base font-medium mb-3">{stat.label}</div>
            <div
              className={`flex items-center gap-2 text-xs lg:text-sm font-semibold ${stat.positive ? "text-emerald-500" : "text-red-500"}`}
            >
              <span>{stat.positive ? "↗" : "⚠"}</span>
              <span className="truncate">{stat.trend}</span>
            </div>
            <div className="text-slate-400 text-xs lg:text-sm font-medium mt-2">{stat.period}</div>
          </div>
        )
      })}
    </div>
  )
}

// Admin activity feed and management actions
function AdminDashboardGrid() {
  const activities = [
    { user: "SY", name: "Systeem", action: "heeft automatische backup voltooid", time: "1 minuut geleden" },
    {
      user: "JJ",
      name: "Jan Janssen",
      action: "heeft nieuwe zending PX789012345 aangemaakt",
      time: "5 minuten geleden",
    },
    { user: "AD", name: "Admin", action: "heeft gebruiker Maria Bakker geactiveerd", time: "12 minuten geleden" },
    { user: "SY", name: "Systeem", action: "heeft 47 verzendlabels gegenereerd", time: "18 minuten geleden" },
    { user: "PK", name: "Piet Klaassen", action: "heeft factuur #INV-2025-089 betaald", time: "25 minuten geleden" },
  ]

  const adminActions = [
    "Gebruikers Beheren",
    "Systeem Monitoring",
    "Facturen Overzicht",
    "Backup Beheer",
    "API Configuratie",
    "Support Tickets",
  ]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 mb-6 lg:mb-10">
      {/* System Activity */}
      <div className="lg:col-span-2 bg-white/90 backdrop-blur-[20px] rounded-2xl lg:rounded-[20px] p-6 lg:p-8 border border-[#2069ff]/[0.08]">
        <div className="flex justify-between items-center mb-6 lg:mb-8">
          <h3 className="text-xl lg:text-2xl font-bold text-slate-900">Systeem Activiteit</h3>
          <a
            href="#"
            className="text-[#2069ff] text-sm font-semibold no-underline py-2 px-3 lg:px-4 rounded-lg transition-all duration-300 hover:bg-[#2069ff]/[0.05]"
          >
            Alle logs →
          </a>
        </div>

        {activities.map((activity, index) => (
          <div
            key={index}
            className="flex gap-3 lg:gap-4 py-3 lg:py-4 border-b border-[#2069ff]/[0.06] last:border-b-0 transition-all duration-300 hover:bg-[#2069ff]/[0.02] hover:rounded-xl hover:mx-[-1.5rem] lg:hover:mx-[-2rem] hover:px-6 lg:hover:px-8"
          >
            <div
              className={`w-8 h-8 lg:w-10 lg:h-10 rounded-lg lg:rounded-[10px] ${activity.user === "SY" ? "bg-gradient-to-br from-green-500 to-green-600" : "bg-gradient-to-br from-[#2069ff] to-[#1557d4]"} flex items-center justify-center text-white font-bold text-xs flex-shrink-0 shadow-[0_4px_12px_rgba(32,105,255,0.25)]`}
            >
              {activity.user}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm text-gray-700 mb-1 font-medium leading-relaxed truncate lg:whitespace-normal">
                <span className="font-semibold">{activity.name}</span> {activity.action}
              </div>
              <div className="text-xs text-slate-400 font-medium">{activity.time}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Admin Actions */}
      <div className="bg-white/90 backdrop-blur-[20px] rounded-2xl lg:rounded-[20px] p-6 lg:p-8 border border-[#2069ff]/[0.08]">
        <div className="flex justify-between items-center mb-6 lg:mb-8">
          <h3 className="text-xl lg:text-2xl font-bold text-slate-900">Admin Acties</h3>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
          {adminActions.map((action, index) => (
            <button
              key={index}
              className="w-full p-3 lg:p-4 border border-[#2069ff]/10 rounded-xl bg-slate-50/80 text-gray-700 font-medium text-sm cursor-pointer transition-all duration-300 mb-0 lg:mb-3 last:mb-0 flex items-center gap-3 hover:bg-[#2069ff]/[0.05] hover:border-[#2069ff]/20 hover:text-[#2069ff] hover:transform hover:translate-y-[-1px] relative overflow-hidden"
              onClick={(e) => {
                // Ripple effect
                const ripple = document.createElement("span")
                const rect = e.currentTarget.getBoundingClientRect()
                const size = Math.max(rect.width, rect.height)
                ripple.style.cssText = `
                  position: absolute;
                  border-radius: 50%;
                  background: rgba(32, 105, 255, 0.3);
                  width: ${size}px;
                  height: ${size}px;
                  left: ${rect.width / 2 - size / 2}px;
                  top: ${rect.height / 2 - size / 2}px;
                  transform: scale(0);
                  animation: ripple 0.6s linear;
                  pointer-events: none;
                `
                e.currentTarget.style.position = "relative"
                e.currentTarget.appendChild(ripple)
                setTimeout(() => ripple.remove(), 600)
              }}
            >
              <div className="w-4 h-4 bg-current rounded opacity-70 flex-shrink-0" />
              <span className="truncate lg:whitespace-normal">{action}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function AdminDashboard({ initialUser }: AdminDashboardProps) {
  const [isLoading, setIsLoading] = useState(!initialUser)
  const [user, setUser] = useState<AdminUser | null>(
    initialUser
      ? {
          id: initialUser.id,
          name: initialUser.name,
          email: initialUser.email,
          role: initialUser.rol,
        }
      : null,
  )

  useEffect(() => {
    if (!initialUser) {
      // Fallback for when no initial user is provided
      setTimeout(() => {
        setUser({
          id: "1",
          name: "Admin Beheerder",
          email: "admin@parcxl.com",
          role: "Administrator",
        })
        setIsLoading(false)
      }, 1000)
    }
  }, [initialUser])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#2069ff] mx-auto mb-4" />
          <p className="text-gray-600">Admin dashboard laden...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <AdminLayout user={user} searchPlaceholder="Zoek klanten, zendingen...">
      <AdminWelcomeSection user={user} />
      <AdminStatsGrid />
      <AdminDashboardGrid />
    </AdminLayout>
  )
}
