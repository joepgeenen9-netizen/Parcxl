import { LoginForm } from "@/components/auth/login-form"
import { BackgroundElements } from "@/components/background-elements"

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
      <BackgroundElements />

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white/95 backdrop-blur-[20px] rounded-3xl p-8 shadow-[0_20px_60px_rgba(32,105,255,0.15)] border border-white/20">
          <LoginForm />
        </div>
      </div>
    </div>
  )
}
