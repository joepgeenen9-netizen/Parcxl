"use client"
import { useState, useEffect } from "react"
import { CustomerLayout } from "./components/customer-layout"
import { DashboardContent } from "@/components/dashboard-content"
import type { User } from "@/lib/auth"

interface CustomerUser {
  id: string
  name: string
  email: string
  company?: string
  avatar?: string
  stats?: {
    totalOrders: number
    activeShipments: number
    completedDeliveries: number
    totalSpent: number
  }
}

interface CustomerDashboardProps {
  user: User
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

export default function CustomerDashboard({ user }: CustomerDashboardProps) {
  const [userData, setUserData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading user data
    const timer = setTimeout(() => {
      setUserData({
        name: user.name,
        email: user.email,
        company: user.company,
        avatar: "/placeholder-user.jpg",
        stats: {
          totalOrders: 24,
          activeShipments: 3,
          completedDeliveries: 21,
          totalSpent: 15420,
        },
      })
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [user])

  if (loading) {
    return (
      <CustomerLayout user={user}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </CustomerLayout>
    )
  }

  return (
    <CustomerLayout user={user}>
      <WelcomeSection user={userData} />
      <DashboardContent userData={userData} />
    </CustomerLayout>
  )
}
