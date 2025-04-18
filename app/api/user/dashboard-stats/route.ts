import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"
import type { Database } from "@/lib/supabase/database.types"

// Assurons-nous que toutes les données sont correctement récupérées et calculées
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get("userId")
    const skipCache = searchParams.get("skipCache") === "true"
    // Forcer ces valeurs à true pour toujours récupérer les totaux cumulés
    const includeTotal = true
    const allTime = true

    if (!userId) {
      return NextResponse.json({ success: false, error: "ID utilisateur manquant" }, { status: 400 })
    }

    console.log(
      `Récupération des statistiques pour l'utilisateur ${userId}, includeTotal=${includeTotal}, allTime=${allTime}`,
    )

    // Créer un client Supabase pour les Route Handlers
    const supabase = createRouteHandlerClient<Database>({ cookies })

    // Vérifier si l'utilisateur existe
    const { data: user, error: userError } = await supabase.from("users").select("id").eq("id", userId).single()

    if (userError) {
      console.error("Erreur lors de la vérification de l'utilisateur:", userError)
      return NextResponse.json({ success: false, error: "Utilisateur non trouvé" }, { status: 404 })
    }

    console.log(`Utilisateur ${userId} trouvé, récupération des statistiques...`)

    // Récupérer les statistiques
    const [balanceResult, purchasesResult, affiliateResult, earningsResult] = await Promise.all([
      // Solde disponible
      supabase
        .from("balance_transactions")
        .select("amount, type")
        .eq("user_id", userId),
      // Nombre d'achats
      supabase
        .from("purchases")
        .select("id")
        .eq("user_id", userId)
        .eq("status", "completed"),
      // Commissions d'affiliation
      supabase
        .from("affiliate_commissions")
        .select("amount")
        .eq("user_id", userId),
      // Revenus quotidiens (dernières 24h)
      supabase
        .from("earnings")
        .select("amount")
        .eq("user_id", userId)
        .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),
    ])

    // Calculer le solde
    let available = 0
    let deposits = 0
    let purchases = 0

    if (!balanceResult.error && balanceResult.data) {
      balanceResult.data.forEach((tx) => {
        const amount = Number(tx.amount) || 0

        if (tx.type === "deposit" || tx.type === "credit") {
          available += amount
          deposits += amount
        } else if (tx.type === "purchase" || tx.type === "withdrawal" || tx.type === "debit") {
          available -= amount
          if (tx.type === "purchase") {
            purchases += amount
          }
        }
      })
    }

    // Calculer les commissions d'affiliation
    let affiliateCommissions = 0
    if (!affiliateResult.error && affiliateResult.data) {
      affiliateCommissions = affiliateResult.data.reduce((sum, item) => sum + Number(item.amount), 0)
    }

    // Calculer les revenus quotidiens
    let dailyEarnings = 0
    if (!earningsResult.error && earningsResult.data) {
      dailyEarnings = earningsResult.data.reduce((sum, item) => sum + Number(item.amount), 0)
    }

    // Récupérer les achats pour calculer l'investissement total
    const { data: purchasesData, error: purchasesError } = await supabase
      .from("purchases")
      .select("amount")
      .eq("user_id", userId)
      .eq("status", "completed")

    const totalInvested = purchasesData ? purchasesData.reduce((sum, p) => sum + Number(p.amount), 0) : 0

    // IMPORTANT: Calculer les revenus totaux cumulés (tous les revenus depuis le début)
    // Récupérer TOUS les revenus (pas seulement ceux des dernières 24h)
    const { data: allEarnings, error: allEarningsError } = await supabase
      .from("earnings")
      .select("amount")
      .eq("user_id", userId)
    // Aucune limite temporelle ici pour récupérer tous les revenus

    console.log(`Récupération de TOUS les revenus pour ${userId}:`, {
      count: allEarnings?.length || 0,
      error: allEarningsError?.message,
    })

    // Récupérer TOUTES les commissions (pas seulement celles des dernières 24h)
    const { data: allCommissions, error: allCommissionsError } = await supabase
      .from("affiliate_commissions")
      .select("amount")
      .eq("user_id", userId)
    // Aucune limite temporelle ici pour récupérer toutes les commissions

    console.log(`Récupération de TOUTES les commissions pour ${userId}:`, {
      count: allCommissions?.length || 0,
      error: allCommissionsError?.message,
    })

    // Calculer le total cumulatif des revenus
    let totalCumulativeEarnings = 0
    if (!allEarningsError && allEarnings) {
      totalCumulativeEarnings = allEarnings.reduce((sum, item) => sum + Number(item.amount), 0)
    }

    // Calculer le total cumulatif des commissions
    let totalCumulativeCommissions = 0
    if (!allCommissionsError && allCommissions) {
      totalCumulativeCommissions = allCommissions.reduce((sum, item) => sum + Number(item.amount), 0)
    }

    // Calculer explicitement le total cumulatif
    const totalCumulative = totalCumulativeEarnings + totalCumulativeCommissions

    // Log détaillé pour le débogage
    console.log("API calculated values:", {
      totalCumulativeEarnings,
      totalCumulativeCommissions,
      totalCumulative,
    })

    // Après le calcul de totalCumulative
    console.log(`IMPORTANT - Valeurs calculées pour l'utilisateur ${userId}:`, {
      dailyEarnings,
      totalCumulativeEarnings,
      totalCumulativeCommissions,
      totalCumulative,
    })

    const responseData = {
      balance: {
        available,
        deposits,
        purchases,
        totalInvested,
      },
      purchasesCount: purchasesResult.error ? 0 : purchasesResult.data.length,
      affiliateCommissions,
      dailyEarnings,
      // CORRECTION: Toujours inclure le total cumulatif dans la réponse
      totalEarnings: totalCumulativeEarnings,
      totalCommissions: totalCumulativeCommissions,
      totalCumulative: totalCumulative, // Cette valeur doit être utilisée pour "Revenus Totaux"
    }

    console.log(`Statistiques calculées pour l'utilisateur ${userId}:`, responseData)

    return NextResponse.json({
      success: true,
      data: responseData,
    })
  } catch (error: any) {
    console.error("Erreur dans la route API de statistiques:", error)
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 })
  }
}
