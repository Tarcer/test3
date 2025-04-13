import { NextResponse } from "next/server"
import { coinbaseClient } from "@/lib/coinbase"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { v4 as uuidv4 } from "uuid"

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Vous devez être connecté pour effectuer un paiement" }, { status: 401 })
    }

    const { amount } = await request.json()

    if (!amount) {
      return NextResponse.json({ error: "Informations de dépôt manquantes" }, { status: 400 })
    }

    // Création d'un identifiant unique pour le paiement
    const paymentId = uuidv4()

    // Création d'une charge Coinbase Commerce
    // Since this is a deposit, we'll use generic names and descriptions
    const charge = await coinbaseClient.createCharge({
      name: "Dépôt sur WebMarket Pro",
      description: `Dépôt de fonds sur WebMarket Pro`,
      pricing_type: "fixed_price",
      local_price: {
        amount: amount.toString(),
        currency: "EUR",
      },
      metadata: {
        userId: session.user.id,
        paymentId,
      },
      redirect_url: `${process.env.NEXT_PUBLIC_SITE_URL}/payment/success?charge_id=${paymentId}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/payment/cancel`,
    })

    // Enregistrer la référence de paiement dans la base de données
    await supabase.from("payment_references").insert({
      id: paymentId,
      user_id: session.user.id,
      product_id: "deposit", // Using "deposit" as a generic product ID
      amount: Number(amount),
      charge_id: charge.data.id,
      status: "pending",
    })

    return NextResponse.json({
      success: true,
      chargeId: charge.data.id,
      hostedUrl: charge.data.hosted_url,
    })
  } catch (error: any) {
    console.error("Erreur lors de la création du paiement:", error)
    return NextResponse.json({ error: error.message || "Erreur lors de la création du paiement" }, { status: 500 })
  }
}
