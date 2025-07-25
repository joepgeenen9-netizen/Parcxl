"use server"

import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import bcrypt from "bcryptjs"
import { revalidatePath } from "next/cache"

export interface CreateClientUserData {
  name: string
  email: string
  position?: string
  phone?: string
  password: string
  role: string
}

export async function createClientUser(clientId: string, tenantId: string, userData: CreateClientUserData) {
  try {
    console.log("Server action called with:", { clientId, tenantId, userData: { ...userData, password: "[REDACTED]" } })

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
            // The `setAll` method was called from a Server Component.
          }
        },
      },
    })

    // Validate required fields
    if (!userData.name || !userData.email || !userData.password || !userData.role) {
      return {
        success: false,
        error: "Alle verplichte velden moeten worden ingevuld.",
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(userData.email)) {
      return {
        success: false,
        error: "Ongeldig e-mailadres format.",
      }
    }

    // Validate password length
    if (userData.password.length < 8) {
      return {
        success: false,
        error: "Wachtwoord moet minimaal 8 karakters bevatten.",
      }
    }

    // Check if client exists and belongs to tenant
    const { data: client, error: clientError } = await supabase
      .from("fc_clients")
      .select("id, tenant_id")
      .eq("id", clientId)
      .eq("tenant_id", tenantId)
      .single()

    if (clientError || !client) {
      console.error("Client validation error:", clientError)
      return {
        success: false,
        error: "Klant niet gevonden of geen toegang.",
      }
    }

    // Check if email already exists for this client
    const { data: existingUser, error: checkError } = await supabase
      .from("fc_client_users")
      .select("id")
      .eq("client_id", clientId)
      .eq("email", userData.email.toLowerCase())
      .single()

    if (checkError && checkError.code !== "PGRST116") {
      // PGRST116 = no rows returned
      console.error("Error checking existing user:", checkError)
      return {
        success: false,
        error: "Er is een fout opgetreden bij het controleren van bestaande gebruikers.",
      }
    }

    if (existingUser) {
      return {
        success: false,
        error: "Een gebruiker met dit e-mailadres bestaat al voor deze klant.",
      }
    }

    // Hash the password
    const saltRounds = 12
    const passwordHash = await bcrypt.hash(userData.password, saltRounds)

    // Create the client user
    const { data, error } = await supabase
      .from("fc_client_users")
      .insert({
        tenant_id: tenantId,
        client_id: clientId,
        name: userData.name.trim(),
        email: userData.email.toLowerCase().trim(),
        position: userData.position?.trim() || null,
        phone: userData.phone?.trim() || null,
        role: userData.role,
        password_hash: passwordHash,
        status: "active",
        last_login: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating client user:", error)
      return {
        success: false,
        error: "Er is een fout opgetreden bij het aanmaken van de gebruiker.",
      }
    }

    console.log("User created successfully:", data.id)

    // Revalidate the client details page
    revalidatePath(`/dashboard/fc/klanten/${clientId}`)

    return {
      success: true,
      data: data,
    }
  } catch (error) {
    console.error("Error in createClientUser:", error)
    return {
      success: false,
      error: "Er is een onverwachte fout opgetreden.",
    }
  }
}
