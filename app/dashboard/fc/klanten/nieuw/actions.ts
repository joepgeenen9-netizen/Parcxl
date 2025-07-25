"use server"

import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import bcrypt from "bcryptjs"
import type { NewClientFormData, ExistingClientFormData } from "@/types/client"

export async function createNewClient(formData: NewClientFormData, tenantId: string) {
  try {
    console.log("=== Starting createNewClient ===")
    console.log("Tenant ID:", tenantId)
    console.log("Form data:", {
      ...formData,
      user_password: "[REDACTED]",
    })

    const cookieStore = await cookies()

    // Create Supabase client with service role key for admin operations
    const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          } catch (error) {
            console.warn("Cookie setting error:", error)
          }
        },
      },
    })

    // Validate required fields
    if (!formData.company_name?.trim()) {
      console.error("Validation error: Missing company name")
      return {
        success: false,
        error: "Bedrijfsnaam is verplicht",
      }
    }

    if (!formData.user_name?.trim() || !formData.user_email?.trim() || !formData.user_password?.trim()) {
      console.error("Validation error: Missing user data")
      return {
        success: false,
        error: "Alle gebruikersgegevens zijn verplicht",
      }
    }

    // Validate tenant_id format
    if (!tenantId || typeof tenantId !== "string") {
      console.error("Validation error: Invalid tenant ID")
      return {
        success: false,
        error: "Ongeldige tenant ID",
      }
    }

    // Hash the password
    console.log("=== Hashing password ===")
    const hashedPassword = await bcrypt.hash(formData.user_password, 12)
    console.log("Password hashed successfully")

    // Prepare client data with all required fields explicitly mapped
    const clientData = {
      tenant_id: tenantId,
      company_name: formData.company_name.trim(),
      logo_url: formData.logo_url?.trim() || null,
      contact_person: null,
      email: null,
      phone: null,
      address: null,
      address_company_name: formData.address_company_name?.trim() || null,
      address_contact_person: formData.address_contact_person?.trim() || null,
      address_street: formData.address_street?.trim() || null,
      address_number: formData.address_number?.trim() || null,
      address_postal_code: formData.address_postal_code?.trim() || null,
      address_city: formData.address_city?.trim() || null,
      address_country: formData.address_country?.trim() || "Nederland",
      status: "active" as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    console.log("=== Creating client record ===")
    console.log("Client data prepared:", clientData)

    // Create the client record
    const { data: client, error: clientError } = await supabase.from("fc_clients").insert(clientData).select().single()

    if (clientError) {
      console.error("=== Client creation failed ===")
      console.error("Error details:", {
        error: clientError,
        code: clientError.code,
        message: clientError.message,
        details: clientError.details,
        hint: clientError.hint,
      })

      // Provide more specific error messages based on error type
      let errorMessage = "Er is een fout opgetreden bij het aanmaken van de klant"

      if (clientError.code === "23505") {
        errorMessage = "Een klant met deze gegevens bestaat al"
      } else if (clientError.code === "23503") {
        errorMessage = "Ongeldige tenant referentie"
      }

      return {
        success: false,
        error: `${errorMessage}: ${clientError.message}`,
      }
    }

    console.log("=== Client created successfully ===")
    console.log("Client ID:", client.id)

    // Prepare user data
    const userData = {
      tenant_id: tenantId,
      client_id: client.id,
      name: formData.user_name.trim(),
      email: formData.user_email.trim(),
      position: formData.user_position?.trim() || null,
      phone: formData.user_phone?.trim() || null,
      role: formData.user_role || "medewerker",
      password_hash: hashedPassword,
      status: "active" as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    console.log("=== Creating user account ===")

    const { data: user, error: userError } = await supabase.from("fc_client_users").insert(userData).select().single()

    if (userError) {
      console.error("=== User creation failed ===")
      console.error("Error details:", userError)

      // Rollback: delete the client if user creation failed
      console.log("=== Rolling back client creation ===")
      try {
        await supabase.from("fc_clients").delete().eq("id", client.id)
        console.log("Client rollback successful")
      } catch (rollbackError) {
        console.error("Rollback failed:", rollbackError)
      }

      let errorMessage = "Er is een fout opgetreden bij het aanmaken van de gebruiker"

      if (userError.code === "23505") {
        errorMessage = "Een gebruiker met dit e-mailadres bestaat al"
      }

      return {
        success: false,
        error: `${errorMessage}: ${userError.message}`,
      }
    }

    console.log("=== User created successfully ===")
    console.log("=== Client creation process completed successfully ===")

    return {
      success: true,
      clientId: client.id,
      userId: user.id,
    }
  } catch (error) {
    console.error("=== Unexpected error in createNewClient ===")
    console.error("Error:", error)

    return {
      success: false,
      error: "Er is een onverwachte fout opgetreden: " + (error instanceof Error ? error.message : String(error)),
    }
  }
}

export async function updateExistingClient(formData: ExistingClientFormData, tenantId: string) {
  try {
    console.log("=== Starting updateExistingClient ===")
    console.log("Client ID:", formData.clientId)
    console.log("Tenant ID:", tenantId)

    const cookieStore = await cookies()

    const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          } catch (error) {
            console.warn("Cookie setting error:", error)
          }
        },
      },
    })

    // Validate required fields
    if (!formData.company_name?.trim()) {
      return {
        success: false,
        error: "Bedrijfsnaam is verplicht",
      }
    }

    if (!formData.user_name?.trim() || !formData.user_email?.trim()) {
      return {
        success: false,
        error: "Gebruikersgegevens zijn verplicht",
      }
    }

    // Update client data
    const clientUpdateData = {
      company_name: formData.company_name.trim(),
      logo_url: formData.logo_url?.trim() || null,
      address_company_name: formData.address_company_name?.trim() || null,
      address_contact_person: formData.address_contact_person?.trim() || null,
      address_street: formData.address_street?.trim() || null,
      address_number: formData.address_number?.trim() || null,
      address_postal_code: formData.address_postal_code?.trim() || null,
      address_city: formData.address_city?.trim() || null,
      address_country: formData.address_country?.trim() || "Nederland",
      updated_at: new Date().toISOString(),
    }

    console.log("=== Updating client record ===")

    const { data: client, error: clientError } = await supabase
      .from("fc_clients")
      .update(clientUpdateData)
      .eq("id", formData.clientId)
      .eq("tenant_id", tenantId)
      .select()
      .single()

    if (clientError) {
      console.error("=== Client update failed ===")
      console.error("Error details:", clientError)

      return {
        success: false,
        error: `Er is een fout opgetreden bij het bijwerken van de klant: ${clientError.message}`,
      }
    }

    console.log("=== Client updated successfully ===")

    // Update user data (find the primary user for this client)
    const userUpdateData = {
      name: formData.user_name.trim(),
      email: formData.user_email.trim(),
      position: formData.user_position?.trim() || null,
      phone: formData.user_phone?.trim() || null,
      role: formData.user_role || "medewerker",
      updated_at: new Date().toISOString(),
    }

    // If password is provided, hash it and include in update
    if (formData.user_password?.trim()) {
      const hashedPassword = await bcrypt.hash(formData.user_password, 12)
      userUpdateData.password_hash = hashedPassword
    }

    console.log("=== Updating user account ===")

    const { data: user, error: userError } = await supabase
      .from("fc_client_users")
      .update(userUpdateData)
      .eq("client_id", formData.clientId)
      .eq("tenant_id", tenantId)
      .select()
      .single()

    if (userError) {
      console.error("=== User update failed ===")
      console.error("Error details:", userError)

      return {
        success: false,
        error: `Er is een fout opgetreden bij het bijwerken van de gebruiker: ${userError.message}`,
      }
    }

    console.log("=== User updated successfully ===")
    console.log("=== Client update process completed successfully ===")

    return {
      success: true,
      clientId: client.id,
      userId: user.id,
    }
  } catch (error) {
    console.error("=== Unexpected error in updateExistingClient ===")
    console.error("Error:", error)

    return {
      success: false,
      error: "Er is een onverwachte fout opgetreden: " + (error instanceof Error ? error.message : String(error)),
    }
  }
}

export async function getClientData(clientId: string, tenantId: string) {
  try {
    console.log("=== Getting client data ===")
    console.log("Client ID:", clientId)
    console.log("Tenant ID:", tenantId)

    const cookieStore = await cookies()

    const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          } catch (error) {
            console.warn("Cookie setting error:", error)
          }
        },
      },
    })

    // Get client data
    const { data: client, error: clientError } = await supabase
      .from("fc_clients")
      .select("*")
      .eq("id", clientId)
      .eq("tenant_id", tenantId)
      .single()

    if (clientError) {
      console.error("Error fetching client:", clientError)
      return {
        success: false,
        error: "Klant niet gevonden",
      }
    }

    // Get user data
    const { data: user, error: userError } = await supabase
      .from("fc_client_users")
      .select("*")
      .eq("client_id", clientId)
      .eq("tenant_id", tenantId)
      .single()

    if (userError) {
      console.error("Error fetching user:", userError)
      return {
        success: false,
        error: "Gebruiker niet gevonden",
      }
    }

    console.log("=== Client data retrieved successfully ===")

    return {
      success: true,
      client,
      user,
    }
  } catch (error) {
    console.error("=== Unexpected error in getClientData ===")
    console.error("Error:", error)

    return {
      success: false,
      error: "Er is een onverwachte fout opgetreden: " + (error instanceof Error ? error.message : String(error)),
    }
  }
}

// Helper function to verify database schema
export async function verifyDatabaseSchema() {
  try {
    console.log("=== Starting database schema verification ===")

    const cookieStore = await cookies()
    const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          } catch {
            // Ignore cookie setting errors in server components
          }
        },
      },
    })

    // Test fc_clients table with all critical columns
    console.log("Testing fc_clients table...")
    const { data: clientTest, error: clientError } = await supabase
      .from("fc_clients")
      .select("id, tenant_id, company_name, status, created_at, updated_at")
      .limit(1)

    // Test fc_client_users table
    console.log("Testing fc_client_users table...")
    const { data: userTest, error: userError } = await supabase
      .from("fc_client_users")
      .select("id, tenant_id, client_id, name, email, status, created_at, updated_at")
      .limit(1)

    const result = {
      fc_clients: {
        exists: !clientError,
        error: clientError?.message,
        columns_tested: ["id", "tenant_id", "company_name", "status", "created_at", "updated_at"],
      },
      fc_client_users: {
        exists: !userError,
        error: userError?.message,
        columns_tested: ["id", "tenant_id", "client_id", "name", "email", "status", "created_at", "updated_at"],
      },
    }

    console.log("Schema verification result:", result)
    return result
  } catch (error) {
    console.error("Schema verification exception:", error)
    return {
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

// Helper function to test database connection
export async function testDatabaseConnection() {
  try {
    console.log("=== Testing database connection ===")

    const cookieStore = await cookies()
    const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          } catch {
            // Ignore cookie errors
          }
        },
      },
    })

    // Simple connection test
    const { data, error } = await supabase.from("fc_clients").select("count").limit(1)

    return {
      success: !error,
      error: error?.message,
      timestamp: new Date().toISOString(),
    }
  } catch (error) {
    console.error("Database connection test failed:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
    }
  }
}
