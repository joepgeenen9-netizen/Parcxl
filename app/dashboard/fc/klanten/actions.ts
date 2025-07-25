"use server"

import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import type { Client, ClientStats } from "@/types/client"

export async function getClients(tenantId: string): Promise<{ data: Client[]; error?: string }> {
  try {
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

    const { data, error } = await supabase
      .from("fc_clients")
      .select("*")
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching clients:", error)
      return { data: [], error: error.message }
    }

    return { data: data || [] }
  } catch (error) {
    console.error("Error in getClients:", error)
    return { data: [], error: "Failed to fetch clients" }
  }
}

export async function getClientStats(tenantId: string): Promise<{ data: ClientStats; error?: string }> {
  try {
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

    // Get total clients
    const { count: totalClients } = await supabase
      .from("fc_clients")
      .select("*", { count: "exact", head: true })
      .eq("tenant_id", tenantId)

    // Get new clients in last 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { count: newClientsLast30Days } = await supabase
      .from("fc_clients")
      .select("*", { count: "exact", head: true })
      .eq("tenant_id", tenantId)
      .gte("created_at", thirtyDaysAgo.toISOString())

    // Revenue data is not available yet
    const stats: ClientStats = {
      totalClients: totalClients || 0,
      newClientsLast30Days: newClientsLast30Days || 0,
      revenueLast30Days: 0,
      hasRevenueData: false,
    }

    return { data: stats }
  } catch (error) {
    console.error("Error in getClientStats:", error)
    return {
      data: {
        totalClients: 0,
        newClientsLast30Days: 0,
        revenueLast30Days: 0,
        hasRevenueData: false,
      },
      error: "Failed to fetch client stats",
    }
  }
}
