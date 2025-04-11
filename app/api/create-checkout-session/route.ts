import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { createServerSupabaseClient } from "@/lib/supabase/server"

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

    // Création d'une session de paiement Stripe
    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: productName,
            },
            unit_amount: productPrice * 100, // Stripe utilise les centimes
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}${cancelUrl}`,
      metadata: {
        productId,
        userId: session.user.id,
      },
    })

    return NextResponse.json({ sessionId: stripeSession.id, url: stripeSession.url })
  } catch (error: any) {
    console.error("Erreur lors de la création de la session de paiement:", error)
    return NextResponse.json(
      { error: error.message || "Erreur lors de la création de la session de paiement" },
      { status: 500 },
    )
  }
}
