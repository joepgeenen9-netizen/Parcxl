"use client"

import { useEffect, useState } from "react"
import { Loader2, Users, Package, TrendingUp, AlertTriangle, Shield, Activity, Database, Settings } from "lucide-react"
import { CustomerLayout } from "./components/customer-layout"

interface AdminUser {
  id: string
  name: string
  email: string
  company?: string
}

// Enhanced Welcome section with admin theme
function AdminWelcomeSection({ user }: { user: AdminUser }) {
  return (
    <div className="relative bg-gradient-to-br from-purple-600/[0.15] via-blue-500/[0.12] to-purple-600/[0.15] rounded-2xl lg:rounded-3xl p-6 lg:p-10 mb-6 lg:mb-10 overflow-hidden border border-purple-600/[0.25] min-h-[160px] lg:min-h-[200px] flex items-center cursor-pointer transition-all duration-400 hover:bg-gradient-to-br hover:from-purple-600/[0.25] hover:via-blue-500/[0.2] hover:to-purple-600/[0.25] hover:border-blue-500/20 hover:transform hover:translate-y-[-2px] hover:shadow-[0_10px_40px_rgba(147,51,234,0.15)] group">
      {/* Animated background circle */}
      <div className="absolute top-0 right-0 w-[200px] lg:w-[400px] h-[200px] lg:h-[400px] bg-gradient-radial from-blue-500/[0.12] via-purple-600/[0.08] to-transparent rounded-full transform translate-x-1/2 -translate-y-1/2 animate-pulse" />

      {/* Admin badge */}
      <div className="absolute top-4 right-4 flex items-center gap-2 bg-purple-600/20 backdrop-blur-sm rounded-full px-3 py-1 border border-purple-600/30">
        <Shield className="w-4 h-4 text-purple-600" />
        <span className="text-xs font-semibold text-purple-600">ADMIN</span>
      </div>

      {/* Content */}
      <div className="relative z-[2] flex flex-col justify-center h-full max-w-[85%] lg:max-w-[75%]">
        <h2 className="text-xl lg:text-4xl font-extrabold text-slate-900 mb-2 lg:mb-3 leading-tight">
          Welkom terug, {user.name.split(" ")[0]}! Systeem onder controle?
        </h2>
        <p className="text-slate-600 text-sm lg:text-lg font-normal leading-relaxed mb-4">
          Het admin dashboard staat klaar. Beheer gebruikers, monitor het systeem en houd alles in de gaten.
        </p>
      </div>

      {/* Floating admin elements */}
      <div className="absolute bottom-0 left-0 w-full h-10 lg:h-14 overflow-hidden">
        <div className="absolute bottom-3 lg:bottom-4 left-0 w-full h-6 lg:h-8 pointer-events-none">
          {/* Floating admin icons */}
          <div
            className="absolute w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg shadow-lg animate-[adminFloat_15s_linear_infinite] flex items-center justify-center"
            style={{ animationDelay: "0s" }}
          >
            <Users className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
          </div>

          <div
            className="absolute w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg shadow-lg animate-[adminFloat_15s_linear_infinite] flex items-center justify-center"
            style={{ animationDelay: "-3s" }}
          >
            <Database className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
          </div>

          <div
            className="absolute w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-lg shadow-lg animate-[adminFloat_15s_linear_infinite] flex items-center justify-center"
            style={{ animationDelay: "-6s" }}
          >
            <Settings className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes adminFloat {
          0% { 
            transform: translateX(-60px) translateY(0px) rotate(0deg);
            opacity: 0;
          }
          5% { 
            opacity: 1;
            transform: translateX(-40px) translateY(-5px) rotate(5deg);
          }
          50% { 
            transform: translateX(50vw) translateY(-10px) rotate(-5deg);
          }
          95% { 
            opacity: 1;
            transform: translateX(calc(100vw + 20px)) translateY(-5px) rotate(5deg);
          }
          100% { 
            transform: translateX(calc(100vw + 60px)) translateY(0px) rotate(0deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )
}

// Admin statistics cards
function AdminStatsGrid() {
  const [animatedValues, setAnimatedValues] = useState([0, 0, 0, 0])
  const targetValues = [1247, 89, 15420, 3]

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
      trend: "+23 deze maand",
      period: "Actieve accounts",
      positive: true,
      icon: Users,
      color: "purple",
    },
    {
      value: animatedValues[1],
      label: "Actieve Zendingen",
      trend: "Real-time tracking",
      period: "In behandeling",
      positive: true,
      icon: Package,
      color: "blue",
    },
    {
      value: `€${animatedValues[2]}`,
      label: "Maandelijkse Omzet",
      trend: "+18% vs vorige maand",
      period: "December 2024",
      positive: true,
      icon: TrendingUp,
      color: "green",
    },
    {
      value: animatedValues[3],
      label: "Systeem Alerts",
      trend: "Vereist aandacht",
      period: "Laatste 24 uur",
      positive: false,
      icon: AlertTriangle,
      color: "red",
    },
  ]

  const getColorClasses = (color: string) => {
    const colors = {
      purple: {
        bg: "from-purple-600/10 to-purple-700/10",
        border: "border-purple-600/10",
        icon: "text-purple-600",
        hover: "hover:border-purple-600/20",
      },
      blue: {
        bg: "from-blue-600/10 to-blue-700/10",
        border: "border-blue-600/10",
        icon: "text-blue-600",
        hover: "hover:border-blue-600/20",
      },
      green: {
        bg: "from-green-600/10 to-green-700/10",
        border: "border-green-600/10",
        icon: "text-green-600",
        hover: "hover:border-green-600/20",
      },
      red: {
        bg: "from-red-600/10 to-red-700/10",
        border: "border-red-600/10",
        icon: "text-red-600",
        hover: "hover:border-red-600/20",
      },
    }
    return colors[color as keyof typeof colors] || colors.purple
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-10">
      {stats.map((stat, index) => {
        const IconComponent = stat.icon
        const colorClasses = getColorClasses(stat.color)
        return (
          <div
            key={index}
            className={`bg-white/90 backdrop-blur-[20px] rounded-2xl lg:rounded-[20px] p-6 lg:p-8 border ${colorClasses.border} transition-all duration-400 hover:transform hover:translate-y-[-8px] hover:shadow-[0_20px_40px_rgba(147,51,234,0.15)] ${colorClasses.hover} relative overflow-hidden group`}
          >
            <div
              className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${colorClasses.bg.replace("/10", "")} transform scale-x-0 transition-transform duration-400 group-hover:scale-x-100`}
            />

            <div className="flex justify-between items-start mb-4 lg:mb-6">
              <div
                className={`w-10 h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-[14px] bg-gradient-to-br ${colorClasses.bg} flex items-center justify-center border ${colorClasses.border}`}
              >
                <IconComponent className={`w-5 h-5 lg:w-6 lg:h-6 ${colorClasses.icon}`} />
              </div>
              {!stat.positive && <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />}
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

// Admin activity feed and quick actions
function AdminDashboardGrid() {
  const activities = [
    {
      user: "SY",
      name: "Systeem",
      action: "heeft automatische backup uitgevoerd",
      time: "5 minuten geleden",
      type: "system",
    },
    {
      user: "JA",
      name: "Joep Admin",
      action: "heeft gebruiker 'Jan Janssen' geactiveerd",
      time: "12 minuten geleden",
      type: "user",
    },
    {
      user: "SY",
      name: "Systeem",
      action: "heeft 47 verzendlabels gegenereerd",
      time: "18 minuten geleden",
      type: "system",
    },
    {
      user: "JA",
      name: "Joep Admin",
      action: "heeft API configuratie bijgewerkt",
      time: "25 minuten geleden",
      type: "config",
    },
    {
      user: "SY",
      name: "Systeem",
      action: "heeft performance monitoring gestart",
      time: "32 minuten geleden",
      type: "system",
    },
  ]

  const quickActions = [
    "Gebruikers Beheren",
    "Systeem Monitoring",
    "API Configuratie",
    "Database Backup",
    "Support Tickets",
    "Audit Logs",
  ]

  const getActivityColor = (type: string) => {
    const colors = {
      system: "from-blue-600 to-blue-700",
      user: "from-purple-600 to-purple-700",
      config: "from-green-600 to-green-700",
    }
    return colors[type as keyof typeof colors] || colors.system
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 mb-6 lg:mb-10">
      {/* Recent Activity */}
      <div className="lg:col-span-2 bg-white/90 backdrop-blur-[20px] rounded-2xl lg:rounded-[20px] p-6 lg:p-8 border border-purple-600/[0.08]">
        <div className="flex justify-between items-center mb-6 lg:mb-8">
          <div className="flex items-center gap-3">
            <Activity className="w-6 h-6 text-purple-600" />
            <h3 className="text-xl lg:text-2xl font-bold text-slate-900">Systeem Activiteit</h3>
          </div>
          <a
            href="#"
            className="text-purple-600 text-sm font-semibold no-underline py-2 px-3 lg:px-4 rounded-lg transition-all duration-300 hover:bg-purple-600/[0.05]"
          >
            Bekijk alle →
          </a>
        </div>

        {activities.map((activity, index) => (
          <div
            key={index}
            className="flex gap-3 lg:gap-4 py-3 lg:py-4 border-b border-purple-600/[0.06] last:border-b-0 transition-all duration-300 hover:bg-purple-600/[0.02] hover:rounded-xl hover:mx-[-1.5rem] lg:hover:mx-[-2rem] hover:px-6 lg:hover:px-8"
          >
            <div
              className={`w-8 h-8 lg:w-10 lg:h-10 rounded-lg lg:rounded-[10px] bg-gradient-to-br ${getActivityColor(activity.type)} flex items-center justify-center text-white font-bold text-xs flex-shrink-0 shadow-[0_4px_12px_rgba(147,51,234,0.25)]`}
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

      {/* Quick Actions */}
      <div className="bg-white/90 backdrop-blur-[20px] rounded-2xl lg:rounded-[20px] p-6 lg:p-8 border border-purple-600/[0.08]">
        <div className="flex justify-between items-center mb-6 lg:mb-8">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-purple-600" />
            <h3 className="text-xl lg:text-2xl font-bold text-slate-900">Admin Acties</h3>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {quickActions.map((action, index) => (
            <button
              key={index}
              className="w-full p-3 lg:p-4 border border-purple-600/10 rounded-xl bg-slate-50/80 text-gray-700 font-medium text-sm cursor-pointer transition-all duration-300 mb-0 lg:mb-3 last:mb-0 flex items-center gap-3 hover:bg-purple-600/[0.05] hover:border-purple-600/20 hover:text-purple-600 hover:transform hover:translate-y-[-1px] relative overflow-hidden"
              onClick={(e) => {
                // Ripple effect
                const ripple = document.createElement("span")
                const rect = e.currentTarget.getBoundingClientRect()
                const size = Math.max(rect.width, rect.height)
                ripple.style.cssText = `
                  position: absolute;
                  border-radius: 50%;
                  background: rgba(147, 51, 234, 0.3);
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
              <span className="truncate">{action}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export function AdminDashboard() {
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<AdminUser | null>(null)

  useEffect(() => {
    // Simulate loading and set mock admin user data
    setTimeout(() => {
      setUser({
        id: "1",
        name: "Joep Admin",
        email: "joep@admin.nl",
        company: "Parcxl B.V.",
      })
      setIsLoading(false)
    }, 1000)
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Admin dashboard laden...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <CustomerLayout user={user} searchPlaceholder="Zoek gebruikers, zendingen...">
      <AdminWelcomeSection user={user} />
      <AdminStatsGrid />
      <AdminDashboardGrid />
    </CustomerLayout>
  )
}

export default function AdminDashboardComponent() {
  return <AdminDashboard />
}
