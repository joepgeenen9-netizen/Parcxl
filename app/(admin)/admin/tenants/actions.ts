"use server"

import { createServerClient } from "@/lib/supabase"
import { revalidatePath } from "next/cache"
import type { CreateTenantData } from "@/types/tenant"

export async function createTenant(data: CreateTenantData) {
  try {
    const supabase = createServerClient()

    // Insert tenant
    const { data: tenant, error: tenantError } = await supabase
      .from("tenants")
      .insert({
        name: data.name,
        type: data.type,
        email: data.email,
        phone: data.phone,
        logo_url: data.logo_url,
        kvk_number: data.kvk_number,
        vat_number: data.vat_number,
        return_company: data.return_company,
        return_street: data.return_street,
        return_house_number: data.return_house_number,
        return_postal_code: data.return_postal_code,
        return_city: data.return_city,
        return_country: data.return_country,
      })
      .select()
      .single()

    if (tenantError) {
      throw new Error(`Failed to create tenant: ${tenantError.message}`)
    }

    revalidatePath("/admin/tenants")
    return { success: true, message: "Tenant succesvol aangemaakt", data: tenant }
  } catch (error) {
    console.error("Error creating tenant:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Er is een fout opgetreden",
    }
  }
}

export async function updateTenant(id: string, data: Partial<CreateTenantData>) {
  try {
    const supabase = createServerClient()

    const { error } = await supabase.from("tenants").update(data).eq("id", id)

    if (error) {
      throw new Error(`Failed to update tenant: ${error.message}`)
    }

    revalidatePath("/admin/tenants")
    return { success: true, message: "Tenant bijgewerkt" }
  } catch (error) {
    console.error("Error updating tenant:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Er is een fout opgetreden",
    }
  }
}

export async function deleteTenant(id: string) {
  try {
    const supabase = createServerClient()

    const { error } = await supabase.from("tenants").delete().eq("id", id)

    if (error) {
      throw new Error(`Failed to delete tenant: ${error.message}`)
    }

    revalidatePath("/admin/tenants")
    return { success: true, message: "Tenant verwijderd" }
  } catch (error) {
    console.error("Error deleting tenant:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Er is een fout opgetreden",
    }
  }
}
