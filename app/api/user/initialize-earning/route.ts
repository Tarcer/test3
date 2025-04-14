import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { v4 as uuidv4 } from "uuid"
import type { Database } from "@/lib/supabase/database.types"

// Cette API permet d'initialiser les revenus pour un utilisateur
// en créant des entrées dans la table earnings pour tous ses achats
export async function POST(request: Request) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ success: false, error: "ID utilisateur manquant" }, { status: 400 })
    }

    const supabase = createRouteHandlerClient<Database>({ cookies })

    // Vérifier si l'utilisateur existe
    const { data: user, error: userError } = await supabase.from("users").select("id").eq("id", userId).single()

    if (userError) {
      console.error("Erreur lors de la vérification de l'utilisateur:", userError)
      return NextResponse.json({ success: false, error: "Utilisateur non trouvé" }, { status: 404 })
    }

    // Récupérer tous les achats de l'utilisateur
    const { data: purchases, error: purchasesError } = await supabase
      .from("purchases")
      .select("id, amount, created_at")
      .eq("user_id", userId)
      .eq("status", "completed")

    if (purchasesError) {
      console.error("Erreur lors de la récupération des achats:", purchasesError)
      return NextResponse.json({ success: false, error: "Impossible de récupérer les achats" }, { status: 500 })
    }

    if (purchases.length === 0) {
      return NextResponse.json({ success: false, error: "Aucun achat trouvé pour cet utilisateur" }, { status: 404 })
    }

    // Pour chaque achat, créer des revenus quotidiens
    const earningsToInsert = []
    const today = new Date()

    for (const purchase of purchases) {
      // Calculer le montant quotidien (1/45 du prix d'achat)
      const dailyAmount = Number(purchase.amount) / 45

      // Créer un revenu pour aujourd'hui
      earningsToInsert.push({
        id: uuidv4(),
        user_id: userId,
        purchase_id: purchase.id,
        amount: dailyAmount,
        day_number: 1, // Jour 1
        status: "completed",
        created_at: today.toISOString(),
      })

      // Créer quelques revenus historiques (pour les 7 derniers jours)
      for (let i = 1; i <= 7; i++) {
        const pastDate = new Date(today)
        pastDate.setDate(pastDate.getDate() - i)

        earningsToInsert.push({
          id: uuidv4(),
          user_id: userId,
          purchase_id: purchase.id,
          amount: dailyAmount,
          day_number: i + 1, // Jour 2, 3, etc.
          status: "completed",
          created_at: pastDate.toISOString(),
        })
      }
    }

    // Insérer les revenus dans la base de données
    if (earningsToInsert.length > 0) {
      const { error: insertError } = await supabase.from("earnings").insert(earningsToInsert)

      if (insertError) {
        console.error("Erreur lors de l'insertion des revenus:", insertError)
        return NextResponse.json({ success: false, error: "Impossible d'insérer les revenus" }, { status: 500 })
      }
    }

    return NextResponse.json({
      success: true,
      message: `${earningsToInsert.length} revenus générés avec succès`,
      data: {
        earningsCount: earningsToInsert.length,
        purchasesCount: purchases.length,
      },
    })
  } catch (error: any) {
    console.error("Erreur dans la route API d'initialisation des revenus:", error)
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 })
  }
}
