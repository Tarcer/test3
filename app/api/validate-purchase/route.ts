import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const { purchaseId } = await request.json()

    if (!purchaseId) {
      return NextResponse.json({ success: false, error: "ID d'achat manquant" }, { status: 400 })
    }

    const supabase = await createServerSupabaseClient()

    // Mettre à jour la date de validation de l'achat
    const { data, error } = await supabase
      .from("purchases")
      .update({
        last_validated_at: new Date().toISOString(),
      })
      .eq("id", purchaseId)
      .select()
      .single()

    if (error) {
      console.error("Erreur lors de la mise à jour de la date de validation:", error)
      return NextResponse.json(
        { success: false, error: "Erreur lors de la mise à jour de la date de validation" },
        { status: 500 },
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error("Erreur dans la route API de validation d'achat:", error)
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 })
  }
}
