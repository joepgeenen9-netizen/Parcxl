"use server"

import { createServerClient } from "@/lib/supabase"
import { revalidatePath } from "next/cache"

export async function getSetting(key: string) {
  try {
    const supabase = createServerClient()

    const { data, error } = await supabase.from("settings").select("value").eq("key", key).single()

    if (error && error.code !== "PGRST116") {
      throw new Error(`Failed to get setting: ${error.message}`)
    }

    return { success: true, value: data?.value || null }
  } catch (error) {
    console.error("Error getting setting:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Er is een fout opgetreden",
      value: null,
    }
  }
}

export async function upsertSetting(key: string, value: string) {
  try {
    const supabase = createServerClient()

    const { error } = await supabase
      .from("settings")
      .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: "key" })

    if (error) {
      throw new Error(`Failed to save setting: ${error.message}`)
    }

    revalidatePath("/admin/settings")
    return { success: true, message: "Instelling opgeslagen" }
  } catch (error) {
    console.error("Error saving setting:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Er is een fout opgetreden",
    }
  }
}

export async function deleteSetting(key: string) {
  try {
    const supabase = createServerClient()

    const { error } = await supabase.from("settings").delete().eq("key", key)

    if (error) {
      throw new Error(`Failed to delete setting: ${error.message}`)
    }

    revalidatePath("/admin/settings")
    return { success: true, message: "Instelling verwijderd" }
  } catch (error) {
    console.error("Error deleting setting:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Er is een fout opgetreden",
    }
  }
}
