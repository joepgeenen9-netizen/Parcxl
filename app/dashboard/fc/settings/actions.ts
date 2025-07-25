"use server"

import { createServerClient } from "@/lib/supabase"
import { revalidatePath } from "next/cache"
import bcrypt from "bcryptjs"

// Get tenant settings with all required fields
export async function getTenantSettings(tenantId: string) {
  try {
    console.log("🔍 Fetching tenant settings for ID:", tenantId)

    const supabase = createServerClient()

    // First, let's check what columns actually exist in the tenants table
    const { data: tableInfo, error: tableError } = await supabase
      .from("tenants")
      .select("*")
      .eq("id", tenantId)
      .limit(1)

    if (tableError) {
      console.error("❌ Error checking table structure:", tableError)
    } else {
      console.log("📋 Available columns in tenants table:", Object.keys(tableInfo?.[0] || {}))
    }

    // Query with only the columns that definitely exist
    const { data, error } = await supabase
      .from("tenants")
      .select(`
        id,
        name,
        email,
        phone,
        return_company,
        return_street,
        return_house_number,
        return_postal_code,
        return_city,
        return_country,
        logo_url,
        created_at
      `)
      .eq("id", tenantId)
      .single()

    if (error) {
      console.error("❌ Database error fetching tenant:", error)
      return {
        success: false,
        message: `Database fout: ${error.message}`,
        data: null,
      }
    }

    if (!data) {
      console.error("❌ No tenant data found for ID:", tenantId)
      return {
        success: false,
        message: "Geen tenant gevonden",
        data: null,
      }
    }

    console.log("✅ Successfully fetched tenant data:", {
      id: data.id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      return_company: data.return_company,
      return_street: data.return_street,
      return_house_number: data.return_house_number,
      return_postal_code: data.return_postal_code,
      return_city: data.return_city,
      return_country: data.return_country,
      logo_url: data.logo_url,
    })

    return {
      success: true,
      message: "Instellingen succesvol opgehaald",
      data,
    }
  } catch (error) {
    console.error("❌ Server error fetching tenant settings:", error)
    return {
      success: false,
      message: "Server fout bij ophalen instellingen",
      data: null,
    }
  }
}

// Update tenant settings
export async function updateTenantSettings(tenantId: string, formData: any) {
  try {
    console.log("💾 Updating tenant settings for ID:", tenantId)
    console.log("📝 Form data:", formData)

    const supabase = createServerClient()

    const updateData = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      return_company: formData.return_company,
      return_street: formData.return_street,
      return_house_number: formData.return_house_number,
      return_postal_code: formData.return_postal_code,
      return_city: formData.return_city,
      return_country: formData.return_country,
      logo_url: formData.logo_url,
    }

    const { error } = await supabase.from("tenants").update(updateData).eq("id", tenantId)

    if (error) {
      console.error("❌ Database error updating tenant:", error)
      return {
        success: false,
        message: `Database fout: ${error.message}`,
      }
    }

    console.log("✅ Successfully updated tenant settings")
    revalidatePath("/dashboard/fc/settings")

    return {
      success: true,
      message: "Instellingen succesvol opgeslagen",
    }
  } catch (error) {
    console.error("❌ Server error updating tenant settings:", error)
    return {
      success: false,
      message: "Server fout bij opslaan instellingen",
    }
  }
}

// Role management actions
export async function createRole(tenantId: string, data: any) {
  try {
    const supabase = createServerClient()

    const { data: role, error } = await supabase
      .from("tenant_roles")
      .insert({
        tenant_id: tenantId,
        name: data.name,
        description: data.description,
      })
      .select()
      .single()

    if (error) {
      return {
        success: false,
        message: "Fout bij het aanmaken van rol: " + error.message,
      }
    }

    // Add permissions
    if (data.permissions && Object.keys(data.permissions).length > 0) {
      const permissions = Object.entries(data.permissions)
        .filter(([_, enabled]) => enabled)
        .map(([permission, _]) => ({
          role_id: role.id,
          permission_key: permission,
          permission_name: permission.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
          enabled: true,
        }))

      if (permissions.length > 0) {
        const { error: permError } = await supabase.from("role_permissions").insert(permissions)

        if (permError) {
          console.error("Permission error:", permError)
        }
      }
    }

    revalidatePath("/dashboard/fc/settings")
    return {
      success: true,
      message: "Rol succesvol aangemaakt",
    }
  } catch (error) {
    return {
      success: false,
      message: "Er is een onverwachte fout opgetreden",
    }
  }
}

export async function updateRole(roleId: string, data: any) {
  try {
    const supabase = createServerClient()

    const { error } = await supabase
      .from("tenant_roles")
      .update({
        name: data.name,
        description: data.description,
      })
      .eq("id", roleId)

    if (error) {
      return {
        success: false,
        message: "Fout bij het bijwerken van rol: " + error.message,
      }
    }

    // Update permissions
    await supabase.from("role_permissions").delete().eq("role_id", roleId)

    if (data.permissions && Object.keys(data.permissions).length > 0) {
      const permissions = Object.entries(data.permissions)
        .filter(([_, enabled]) => enabled)
        .map(([permission, _]) => ({
          role_id: roleId,
          permission_key: permission,
          permission_name: permission.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
          enabled: true,
        }))

      if (permissions.length > 0) {
        const { error: permError } = await supabase.from("role_permissions").insert(permissions)

        if (permError) {
          console.error("Permission error:", permError)
        }
      }
    }

    revalidatePath("/dashboard/fc/settings")
    return {
      success: true,
      message: "Rol succesvol bijgewerkt",
    }
  } catch (error) {
    return {
      success: false,
      message: "Er is een onverwachte fout opgetreden",
    }
  }
}

export async function deleteRole(roleId: string) {
  try {
    const supabase = createServerClient()

    // Delete permissions first
    await supabase.from("role_permissions").delete().eq("role_id", roleId)

    // Delete role
    const { error } = await supabase.from("tenant_roles").delete().eq("id", roleId)

    if (error) {
      return {
        success: false,
        message: "Fout bij het verwijderen van rol: " + error.message,
      }
    }

    revalidatePath("/dashboard/fc/settings")
    return {
      success: true,
      message: "Rol succesvol verwijderd",
    }
  } catch (error) {
    return {
      success: false,
      message: "Er is een onverwachte fout opgetreden",
    }
  }
}

export async function getTenantRoles(tenantId: string) {
  try {
    const supabase = createServerClient()

    const { data, error } = await supabase
      .from("tenant_roles")
      .select("*")
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false })

    if (error) {
      return {
        success: false,
        message: "Fout bij het ophalen van rollen: " + error.message,
        data: [],
      }
    }

    return {
      success: true,
      message: "Rollen succesvol opgehaald",
      data: data || [],
    }
  } catch (error) {
    return {
      success: false,
      message: "Er is een onverwachte fout opgetreden",
      data: [],
    }
  }
}

export async function getRolePermissions(roleId: string) {
  try {
    const supabase = createServerClient()

    const { data, error } = await supabase.from("role_permissions").select("*").eq("role_id", roleId)

    if (error) {
      return {
        success: false,
        message: "Fout bij het ophalen van rechten: " + error.message,
        data: [],
      }
    }

    return {
      success: true,
      message: "Rechten succesvol opgehaald",
      data: data || [],
    }
  } catch (error) {
    return {
      success: false,
      message: "Er is een onverwachte fout opgetreden",
      data: [],
    }
  }
}

// User management actions
export async function createTenantUser(tenantId: string, data: any) {
  try {
    console.log("🔐 Creating tenant user with password hashing...")
    const supabase = createServerClient()

    // Hash the password using bcrypt
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(data.password, saltRounds)

    console.log("✅ Password hashed successfully")

    const { error } = await supabase.from("tenant_users").insert({
      tenant_id: tenantId,
      username: data.username,
      email: data.email,
      password_hash: hashedPassword, // Use the hashed password
      is_admin: data.is_admin,
      role_id: data.role_id || null,
    })

    if (error) {
      console.error("❌ Database error creating tenant user:", error)
      return {
        success: false,
        message: "Fout bij het aanmaken van gebruiker: " + error.message,
      }
    }

    console.log("✅ Tenant user created successfully")
    revalidatePath("/dashboard/fc/settings")
    return {
      success: true,
      message: "Gebruiker succesvol aangemaakt",
    }
  } catch (error) {
    console.error("❌ Server error creating tenant user:", error)
    return {
      success: false,
      message: "Er is een onverwachte fout opgetreden",
    }
  }
}

export async function updateTenantUser(userId: string, data: any) {
  try {
    const supabase = createServerClient()

    const updateData: any = {
      username: data.username,
      email: data.email,
      is_admin: data.is_admin,
      role_id: data.role_id || null,
    }

    // Only hash and update password if a new password is provided
    if (data.password && data.password.trim() !== "") {
      console.log("🔐 Updating password with hashing...")
      const saltRounds = 12
      const hashedPassword = await bcrypt.hash(data.password, saltRounds)
      updateData.password_hash = hashedPassword
      console.log("✅ Password hashed successfully")
    }

    const { error } = await supabase.from("tenant_users").update(updateData).eq("id", userId)

    if (error) {
      console.error("❌ Database error updating tenant user:", error)
      return {
        success: false,
        message: "Fout bij het bijwerken van gebruiker: " + error.message,
      }
    }

    console.log("✅ Tenant user updated successfully")
    revalidatePath("/dashboard/fc/settings")
    return {
      success: true,
      message: "Gebruiker succesvol bijgewerkt",
    }
  } catch (error) {
    console.error("❌ Server error updating tenant user:", error)
    return {
      success: false,
      message: "Er is een onverwachte fout opgetreden",
    }
  }
}

export async function deleteTenantUser(userId: string) {
  try {
    const supabase = createServerClient()

    const { error } = await supabase.from("tenant_users").delete().eq("id", userId)

    if (error) {
      return {
        success: false,
        message: "Fout bij het verwijderen van gebruiker: " + error.message,
      }
    }

    revalidatePath("/dashboard/fc/settings")
    return {
      success: true,
      message: "Gebruiker succesvol verwijderd",
    }
  } catch (error) {
    return {
      success: false,
      message: "Er is een onverwachte fout opgetreden",
    }
  }
}

export async function getTenantUsers(tenantId: string) {
  try {
    const supabase = createServerClient()

    const { data, error } = await supabase
      .from("tenant_users")
      .select(`
        *,
        tenant_roles!left(name)
      `)
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false })

    if (error) {
      return {
        success: false,
        message: "Fout bij het ophalen van gebruikers: " + error.message,
        data: [],
      }
    }

    // Transform the data to include role_name
    const transformedData =
      data?.map((user) => ({
        ...user,
        role_name: user.tenant_roles?.name || null,
      })) || []

    return {
      success: true,
      message: "Gebruikers succesvol opgehaald",
      data: transformedData,
    }
  } catch (error) {
    return {
      success: false,
      message: "Er is een onverwachte fout opgetreden",
      data: [],
    }
  }
}
