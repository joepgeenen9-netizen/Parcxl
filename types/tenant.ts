export interface Tenant {
  id: string
  name: string
  type: "FC" | "WS"
  email?: string
  phone?: string
  kvk_number?: string
  vat_number?: string
  return_company?: string
  return_street?: string
  return_house_number?: string
  return_postal_code?: string
  return_city?: string
  return_country?: string
  logo_url?: string
  created_at: string
}

export interface CreateTenantData {
  name: string
  type: "FC" | "WS"
  email?: string
  phone?: string
  kvk_number?: string
  vat_number?: string
  return_company?: string
  return_street?: string
  return_house_number?: string
  return_postal_code?: string
  return_city?: string
  return_country?: string
  logo_url?: string
}

export interface TenantFormData {
  name: string
  type: "FC" | "WS"
  email: string
  phone: string
  kvk_number: string
  vat_number: string
  company_street: string
  company_house_number: string
  company_postal_code: string
  company_city: string
  company_country: string
  return_company: string
  return_street: string
  return_house_number: string
  return_postal_code: string
  return_city: string
  return_country: string
  use_company_as_return: boolean
  domain: string
  logo_url: string
  domain_type: "custom"
  subdomain: string
  custom_domain: string
  domain_checked: boolean
  domain_available: boolean
  admin_username: string
  admin_email: string
  admin_password: string
}

export interface TenantDomain {
  id: string
  tenant_id: string
  domain: string
  type: string
  verified: boolean
  created_at: string
}
