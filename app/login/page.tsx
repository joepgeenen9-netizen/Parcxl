import { LoginForm } from "@/components/login-form"
import { BackgroundElements } from "@/components/background-elements"
import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function LoginPage() {
  // Check if user is already logged in
  const user = await getCurrentUser()
  if (user) {
    if (user.rol === "admin") {
      redirect("/admin")
    } else {
      redirect("/dashboard")
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="min-h-screen bg-white text-slate-900 overflow-x-hidden lg:transform lg:origin-top-left lg:scale-[0.98] w-full flex items-center justify-center">
        <BackgroundElements />

        <div className="relative z-10 w-full max-w-md">
          <LoginForm />
        </div>
      </div>
    </div>
  )
}
