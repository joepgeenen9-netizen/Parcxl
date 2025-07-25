"use server"

import { cookies } from "next/headers"
import { createClient } from "@/utils/supabase/server"

interface CreateSupplierInput {
  client_id: string
  naam: string
  contactpersoon?: string
  email?: string
  adres?: string
  postcode?: string
  stad?: string
  land?: string
  opmerkingen?: string
}

/**
 * Reads the `tenant-context` cookie and returns the parsed tenant object,
 * or `{ id: undefined }` if missing / malformed.
 */
function getTenant() {
  const cookieStore = cookies()
  const raw = cookieStore.get("tenant-context")?.value
  try {
    return raw ? JSON.parse(raw) : { id: undefined }
  } catch {
    return { id: undefined }
  }
}

/* ------------------------- Supplier CRUD actions ------------------------ */

export async function createSupplier(data: CreateSupplierInput) {
  const tenant = getTenant()
  if (!tenant.id) {
    return { success: false, error: "Geen tenant context gevonden" }
  }

  const supabase = createClient()

  /* Ensure the client (FC-klant) actually belongs to this tenant */
  const { error: clientErr } = await supabase
    .from("fc_clients")
    .select("id")
    .eq("id", data.client_id)
    .eq("tenant_id", tenant.id)
    .single()

  if (clientErr) {
    return { success: false, error: "Klant niet gevonden of geen toegang" }
  }

  /* Insert supplier ‒ streamlined fields only */
  const { data: supplier, error } = await supabase
    .from("leveranciers")
    .insert({
      tenant_id: tenant.id,
      client_id: data.client_id,
      naam: data.naam,
      contactpersoon: data.contactpersoon || null,
      email: data.email || null,
      adres: data.adres || null,
      postcode: data.postcode || null,
      stad: data.stad || null,
      land: data.land || "Nederland",
      opmerkingen: data.opmerkingen || null,
      actief: true,
    })
    .select()
    .single()

  if (error) {
    console.error("createSupplier:", error)
    return { success: false, error: "Fout bij het aanmaken van leverancier" }
  }

  return { success: true, supplier, message: "Leverancier succesvol toegevoegd" }
}

export async function getSuppliersByClient(clientId: string) {
  const tenant = getTenant()
  if (!tenant.id) {
    return { success: false, error: "Geen tenant context gevonden" }
  }

  const supabase = createClient()

  const { data: suppliers, error } = await supabase
    .from("leveranciers")
    .select("id, naam, contactpersoon, email")
    .eq("tenant_id", tenant.id)
    .eq("client_id", clientId)
    .eq("actief", true)
    .order("naam")

  if (error) {
    console.error("getSuppliersByClient:", error)
    return { success: false, error: "Fout bij het ophalen van leveranciers" }
  }

  return { success: true, suppliers: suppliers || [] }
}

export async function getProductsByClient(clientId: string) {
  const tenant = getTenant()
  if (!tenant.id) {
    return { success: false, error: "Geen tenant context gevonden" }
  }

  const supabase = createClient()

  /* Quick check that the client belongs to the tenant */
  const { error: clientErr } = await supabase
    .from("fc_clients")
    .select("id")
    .eq("id", clientId)
    .eq("tenant_id", tenant.id)
    .single()

  if (clientErr) {
    return { success: false, error: "Klant niet gevonden of geen toegang" }
  }

  const { data: products, error } = await supabase
    .from("fc_client_products")
    .select("id, name, sku, stock, article_number, barcode")
    .eq("tenant_id", tenant.id)
    .eq("client_id", clientId)
    .order("name")

  if (error) {
    console.error("getProductsByClient:", error)
    return { success: false, error: "Fout bij het ophalen van producten" }
  }

  return { success: true, products: products || [] }
}
