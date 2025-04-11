import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { v4 as uuidv4 } from "uuid"
import { coinbaseClient, formatChargeData } from "@/lib/coinbase"

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Vous devez être connecté pour effectuer un paiement" }, { status: 401 })
    }

    const { productId, productName, price, userId } = await request.json()

    if (!productId || !productName || !price) {
      return NextResponse.json({ error: "Informations de produit manquantes" }, { status: 400 })
    }

    // Création d'un identifiant unique pour le paiement
    const paymentReferenceId = uuidv4()

    // URL du site
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"

    // Formater les données pour Coinbase
    const chargeData = formatChargeData(productName, price, session.user.id, productId, paymentReferenceId, siteUrl)

    // Créer une charge Coinbase Commerce
    const charge = await coinbaseClient.createCharge(chargeData)

    // Enregistrer la référence de paiement dans la base de données
    await supabase.from("payment_references").insert({
      id: paymentReferenceId,
      user_id: session.user.id,
      product_id: productId,
      amount: price,
      charge_id: charge.data.id,
      status: "pending",
    })

    return NextResponse.json({
      success: true,
      chargeId: charge.data.id,
      chargeUrl: charge.data.hosted_url,
    })
  } catch (error: any) {
    console.error("Erreur lors de la création du paiement:", error)
    return NextResponse.json({ error: error.message || "Erreur lors de la création du paiement" }, { status: 500 })
  }
}
