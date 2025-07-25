import { supabase } from "@/lib/supabase"

export async function clearAllAuthState() {
  try {
    // Clear Supabase session
    await supabase.auth.signOut({ scope: "global" })

    // Clear any localStorage items
    if (typeof window !== "undefined") {
      localStorage.removeItem("tenant-user")
      localStorage.removeItem("supabase.auth.token")
      localStorage.clear()

      // Clear sessionStorage as well
      sessionStorage.clear()

      // Clear any cookies
      document.cookie.split(";").forEach((c) => {
        const eqPos = c.indexOf("=")
        const name = eqPos > -1 ? c.substr(0, eqPos) : c
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/"
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=" + window.location.hostname
      })
    }
  } catch (error) {
    console.error("Error clearing auth state:", error)
  }
}

export async function performSecureLogout() {
  try {
    // Clear all authentication state
    await clearAllAuthState()

    // Force a hard redirect to login page
    if (typeof window !== "undefined") {
      window.location.href = "/login"
    }
  } catch (error) {
    console.error("Error during logout:", error)
    // Force redirect even if there's an error
    if (typeof window !== "undefined") {
      window.location.href = "/login"
    }
  }
}
