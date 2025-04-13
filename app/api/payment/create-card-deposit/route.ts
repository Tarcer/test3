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

    const { productId, productName, productPrice, successUrl, cancelUrl } = await request.json()

    if (!productId || !productName || !productPrice || !successUrl || !cancelUrl) {
      return NextResponse.json({ error: "Informations de produit manquantes" }, { status: 400 })
    }

    // Création d'un identifiant unique pour le paiement
    const paymentId = uuidv4()

    // Création d'une charge Coinbase Commerce
    const charge = await coinbaseClient.createCharge({
      name: productName,
      description: `Achat de ${productName} sur WebMarket Pro`,
      pricing_type: "fixed_price",
      local_price: {
        amount: productPrice,
        currency: "EUR",
      },
      metadata: {
        productId,
        userId: session.user.id,
        paymentId,
      },
      redirect_url: `${process.env.NEXT_PUBLIC_SITE_URL}${successUrl}?charge_id=${paymentId}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}${cancelUrl}`,
    })

    // Enregistrer la référence de paiement dans la base de données
    await supabase.from("payment_references").insert({
      id: paymentId,
      user_id: session.user.id,
      product_id: productId,
      amount: productPrice,
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
