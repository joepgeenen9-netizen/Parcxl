"use server"

import { createServerClient } from "@/lib/supabase-server"
import { redirect } from "next/navigation"

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) {
    return { error: "Email en wachtwoord zijn verplicht" }
  }

  const supabase = await createServerClient()

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

  // Get user profile from profiles table
  const { data: profileData, error: profileError } = await supabase
    .from("profiles")
    .select("user_type")
    .eq("id", authData.user.id)
    .single()

  if (profileError || !profileData) {
    return { error: "Profiel niet gevonden in database" }
  }

  // Redirect based on user_type
  if (profileData.user_type === "admin") {
    redirect("/admin")
  } else if (profileData.user_type === "customer") {
    redirect("/customer")
  } else {
    return { error: "Onbekende gebruikersrol" }
  }
}
