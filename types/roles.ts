export interface TenantRole {
  id: string
  tenant_id: string
  name: string
  description?: string
  created_at: string
  updated_at: string
}

export interface RolePermission {
  id: string
  role_id: string
  permission_key: string
  permission_name: string
  enabled: boolean
  created_at: string
}

export interface CreateRoleData {
  name: string
  description?: string
  permissions: Record<string, boolean>
}

export interface UpdateRoleData {
  name?: string
  description?: string
  permissions?: Record<string, boolean>
}

export interface TenantUserWithRole {
  id: string
  tenant_id: string
  username: string
  email: string
  is_admin: boolean
  role_id?: string
  role_name?: string
  created_at: string
}

export interface CreateTenantUserData {
  username: string
  email: string
  password: string
  is_admin: boolean
  role_id?: string
}

export interface UpdateTenantUserData {
  username?: string
  email?: string
  is_admin?: boolean
  role_id?: string
}
