import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"
import type { Database } from "@/lib/supabase/database.types"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get("userId")
    const period = searchParams.get("period") || "month" // day, week, month, year

    if (!userId) {
      return NextResponse.json({ success: false, error: "ID utilisateur manquant" }, { status: 400 })
    }

    // Créer un client Supabase pour les Route Handlers
    const supabase = createRouteHandlerClient<Database>({ cookies })

    // Déterminer la date de début en fonction de la période
    const now = new Date()
    let startDate: Date

    switch (period) {
      case "day":
        // Pour la période "day", on prend juste aujourd'hui
        startDate = new Date(now)
        startDate.setHours(0, 0, 0, 0)

        // Ajouter un log pour déboguer
        console.log(`Période "day" - startDate:`, startDate.toISOString())
        break
      case "week":
        const day = now.getDay()
        startDate = new Date(now.setDate(now.getDate() - day))
        startDate.setHours(0, 0, 0, 0)
        break
      case "year":
        startDate = new Date(now.getFullYear(), 0, 1)
        break
      case "month":
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
    }

    // Récupérer les revenus pour la période spécifiée
    const { data: earnings, error: earningsError } = await supabase
      .from("earnings")
      .select("amount, day_number, created_at, status")
      .eq("user_id", userId)
      .gte("created_at", startDate.toISOString())
      .order("created_at", { ascending: true })

    if (earningsError) {
      console.error("Erreur lors de la récupération des revenus:", earningsError)
      return NextResponse.json({ success: false, error: "Impossible de récupérer les revenus" }, { status: 500 })
    }

    // Ajouter un log pour voir les revenus récupérés
    console.log(`Revenus pour ${userId} (période ${period}):`, earnings.length ? earnings.slice(0, 3) : "Aucun")

    // Récupérer les commissions d'affiliation pour la période spécifiée
    const { data: commissions, error: commissionsError } = await supabase
      .from("affiliate_commissions")
      .select("amount, level, created_at")
      .eq("user_id", userId)
      .gte("created_at", startDate.toISOString())
      .order("created_at", { ascending: true })

    if (commissionsError) {
      console.error("Erreur lors de la récupération des commissions:", commissionsError)
      return NextResponse.json({ success: false, error: "Impossible de récupérer les commissions" }, { status: 500 })
    }

    // Calculer les totaux
    const totalEarnings = earnings.reduce((sum, item) => sum + Number(item.amount), 0)
    const totalCommissions = commissions.reduce((sum, item) => sum + Number(item.amount), 0)

    // Organiser les données par jour pour le graphique
    const earningsByDay = new Map<string, number>()
    const commissionsByDay = new Map<string, number>()

    // Si on est en mode "day", on s'assure d'avoir une entrée pour aujourd'hui
    if (period === "day") {
      const today = new Date().toISOString().split("T")[0]
      earningsByDay.set(today, 0)
      console.log(`Initialisation de earningsByDay pour aujourd'hui (${today}):`, earningsByDay)
    }

    earnings.forEach((earning) => {
      const date = new Date(earning.created_at).toISOString().split("T")[0]
      const currentAmount = earningsByDay.get(date) || 0
      const newAmount = currentAmount + Number(earning.amount)
      earningsByDay.set(date, newAmount)

      // Log pour le premier élément
      if (earnings.indexOf(earning) === 0) {
        console.log(`Premier revenu - date: ${date}, montant: ${earning.amount}, total: ${newAmount}`)
      }
    })

    // Ajouter un log pour voir les données finales
    console.log(`earningsByDay final:`, Object.fromEntries(earningsByDay))

    commissions.forEach((commission) => {
      const date = new Date(commission.created_at).toISOString().split("T")[0]
      commissionsByDay.set(date, (commissionsByDay.get(date) || 0) + Number(commission.amount))
    })

    // Convertir les Maps en tableaux pour la réponse JSON
    const earningsData = Array.from(earningsByDay.entries()).map(([date, amount]) => ({ date, amount }))
    const commissionsData = Array.from(commissionsByDay.entries()).map(([date, amount]) => ({ date, amount }))

    return NextResponse.json({
      success: true,
      data: {
        totalEarnings,
        totalCommissions,
        earningsByDay: earningsData,
        commissionsByDay: commissionsData,
      },
    })
  } catch (error: any) {
    console.error("Erreur dans la route API de revenus:", error)
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 })
  }
}
