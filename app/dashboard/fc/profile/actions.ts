"use server"

import { createClient } from "@supabase/supabase-js"
import bcrypt from "bcryptjs"
import { cookies } from "next/headers"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function getCurrentUser() {
  try {
    console.log("getCurrentUser: Starting...")

    const cookieStore = await cookies()
    const tenantContextCookie = cookieStore.get("tenant-context")

    if (!tenantContextCookie?.value) {
      console.log("getCurrentUser: No tenant context cookie found")
      throw new Error("Geen tenant context gevonden")
    }

    let tenantContext
    try {
      tenantContext = JSON.parse(tenantContextCookie.value)
      console.log("getCurrentUser: Parsed tenant context:", tenantContext)
    } catch (parseError) {
      console.error("getCurrentUser: Error parsing tenant context:", parseError)
      throw new Error("Ongeldige tenant context")
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    console.log("getCurrentUser: Querying tenant_users for tenant_id:", tenantContext.id)

    // Get current user from tenant_users table
    const { data: users, error } = await supabase
      .from("tenant_users")
      .select("id, tenant_id, username, email, is_admin, created_at")
      .eq("tenant_id", tenantContext.id)

    if (error) {
      console.error("getCurrentUser: Database error:", error)
      throw new Error("Database fout bij ophalen gebruiker")
    }

    console.log("getCurrentUser: Found users:", users)

    if (!users || users.length === 0) {
      console.log("getCurrentUser: No users found for tenant")
      throw new Error("Geen gebruikers gevonden voor deze tenant")
    }

    // For now, return the first user (in a real app, you'd get this from session)
    const user = users[0]
    console.log("getCurrentUser: Returning user:", user)

    return { success: true, user }
  } catch (error) {
    console.error("getCurrentUser error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Onbekende fout opgetreden",
    }
  }
}

export async function updateUserProfile(formData: FormData) {
  try {
    console.log("Starting profile update...")

    const cookieStore = await cookies()
    const tenantContextCookie = cookieStore.get("tenant-context")

    if (!tenantContextCookie?.value) {
      console.log("No tenant context cookie found")
      return { success: false, error: "Geen tenant context gevonden" }
    }

    const tenantContext = JSON.parse(tenantContextCookie.value)
    console.log("Tenant context:", tenantContext)

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const username = formData.get("username") as string
    const email = formData.get("email") as string
    const currentPassword = formData.get("currentPassword") as string
    const newPassword = formData.get("newPassword") as string

    console.log("Form data received:", {
      username,
      email,
      hasCurrentPassword: !!currentPassword,
      hasNewPassword: !!newPassword,
    })

    if (!username || !email) {
      return { success: false, error: "Gebruikersnaam en e-mail zijn verplicht" }
    }

    // Get current user
    const { data: currentUser, error: userError } = await supabase
      .from("tenant_users")
      .select("id, password_hash, username, email")
      .eq("tenant_id", tenantContext.id)
      .single()

    if (userError) {
      console.error("Error fetching current user:", userError)
      return { success: false, error: "Gebruiker niet gevonden" }
    }

    console.log("Current user found:", { id: currentUser.id, username: currentUser.username, email: currentUser.email })

    // Prepare update data - removed updated_at since column doesn't exist
    const updateData: any = {
      username,
      email,
    }

    // If password change is requested
    if (newPassword) {
      if (!currentPassword) {
        return { success: false, error: "Huidig wachtwoord is verplicht om het wachtwoord te wijzigen" }
      }

      console.log("Password change requested, verifying current password...")

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, currentUser.password_hash)
      if (!isCurrentPasswordValid) {
        console.log("Current password verification failed")
        return { success: false, error: "Huidig wachtwoord is onjuist" }
      }

      console.log("Current password verified, hashing new password...")

      // Hash new password
      const saltRounds = 12
      const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds)
      updateData.password_hash = hashedNewPassword

      console.log("New password hashed successfully")
    }

    console.log("Updating user profile with data:", {
      ...updateData,
      password_hash: updateData.password_hash ? "[HIDDEN]" : undefined,
    })

    // Update user profile
    const { data: updatedData, error: updateError } = await supabase
      .from("tenant_users")
      .update(updateData)
      .eq("id", currentUser.id)
      .select()

    if (updateError) {
      console.error("Profile update error:", updateError)
      return { success: false, error: "Fout bij het bijwerken van het profiel" }
    }

    console.log("Profile updated successfully:", updatedData)

    return { success: true, message: "Profiel succesvol bijgewerkt" }
  } catch (error) {
    console.error("updateUserProfile error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Onbekende fout opgetreden",
    }
  }
}
