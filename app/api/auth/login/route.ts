import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import bcrypt from "bcryptjs"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: NextRequest) {
  try {
    const { gebruikersnaam, wachtwoord } = await request.json()

    if (!gebruikersnaam || !wachtwoord) {
      return NextResponse.json({ error: "Gebruikersnaam en wachtwoord zijn verplicht" }, { status: 400 })
    }

    // Find user in database
    const users = await sql`
      SELECT id, gebruikersnaam, wachtwoord_hash, email, contactpersoon, bedrijfsnaam, rol, status
      FROM accounts 
      WHERE gebruikersnaam = ${gebruikersnaam}
      LIMIT 1
    `

    if (users.length === 0) {
      return NextResponse.json({ error: "Ongeldige inloggegevens" }, { status: 401 })
    }

    const user = users[0]

    // Check if account is active
    if (user.status !== "actief") {
      return NextResponse.json({ error: "Account is niet actief. Neem contact op met de beheerder." }, { status: 401 })
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(wachtwoord, user.wachtwoord_hash)

    if (!isValidPassword) {
      return NextResponse.json({ error: "Ongeldige inloggegevens" }, { status: 401 })
    }

    // Remove password hash from response
    const { wachtwoord_hash, ...userWithoutPassword } = user

    return NextResponse.json({
      message: "Succesvol ingelogd",
      user: userWithoutPassword,
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Er is een serverfout opgetreden" }, { status: 500 })
  }
}
