import { SignupForm } from "@/components/auth/signup-form"
import { BackgroundElements } from "@/components/background-elements"

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
      <BackgroundElements />

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white/95 backdrop-blur-[20px] rounded-3xl p-8 shadow-[0_20px_60px_rgba(32,105,255,0.15)] border border-white/20">
          <SignupForm />
        </div>
      </div>

      {/* Decorative Elements */}
      {/* <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-br from-[#2069ff]/20 to-purple-500/20 rounded-full blur-xl animate-pulse" />
      <div className="absolute bottom-20 right-20 w-40 h-40 bg-gradient-to-br from-amber-500/20 to-[#2069ff]/20 rounded-full blur-xl animate-pulse delay-1000" />
      <div className="absolute top-1/2 left-10 w-24 h-24 bg-gradient-to-br from-purple-500/20 to-[#2069ff]/20 rounded-full blur-xl animate-pulse delay-500" /> */}
    </div>
  )
}
