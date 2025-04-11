import { NextResponse } from "next/server"
import crypto from "crypto"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { confirmDeposit } from "@/lib/services/deposit-service"
import { emitTransactionEvent } from "@/lib/events/transaction-events"

// Fonction pour vérifier la signature du webhook Coinbase
function verifyWebhookSignature(signature: string, rawBody: string, secret: string) {
  const hmac = crypto.createHmac("sha256", secret)
  hmac.update(rawBody)
  const computedSignature = hmac.digest("hex")
  return computedSignature === signature
}

export async function POST(request: Request) {
  try {
    // Vérifier la signature du webhook
    const signature = request.headers.get("x-cc-webhook-signature")
    const rawBody = await request.text()

    if (!signature || !process.env.COINBASE_COMMERCE_WEBHOOK_SECRET) {
      console.error("Signature ou secret manquant")
      return NextResponse.json({ error: "Signature invalide" }, { status: 401 })
    }

    // Vérifier la signature
    const isValidSignature = verifyWebhookSignature(signature, rawBody, process.env.COINBASE_COMMERCE_WEBHOOK_SECRET)

    if (!isValidSignature) {
      console.error("Signature invalide")
      return NextResponse.json({ error: "Signature invalide" }, { status: 401 })
    }

    // Traiter l'événement
    const event = JSON.parse(rawBody)

    // Nous ne traitons que les événements de confirmation de paiement
    if (event.type !== "charge:confirmed") {
      // Ignorer les autres types d'événements
      return NextResponse.json({ success: true, message: "Événement ignoré" })
    }

    const chargeData = event.data
    const chargeId = chargeData.id
    const metadata = chargeData.metadata

    if (!metadata || !metadata.userId || !metadata.depositId) {
      console.error("Métadonnées manquantes dans la charge")
      return NextResponse.json({ error: "Métadonnées manquantes" }, { status: 400 })
    }

    const supabase = await createServerSupabaseClient()

    // Vérifier si le dépôt existe
    const { data: deposit, error: depositError } = await supabase
      .from("deposits")
      .select("*")
      .eq("id", metadata.depositId)
      .single()

    if (depositError || !deposit) {
      console.error("Dépôt non trouvé:", depositError)
      return NextResponse.json({ error: "Dépôt non trouvé" }, { status: 404 })
    }

    // Si le dépôt est déjà confirmé, ne rien faire
    if (deposit.status === "confirmed") {
      return NextResponse.json({ success: true, message: "Dépôt déjà confirmé" })
    }

    // Confirmer le dépôt
    const result = await confirmDeposit(metadata.depositId)

    if (!result.success) {
      console.error("Erreur lors de la confirmation du dépôt:", result.error)
      return NextResponse.json({ error: "Erreur lors de la confirmation du dépôt" }, { status: 500 })
    }

    // Émettre un événement de dépôt confirmé
    await emitTransactionEvent({
      type: "deposit",
      userId: metadata.userId,
      amount: Number(chargeData.pricing.local.amount),
      transactionId: metadata.depositId,
      metadata: {
        depositId: metadata.depositId,
        status: "confirmed",
        source: "coinbase_commerce",
      },
    })

    console.log("Dépôt par carte confirmé avec succès:", metadata.depositId)
    return NextResponse.json({ success: true, message: "Dépôt confirmé" })
  } catch (error: any) {
    console.error("Erreur lors du traitement du webhook:", error)
    return NextResponse.json({ error: error.message || "Erreur interne" }, { status: 500 })
  }
}
