import { LoginForm } from "@/components/auth/login-form"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Inloggen bij Parcxl</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Voer je gegevens in om toegang te krijgen tot je dashboard
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
