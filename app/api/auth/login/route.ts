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

    // Zoek gebruiker in database
    const users = await sql`
      SELECT 
        id,
        gebruikersnaam,
        wachtwoord_hash,
        email,
        straatnaam,
        huisnummer,
        huisnummer_toevoeging,
        postcode,
        plaats,
        status,
        contactpersoon,
        bedrijfsnaam,
        rol
      FROM accounts 
      WHERE gebruikersnaam = ${gebruikersnaam}
      LIMIT 1
    `

    if (users.length === 0) {
      return NextResponse.json({ error: "Ongeldige inloggegevens" }, { status: 401 })
    }

    const user = users[0]

    // Controleer account status
    if (user.status !== "actief") {
      return NextResponse.json({ error: "Account is niet actief. Neem contact op met de beheerder." }, { status: 401 })
    }

    // Verificeer wachtwoord
    const isValidPassword = await bcrypt.compare(wachtwoord, user.wachtwoord_hash)

    if (!isValidPassword) {
      return NextResponse.json({ error: "Ongeldige inloggegevens" }, { status: 401 })
    }

    // Verwijder wachtwoord hash uit response
    const { wachtwoord_hash, ...userWithoutPassword } = user

    return NextResponse.json({
      success: true,
      user: userWithoutPassword,
      message: "Succesvol ingelogd",
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Er is een serverfout opgetreden" }, { status: 500 })
  }
}
