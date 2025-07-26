import { cookies } from "next/headers"

export interface User {
  id: string
  email: string
  name: string
  company?: string
  rol: "admin" | "klant"
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies()
    const userSession = cookieStore.get("user-session")

    if (!userSession) {
      return null
    }

    const user = JSON.parse(userSession.value)
    return user
  } catch {
    return null
  }
}
