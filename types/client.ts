export interface Client {
  id: string
  tenant_id: string
  company_name: string
  logo_url?: string | null
  contact_person?: string | null
  email?: string | null
  phone?: string | null
  address?: string | null
  address_company_name?: string | null
  address_contact_person?: string | null
  address_street?: string | null
  address_number?: string | null
  address_postal_code?: string | null
  address_city?: string | null
  address_country?: string | null
  status: "active" | "inactive" | "suspended"
  created_at: string
  updated_at: string
}

export interface ClientStats {
  totalClients: number
  newClientsLast30Days: number
  revenueLast30Days: number
  hasRevenueData: boolean
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
  password_hash?: string // Only included in server-side operations
  status: "active" | "inactive" | "suspended"
  created_at: string
  updated_at: string
}

export interface NewClientFormData {
  // Bedrijfsinformatie
  company_name: string
  logo_url?: string // Add this field

  // Adresgegevens
  address_company_name?: string
  address_contact_person?: string
  address_street: string
  address_number: string
  address_postal_code: string
  address_city: string
  address_country: string

  // Eerste gebruikersaccount
  user_name: string
  user_email: string
  user_position?: string
  user_phone?: string
  user_role: string
  user_password: string
}

// Navigation state for wizard steps
export interface WizardNavigationState {
  fromStep?: number
  clientId?: string
  preserveData?: boolean
}

// Extended form data with client ID for updates
export interface ExistingClientFormData extends NewClientFormData {
  clientId: string
}

// Database schema validation types
export interface DatabaseSchemaStatus {
  fc_clients: {
    exists: boolean
    error?: string
    columns_tested?: string[]
  }
  fc_client_users: {
    exists: boolean
    error?: string
    columns_tested?: string[]
  }
  error?: string
}

// Database connection test result
export interface DatabaseConnectionTest {
  success: boolean
  error?: string
  timestamp: string
}

// Complete client data as stored in database
export interface ClientRecord extends Client {
  // All fields from Client interface plus any additional database-specific fields
}

// Complete client user data as stored in database
export interface ClientUserRecord extends ClientUser {
  // All fields from ClientUser interface plus any additional database-specific fields
}

export interface ProductDetail {
  id: string
  tenant_id: string
  client_id: string
  sku: string
  article_number?: string | null
  name: string
  description?: string | null
  image_url?: string | null
  weight_grams?: number | null
  dimensions_cm?: any | null
  barcode?: string | null
  stock: number
  location?: string | null
  platform?: string | null
  platform_product_id?: string | null
  platform_2?: string | null
  product_id_2?: string | null
  platform_3?: string | null
  product_id_3?: string | null
  platform_4?: string | null
  product_id_4?: string | null
  platform_5?: string | null
  product_id_5?: string | null
  platform_6?: string | null
  product_id_6?: string | null
  created_at: string
  updated_at?: string | null
  // Client information
  client_company_name: string
  client_logo_url?: string | null
  client_status: string
  client_contact_person?: string | null
  client_email?: string | null
  client_phone?: string | null
  client_address_city?: string | null
  client_address_country?: string | null
  client_address_street?: string | null
  client_address_number?: string | null
  client_address_postal_code?: string | null
}
