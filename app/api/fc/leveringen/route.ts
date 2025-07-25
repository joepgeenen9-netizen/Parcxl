import { createServerClient } from "@supabase/ssr"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      klant_id,
      leverancier_id,
      verwachte_aankomst,
      externe_referentie,
      vervoerder,
      tracking_link,
      opmerkingen,
      leverings_methode,
      status = "verwacht",
      aangemaakt_door_id,
      items,
    } = body

    // Validation
    if (!klant_id || !leverancier_id || !verwachte_aankomst || !leverings_methode || !items || items.length === 0) {
      return NextResponse.json({ error: "Ontbrekende verplichte velden" }, { status: 400 })
    }

    const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      cookies: { getAll: () => [], setAll: () => {} },
    })

    // Insert delivery
    const { data: delivery, error: deliveryError } = await supabase
      .from("leveringen")
      .insert({
        klant_id,
        leverancier_id,
        verwachte_aankomst,
        externe_referentie,
        vervoerder,
        tracking_link,
        opmerkingen,
        leverings_methode,
        status,
        aangemaakt_door_id,
      })
      .select()
      .single()

    if (deliveryError) {
      console.error("Error creating delivery:", deliveryError)
      return NextResponse.json({ error: "Fout bij het aanmaken van de levering" }, { status: 500 })
    }

    // Insert delivery items
    const deliveryItems = items.map((item: any) => ({
      levering_id: delivery.id,
      product_id: item.product_id,
      verwacht_aantal: item.verwacht_aantal,
      opslag_locatie_id: item.opslag_locatie_id,
    }))

    const { error: itemsError } = await supabase.from("levering_items").insert(deliveryItems)

    if (itemsError) {
      console.error("Error creating delivery items:", itemsError)
      return NextResponse.json({ error: "Fout bij het aanmaken van leveringsitems" }, { status: 500 })
    }

    return NextResponse.json({ success: true, delivery })
  } catch (error) {
    console.error("Error in POST /api/fc/leveringen:", error)
    return NextResponse.json({ error: "Server fout" }, { status: 500 })
  }
}
