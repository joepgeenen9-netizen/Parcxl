"use server"

import { redirect } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { cookies } from "next/headers"

interface LoginResult {
  success: boolean
  error?: string
}

export async function loginAction(formData: FormData): Promise<LoginResult> {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) {
    return {
      success: false,
      error: "Email en wachtwoord zijn verplicht",
    }
  }

  try {
    // Voor demo doeleinden gebruiken we simpele wachtwoord verificatie
    // In productie zou je bcrypt gebruiken
    const { data: account, error } = await supabase.from("accounts").select("*").eq("email", email).single()

    if (error || !account) {
      return {
        success: false,
        error: "Ongeldige inloggegevens",
      }
    }

    // Simpele wachtwoord check voor demo (gebruik bcrypt in productie)
    if (password !== "password") {
      return {
        success: false,
        error: "Ongeldige inloggegevens",
      }
    }

    // Set session cookie
    const cookieStore = await cookies()
    const sessionData = {
      id: account.id,
      email: account.email,
      name: account.name,
      company: account.company,
      rol: account.rol,
    }

    cookieStore.set("user-session", JSON.stringify(sessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return { success: true }
  } catch (error) {
    console.error("Login error:", error)
    return {
      success: false,
      error: "Er is een fout opgetreden bij het inloggen",
    }
  }
}

export async function logoutAction() {
  const cookieStore = await cookies()
  cookieStore.delete("user-session")
  redirect("/login")
}
