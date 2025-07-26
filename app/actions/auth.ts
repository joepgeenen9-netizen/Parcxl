"use server"

import { redirect } from "next/navigation"
import { supabase } from "@/lib/supabase"
import bcrypt from "bcryptjs"
import { cookies } from "next/headers"

interface LoginResult {
  success: boolean
  error?: string
  redirectTo?: string
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
    // Query the accounts table directly
    const { data: account, error } = await supabase.from("accounts").select("*").eq("email", email).single()

    if (error || !account) {
      return {
        success: false,
        error: "Ongeldige inloggegevens",
      }
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, account.password_hash)

    if (!isValidPassword) {
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

    // Redirect based on role
    const redirectTo = account.rol === "admin" ? "/admin" : "/dashboard"

    return {
      success: true,
      redirectTo,
    }
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
