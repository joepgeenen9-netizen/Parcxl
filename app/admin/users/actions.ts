"use server"

import { createServerClient } from "@/lib/supabase"
import { revalidatePath } from "next/cache"

export async function createSuperAdmin(data: { display_name: string; email: string }) {
  try {
    const supabase = createServerClient()

    // Create user in auth.users
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: data.email,
      email_confirm: false,
    })

    if (authError) {
      throw new Error(`Failed to create auth user: ${authError.message}`)
    }

    if (!authUser.user) {
      throw new Error("No user returned from auth creation")
    }

    // Insert into super_admins table
    const { error: insertError } = await supabase.from("super_admins").insert({
      id: authUser.user.id,
      display_name: data.display_name,
    })

    if (insertError) {
      // Cleanup: delete the auth user if super_admin insert fails
      await supabase.auth.admin.deleteUser(authUser.user.id)
      throw new Error(`Failed to create super admin record: ${insertError.message}`)
    }

    revalidatePath("/admin/users")
    return { success: true, message: "Super-admin account aangemaakt" }
  } catch (error) {
    console.error("Error creating super admin:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Er is een fout opgetreden",
    }
  }
}

export async function updateSuperAdmin(id: string, display_name: string) {
  try {
    const supabase = createServerClient()

    const { error } = await supabase.from("super_admins").update({ display_name }).eq("id", id)

    if (error) {
      throw new Error(`Failed to update super admin: ${error.message}`)
    }

    revalidatePath("/admin/users")
    return { success: true, message: "Super-admin bijgewerkt" }
  } catch (error) {
    console.error("Error updating super admin:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Er is een fout opgetreden",
    }
  }
}

export async function deleteSuperAdmin(id: string) {
  try {
    const supabase = createServerClient()

    // Delete from super_admins (will cascade to auth.users)
    const { error: deleteError } = await supabase.from("super_admins").delete().eq("id", id)

    if (deleteError) {
      throw new Error(`Failed to delete super admin: ${deleteError.message}`)
    }

    // Also delete from auth.users to be sure
    const { error: authDeleteError } = await supabase.auth.admin.deleteUser(id)

    if (authDeleteError) {
      console.warn("Warning: Failed to delete auth user:", authDeleteError.message)
    }

    revalidatePath("/admin/users")
    return { success: true, message: "Super-admin verwijderd" }
  } catch (error) {
    console.error("Error deleting super admin:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Er is een fout opgetreden",
    }
  }
}
