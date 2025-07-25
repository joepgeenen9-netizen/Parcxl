"use client"

export function BackgroundElements() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Primary gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100" />

      {/* Animated floating elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-blue-600/10 rounded-full blur-xl animate-pulse" />
      <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-purple-400/10 to-purple-600/10 rounded-full blur-xl animate-pulse delay-1000" />
      <div className="absolute bottom-40 left-20 w-40 h-40 bg-gradient-to-br from-green-400/10 to-green-600/10 rounded-full blur-xl animate-pulse delay-2000" />
      <div className="absolute bottom-20 right-10 w-28 h-28 bg-gradient-to-br from-amber-400/10 to-amber-600/10 rounded-full blur-xl animate-pulse delay-3000" />
    </div>
  )
}
