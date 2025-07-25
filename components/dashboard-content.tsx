"use client"

import { Card, CardContent } from "@/components/ui/card"

export function DashboardContent() {
  return (
    <div className="flex-1 p-4 md:p-6 bg-gray-50 min-h-0 overflow-auto">
      <div className="mb-6 md:mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-2" style={{ fontFamily: "Poppins" }}>
              Dashboard
            </h1>
            <p className="text-sm md:text-base text-gray-600">
              Welkom terug! Hier is een overzicht van je WMS-platform.
            </p>
          </div>
          <div className="hidden md:block">
            <div className="text-right">
              <p className="text-sm text-gray-500">Laatste update</p>
              <p className="text-sm font-medium text-gray-900">
                {new Date().toLocaleDateString("nl-NL", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Responsive grid for widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card
            key={i}
            className="rounded-2xl border-gray-200 shadow-sm hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-200"
          >
            <CardContent className="p-4 md:p-6">
              <div className="h-24 md:h-32 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl flex items-center justify-center">
                <div className="text-center">
                  <div className="w-6 h-6 md:w-8 md:h-8 bg-[#0065FF]/10 rounded-lg mx-auto mb-2 flex items-center justify-center">
                    <div className="w-3 h-3 md:w-4 md:h-4 bg-[#0065FF] rounded-sm"></div>
                  </div>
                  <p className="text-xs md:text-sm text-gray-500 font-medium">Widget {i + 1}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Responsive charts section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
        <Card className="rounded-2xl border-gray-200 shadow-sm">
          <CardContent className="p-4 md:p-6">
            <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-4" style={{ fontFamily: "Poppins" }}>
              Statistieken
            </h3>
            <div className="h-48 md:h-64 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl flex items-center justify-center">
              <p className="text-gray-500 text-sm md:text-base">Grafiek komt hier</p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-gray-200 shadow-sm">
          <CardContent className="p-4 md:p-6">
            <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-4" style={{ fontFamily: "Poppins" }}>
              Recente activiteit
            </h3>
            <div className="h-48 md:h-64 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl flex items-center justify-center">
              <p className="text-gray-500 text-sm md:text-base">Activiteiten komen hier</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
