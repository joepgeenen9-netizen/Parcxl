export interface TenantUser {
  id: string
  tenant_id: string
  username: string
  email: string
  is_admin: boolean
}

export function getTenantUser(): TenantUser | null {
  if (typeof window === "undefined") return null

  const tenantUser = localStorage.getItem("tenant-user")
  if (!tenantUser) return null

  try {
    return JSON.parse(tenantUser)
  } catch {
    return null
  }
}

export function setTenantUser(user: TenantUser): void {
  if (typeof window === "undefined") return
  localStorage.setItem("tenant-user", JSON.stringify(user))
}

export function clearTenantUser(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem("tenant-user")
}

export function isTenantUserAuthenticated(tenantId: string): boolean {
  const user = getTenantUser()
  return user !== null && user.tenant_id === tenantId
}
