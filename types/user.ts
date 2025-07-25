export interface SuperAdmin {
  id: string
  display_name: string
  created_at: string
  email?: string
  last_sign_in_at?: string
}

export interface CreateSuperAdminData {
  display_name: string
  email: string
}
