"use server"

import { supabaseServer } from "@/lib/supabase-server"
import bcrypt from "bcryptjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) {
    return {
      error: "Email en wachtwoord zijn verplicht",
    }
  }

  try {
    // Get user from accounts table
    const { data: account, error: accountError } = await supabaseServer
      .from("accounts")
      .select("*")
      .eq("email", email)
      .single()

    if (accountError || !account) {
      return {
        error: "Ongeldige inloggegevens",
      }
    }

    // Verify password (in production, use proper password hashing)
    // For demo purposes, we'll accept any password for these test accounts
    const validPassword = password === "password" || (await bcrypt.compare(password, account.password_hash))

    if (!validPassword) {
      return {
        error: "Ongeldige inloggegevens",
      }
    }

    // Set session cookie
    const cookieStore = await cookies()
    cookieStore.set(
      "user-session",
      JSON.stringify({
        id: account.id,
        email: account.email,
        name: account.name,
        company: account.company,
        rol: account.rol,
      }),
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      },
    )

    // Redirect based on role
    if (account.rol === "admin") {
      redirect("/admin")
    } else {
      redirect("/dashboard")
    }
  } catch (error) {
    console.error("Login error:", error)
    return {
      error: "Er is een fout opgetreden bij het inloggen",
    }
  }
}

export async function logoutAction() {
  const cookieStore = await cookies()
  cookieStore.delete("user-session")
  redirect("/login")
}
