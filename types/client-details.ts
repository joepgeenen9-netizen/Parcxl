export interface ClientIntegration {
  id: string
  tenant_id: string
  client_id: string
  platform: string
  domain?: string | null
  api_key?: string | null
  api_secret?: string | null
  access_token?: string | null
  active: boolean
  created_at: string
}

export interface ClientProduct {
  id: string
  tenant_id: string
  client_id: string
  sku: string
  article_number?: string | null
  name: string
  description?: string | null
  image_url?: string | null
  weight_grams?: number | null
  dimensions_cm?: {
    length?: number
    width?: number
    height?: number
  } | null
  barcode?: string | null
  stock: number
  location?: string | null
  created_at: string
}

export interface ClientUser {
  id: string
  tenant_id: string
  client_id: string
  name: string
  email: string
  position?: string | null
  phone?: string | null
  role: string
  status: "active" | "inactive" | "suspended"
  created_at: string
  updated_at: string
}

export interface ClientStats {
  totalProducts: number
  totalUsers: number
  totalIntegrations: number
  activeIntegrations: number
}

export interface ClientDetailsData {
  client: Client
  stats: ClientStats
  integrations: ClientIntegration[]
  products: ClientProduct[]
  users: ClientUser[]
}
