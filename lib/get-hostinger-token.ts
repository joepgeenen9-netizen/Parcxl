import { createServerClient } from "@/lib/supabase"

export async function getHostingerToken(): Promise<string | null> {
  try {
    const supabase = createServerClient()

    const { data, error } = await supabase.from("settings").select("value").eq("key", "HOSTINGER_TOKEN").single()

    if (error || !data) {
      return null
    }

    return data.value
  } catch (error) {
    console.error("Error getting Hostinger token:", error)
    return null
  }
}
