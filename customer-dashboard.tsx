"use client"

import { useEffect, useState } from "react"
import { Loader2, TrendingUp, Clock, Package } from "lucide-react"
import { CustomerLayout } from "./components/customer-layout"

interface CustomerUser {
  id: string
  name: string
  email: string
  company?: string
}

// Enhanced Welcome section with shipping theme
function WelcomeSection({ user }: { user: CustomerUser }) {
  return (
    <div className="relative bg-gradient-to-br from-[#2069ff]/[0.15] via-amber-500/[0.12] to-[#2069ff]/[0.15] rounded-2xl lg:rounded-3xl p-6 lg:p-10 mb-6 lg:mb-10 overflow-hidden border border-[#2069ff]/[0.25] min-h-[160px] lg:min-h-[200px] flex items-center cursor-pointer transition-all duration-400 hover:bg-gradient-to-br hover:from-[#2069ff]/[0.25] hover:via-amber-500/[0.2] hover:to-[#2069ff]/[0.25] hover:border-amber-500/20 hover:transform hover:translate-y-[-2px] hover:shadow-[0_10px_40px_rgba(32,105,255,0.15)] group">
      {/* Animated background circle */}
      <div className="absolute top-0 right-0 w-[200px] lg:w-[400px] h-[200px] lg:h-[400px] bg-gradient-radial from-amber-500/[0.12] via-[#2069ff]/[0.08] to-transparent rounded-full transform translate-x-1/2 -translate-y-1/2 animate-pulse" />

      {/* Content */}
      <div className="relative z-[2] flex flex-col justify-center h-full max-w-[85%] lg:max-w-[75%]">
        <h2 className="text-xl lg:text-4xl font-extrabold text-slate-900 mb-2 lg:mb-3 leading-tight">
          Welkom terug, {user.name.split(" ")[0]}! Klaar om te verzenden?
        </h2>
        <p className="text-slate-600 text-sm lg:text-lg font-normal leading-relaxed mb-4">
          Je verzendlabels zijn klaar voor gebruik. Alles staat gereed voor snelle verzending.
        </p>
      </div>

      {/* Enhanced Shipping Conveyor Belt System */}
      <div className="absolute bottom-0 left-0 w-full h-10 lg:h-14 overflow-hidden">
        {/* Conveyor belt base */}
        <div className="absolute bottom-0 left-0 w-full h-8 lg:h-10 bg-gradient-to-b from-slate-300/40 via-slate-400/50 to-slate-500/60 border-t-2 border-slate-600/60 shadow-inner">
          {/* Conveyor belt tracks */}
          <div
            className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 bg-[length:24px_100%] bg-repeat-x animate-[conveyorMove_10s_linear_infinite]"
            style={{
              backgroundImage: `repeating-linear-gradient(90deg, #475569 0px, #475569 12px, transparent 12px, transparent 24px)`,
            }}
          />
          <div
            className="absolute top-2 left-0 w-full h-[2px] bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 bg-[length:24px_100%] bg-repeat-x animate-[conveyorMove_10s_linear_infinite]"
            style={{
              backgroundImage: `repeating-linear-gradient(90deg, #475569 0px, #475569 12px, transparent 12px, transparent 24px)`,
              animationDelay: "3.33s",
            }}
          />

          {/* Conveyor belt texture overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-400/20 to-transparent animate-[conveyorShimmer_10s_linear_infinite]" />
        </div>

        {/* Shipping packages with labels */}
        <div className="absolute bottom-3 lg:bottom-4 left-0 w-full h-6 lg:h-8 pointer-events-none">
          {/* Package 1 - Customer package with Parcxl label */}
          <div
            className="absolute w-7 h-5 lg:w-10 lg:h-7 bg-gradient-to-br from-amber-300 via-amber-400 to-amber-600 rounded-[2px] shadow-[0_3px_12px_rgba(245,158,11,0.5),_inset_0_1px_0_rgba(255,255,255,0.3)] animate-[packageMove_20s_linear_infinite] border border-amber-700/40"
            style={{ animationDelay: "-0s" }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-amber-200/30 via-transparent to-amber-800/30 rounded-[2px]" />
            <div className="absolute top-0 left-0 w-full h-[1px] bg-amber-200/60" />
            <div className="absolute top-0 left-0 h-full w-[1px] bg-amber-200/60" />

            {/* Parcxl shipping label */}
            <div className="absolute top-[2px] left-[2px] w-4 lg:w-6 h-2 lg:h-3 bg-white/90 rounded-[1px] border border-slate-300/50">
              <div className="absolute inset-[1px] flex items-center justify-center">
                <div className="text-[4px] lg:text-[6px] font-bold text-[#2069ff]">P</div>
              </div>
            </div>

            <div className="absolute top-1/2 left-0 w-full h-[1px] lg:h-[2px] bg-amber-800/60 transform -translate-y-1/2" />
            <div className="absolute top-0 left-1/2 w-[1px] lg:w-[2px] h-full bg-amber-800/60 transform -translate-x-1/2" />
          </div>

          {/* Package 2 - Express delivery */}
          <div
            className="absolute w-6 h-6 lg:w-8 lg:h-8 bg-gradient-to-br from-blue-300 via-blue-400 to-blue-600 rounded-[2px] shadow-[0_3px_12px_rgba(59,130,246,0.5),_inset_0_1px_0_rgba(255,255,255,0.3)] animate-[packageMove_20s_linear_infinite] border border-blue-700/40"
            style={{ animationDelay: "-2.5s" }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-200/30 via-transparent to-blue-800/30 rounded-[2px]" />

            {/* Express sticker */}
            <div className="absolute top-[1px] right-[1px] w-2 lg:w-3 h-2 lg:h-3 bg-red-500 rounded-full flex items-center justify-center">
              <div className="text-[3px] lg:text-[4px] font-bold text-white">E</div>
            </div>

            <div className="absolute top-1/2 left-0 w-full h-[1px] lg:h-[2px] bg-blue-800/60 transform -translate-y-1/2" />
          </div>

          {/* Package 3 - International shipping */}
          <div
            className="absolute w-8 h-4 lg:w-11 lg:h-6 bg-gradient-to-br from-green-300 via-green-400 to-green-600 rounded-[2px] shadow-[0_3px_12px_rgba(34,197,94,0.5),_inset_0_1px_0_rgba(255,255,255,0.3)] animate-[packageMove_20s_linear_infinite] border border-green-700/40"
            style={{ animationDelay: "-5s" }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-green-200/30 via-transparent to-green-800/30 rounded-[2px]" />

            {/* International flag sticker */}
            <div className="absolute top-[1px] left-[1px] w-2 lg:w-3 h-2 lg:h-3 bg-white/80 rounded-sm flex items-center justify-center">
              <div className="w-1 lg:w-2 h-[1px] bg-red-500" />
            </div>

            <div className="absolute top-1/2 left-0 w-full h-[1px] lg:h-[2px] bg-green-800/60 transform -translate-y-1/2" />
          </div>
        </div>

        {/* Conveyor belt support structure */}
        <div className="absolute bottom-0 left-0 w-full h-2 lg:h-3 bg-gradient-to-r from-slate-700/70 via-slate-800/80 to-slate-700/70 border-t border-slate-600/50 shadow-[inset_0_1px_2px_rgba(0,0,0,0.3)]">
          <div className="absolute top-1/2 left-4 w-1 h-1 bg-slate-900 rounded-full transform -translate-y-1/2" />
          <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-slate-900 rounded-full transform -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute top-1/2 right-4 w-1 h-1 bg-slate-900 rounded-full transform -translate-y-1/2" />
        </div>
      </div>

      <style jsx>{`
        @keyframes conveyorMove {
          0% { background-position: 0 0; }
          100% { background-position: 24px 0; }
        }
        @keyframes conveyorShimmer {
          0% { transform: translateX(-100%); opacity: 0; }
          50% { opacity: 0.3; }
          100% { transform: translateX(100%); opacity: 0; }
        }
        @keyframes packageMove {
          0% { 
            transform: translateX(-60px) rotateY(0deg);
            opacity: 0;
          }
          5% { 
            opacity: 1;
            transform: translateX(-40px) rotateY(2deg);
          }
          95% { 
            opacity: 1;
            transform: translateX(calc(100vw + 20px)) rotateY(-2deg);
          }
          100% { 
            transform: translateX(calc(100vw + 60px)) rotateY(0deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )
}

// Statistics cards for customers
function StatsGrid() {
  const [animatedValues, setAnimatedValues] = useState([0, 0, 0])
  const targetValues = [47, 8, 1247]

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
      label: "Totaal Zendingen",
      trend: "+12 deze maand",
      period: "Afgelopen 30 dagen",
      positive: true,
      icon: Package,
    },
    {
      value: animatedValues[1],
      label: "Onderweg",
      trend: "Wordt bezorgd",
      period: "Tracking beschikbaar",
      positive: true,
      icon: Clock,
    },
    {
      value: `€${animatedValues[2]}`,
      label: "Uitgegeven",
      trend: "Gemiddeld €26 per zending",
      period: "Deze maand",
      positive: true,
      icon: TrendingUp,
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mb-6 lg:mb-10">
      {stats.map((stat, index) => {
        const IconComponent = stat.icon
        return (
          <div
            key={index}
            className="bg-white/90 backdrop-blur-[20px] rounded-2xl lg:rounded-[20px] p-6 lg:p-8 border border-[#2069ff]/[0.08] transition-all duration-400 hover:transform hover:translate-y-[-8px] hover:shadow-[0_20px_40px_rgba(32,105,255,0.15)] hover:border-[#2069ff]/20 relative overflow-hidden group"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#2069ff] to-[#1557d4] transform scale-x-0 transition-transform duration-400 group-hover:scale-x-100" />

            <div className="flex justify-between items-start mb-4 lg:mb-6">
              <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-[14px] bg-gradient-to-br from-[#2069ff]/10 to-[#1557d4]/10 flex items-center justify-center border border-[#2069ff]/10">
                <IconComponent className="w-5 h-5 lg:w-6 lg:h-6 text-[#2069ff]" />
              </div>
            </div>

            <div className="text-3xl lg:text-[2.75rem] font-extrabold text-slate-900 leading-none mb-2">
              {typeof stat.value === "string" ? stat.value : stat.value.toLocaleString()}
            </div>
            <div className="text-slate-600 text-sm lg:text-base font-medium mb-3">{stat.label}</div>
            <div className="flex items-center gap-2 text-xs lg:text-sm font-semibold text-emerald-500">
              <span>↗</span>
              <span className="truncate">{stat.trend}</span>
            </div>
            <div className="text-slate-400 text-xs lg:text-sm font-medium mt-2">{stat.period}</div>
          </div>
        )
      })}
    </div>
  )
}

// Activity feed and quick actions for customers
function DashboardGrid() {
  const activities = [
    { user: "PX", name: "Parcxl", action: "heeft je zending naar Amsterdam verzonden", time: "2 minuten geleden" },
    { user: "PX", name: "Parcxl", action: "heeft verzendlabel PX123456789 gegenereerd", time: "8 minuten geleden" },
    { user: "PX", name: "Parcxl", action: "heeft je zending naar Rotterdam afgeleverd", time: "15 minuten geleden" },
    { user: "JJ", name: "Jan Janssen", action: "heeft een nieuwe zending aangemaakt", time: "32 minuten geleden" },
    { user: "PX", name: "Parcxl", action: "heeft factuur #INV-2025-001 gegenereerd", time: "45 minuten geleden" },
  ]

  const quickActions = [
    "Nieuwe Zending",
    "Zendingen Bekijken",
    "Adresboek Beheren",
    "Facturen Downloaden",
    "Tracking Opzoeken",
    "Support Contact",
  ]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 mb-6 lg:mb-10">
      {/* Recent Activity */}
      <div className="lg:col-span-2 bg-white/90 backdrop-blur-[20px] rounded-2xl lg:rounded-[20px] p-6 lg:p-8 border border-[#2069ff]/[0.08]">
        <div className="flex justify-between items-center mb-6 lg:mb-8">
          <h3 className="text-xl lg:text-2xl font-bold text-slate-900">Recente Activiteit</h3>
          <a
            href="#"
            className="text-[#2069ff] text-sm font-semibold no-underline py-2 px-3 lg:px-4 rounded-lg transition-all duration-300 hover:bg-[#2069ff]/[0.05]"
          >
            Bekijk alle →
          </a>
        </div>

        {activities.map((activity, index) => (
          <div
            key={index}
            className="flex gap-3 lg:gap-4 py-3 lg:py-4 border-b border-[#2069ff]/[0.06] last:border-b-0 transition-all duration-300 hover:bg-[#2069ff]/[0.02] hover:rounded-xl hover:mx-[-1.5rem] lg:hover:mx-[-2rem] hover:px-6 lg:hover:px-8"
          >
            <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg lg:rounded-[10px] bg-gradient-to-br from-[#2069ff] to-[#1557d4] flex items-center justify-center text-white font-bold text-xs flex-shrink-0 shadow-[0_4px_12px_rgba(32,105,255,0.25)]">
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
      <div className="bg-white/90 backdrop-blur-[20px] rounded-2xl lg:rounded-[20px] p-6 lg:p-8 border border-[#2069ff]/[0.08]">
        <div className="flex justify-between items-center mb-6 lg:mb-8">
          <h3 className="text-xl lg:text-2xl font-bold text-slate-900">Snelle Acties</h3>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
          {quickActions.map((action, index) => (
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

export function CustomerDashboard() {
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<CustomerUser | null>(null)

  useEffect(() => {
    // Simulate loading and set mock user data
    setTimeout(() => {
      setUser({
        id: "1",
        name: "Jan Janssen",
        email: "jan@example.com",
        company: "Janssen B.V.",
      })
      setIsLoading(false)
    }, 1000)
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#2069ff] mx-auto mb-4" />
          <p className="text-gray-600">Bezig met laden...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <CustomerLayout user={user} searchPlaceholder="Zoek zendingen...">
      <WelcomeSection user={user} />
      <StatsGrid />
      <DashboardGrid />
    </CustomerLayout>
  )
}

export default function CustomerDashboardComponent() {
  return <CustomerDashboard />
}
