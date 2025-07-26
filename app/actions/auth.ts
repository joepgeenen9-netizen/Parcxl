"use server"

import { createServerClient } from "@/lib/supabase"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) {
    return { error: "Email en wachtwoord zijn verplicht" }
  }

  const supabase = createServerClient()

  // Authenticate user
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (authError) {
    return { error: "Ongeldige inloggegevens" }
  }

  if (!authData.user) {
    return { error: "Gebruiker niet gevonden" }
  }

  // Get user role from accounts table
  const { data: accountData, error: accountError } = await supabase
    .from("accounts")
    .select("rol")
    .eq("email", email)
    .single()

  if (accountError || !accountData) {
    return { error: "Account niet gevonden in database" }
  }

  // Set session cookie
  const cookieStore = await cookies()
  cookieStore.set("supabase-auth-token", authData.session?.access_token || "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })

  // Redirect based on role
  if (accountData.rol === "admin") {
    redirect("/admin")
  } else if (accountData.rol === "klant") {
    redirect("/customer")
  } else {
    return { error: "Onbekende gebruikersrol" }
  }
}
