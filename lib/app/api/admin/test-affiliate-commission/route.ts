import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { v4 as uuidv4 } from "uuid"
import { processAffiliateCommissionsSimple } from "@/lib/services/affiliate-service-simple"

export async function POST(request: Request) {
  try {
    let requestData
    try {
      requestData = await request.json()
    } catch (error) {
      return NextResponse.json({ success: false, error: "Format de requête invalide" }, { status: 400 })
    }

    const { userId, purchaseId, amount } = requestData

    if (!userId || !amount || amount <= 0) {
      return NextResponse.json({ success: false, error: "Données manquantes ou invalides" }, { status: 400 })
    }

    const supabase = await createServerSupabaseClient()

    // Vérifier si l'utilisateur existe
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id, name, email, referred_by")
      .eq("id", userId)
      .single()

    if (userError) {
      return NextResponse.json({ success: false, error: "Utilisateur non trouvé" }, { status: 404 })
    }

    // Utiliser l'ID d'achat fourni ou en générer un nouveau
    const actualPurchaseId = purchaseId || uuidv4()

    // Si aucun ID d'achat n'est fourni, créer un achat fictif pour le test
    if (!purchaseId) {
      const { error: purchaseError } = await supabase.from("purchases").insert({
        id: actualPurchaseId,
        user_id: userId,
        product_id: "test-product",
        amount,
        status: "completed",
        transaction_id: uuidv4(),
      })

      if (purchaseError) {
        return NextResponse.json(
          { success: false, error: "Erreur lors de la création de l'achat de test" },
          { status: 500 },
        )
      }
    }

    // Traiter les commissions d'affiliation
    const result = await processAffiliateCommissionsSimple(userId, actualPurchaseId, amount)

    return NextResponse.json({
      success: true,
      data: {
        userId,
        purchaseId: actualPurchaseId,
        amount,
        userInfo: {
          name: user.name,
          email: user.email,
          referredBy: user.referred_by,
        },
        commissionResults: result,
      },
    })
  } catch (error: any) {
    console.error("Erreur lors du test de commission:", error)
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 })
  }
}
