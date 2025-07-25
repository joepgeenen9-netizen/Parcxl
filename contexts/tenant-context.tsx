"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"

interface TenantInfo {
  id: string
  name: string
  type: "FC" | "WS"
  logo_url?: string
  status: string
  domain: string
}

interface TenantContextType {
  tenant: TenantInfo | null
  isTenantDomain: boolean
  isLoading: boolean
}

const TenantContext = createContext<TenantContextType | undefined>(undefined)

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const [tenant, setTenant] = useState<TenantInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Get tenant context from cookie
    const getTenantFromCookie = () => {
      if (typeof window === "undefined") return null

      const cookies = document.cookie.split(";")
      const tenantCookie = cookies.find((cookie) => cookie.trim().startsWith("tenant-context="))

      if (!tenantCookie) return null

      const tenantValue = tenantCookie.split("=")[1]
      if (!tenantValue || tenantValue === "") return null

      try {
        return JSON.parse(decodeURIComponent(tenantValue))
      } catch {
        return null
      }
    }

    const tenantInfo = getTenantFromCookie()
    setTenant(tenantInfo)
    setIsLoading(false)
  }, [])

  const value: TenantContextType = {
    tenant,
    isTenantDomain: !!tenant,
    isLoading,
  }

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>
}

export function useTenant() {
  const context = useContext(TenantContext)
  if (context === undefined) {
    throw new Error("useTenant must be used within a TenantProvider")
  }
  return context
}
