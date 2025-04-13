import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"
import type { Database } from "@/lib/supabase/database.types"

// Cache pour les revenus quotidiens
const dailyEarningsCache = new Map<string, { amount: number; timestamp: number }>()
const CACHE_TTL = 60 * 1000 // 1 minute en millisecondes

// Assurons-nous que les revenus quotidiens sont correctement calculés
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get("userId")
    const date = searchParams.get("date") || new Date().toISOString().split("T")[0]
    const skipCache = searchParams.get("skipCache") === "true"

    if (!userId) {
      return NextResponse.json({ success: false, error: "ID utilisateur manquant" }, { status: 400 })
    }

    console.log(`Récupération des revenus quotidiens pour l'utilisateur ${userId} à la date ${date}`)

    // Clé de cache unique pour cet utilisateur et cette date
    const cacheKey = `${userId}-${date}`

    // Vérifier le cache si on ne force pas le rafraîchissement
    if (!skipCache) {
      const cachedData = dailyEarningsCache.get(cacheKey)
      if (cachedData && Date.now() - cachedData.timestamp < CACHE_TTL) {
        console.log(
          `Utilisation du cache pour les revenus quotidiens de ${userId} à la date ${date}:`,
          cachedData.amount,
        )
        return NextResponse.json({
          success: true,
          data: cachedData.amount,
          cached: true,
        })
      }
    }

    // Créer un client Supabase pour les Route Handlers
    const supabase = createRouteHandlerClient<Database>({ cookies })

    // Vérifier si l'utilisateur existe
    const { data: user, error: userError } = await supabase.from("users").select("id").eq("id", userId).single()

    if (userError) {
      console.error("Erreur lors de la vérification de l'utilisateur:", userError)
      return NextResponse.json({ success: false, error: "Utilisateur non trouvé" }, { status: 404 })
    }

    // Convertir la date en objet Date pour obtenir le début et la fin de la journée
    const targetDate = new Date(date)
    const startOfDay = new Date(targetDate)
    startOfDay.setHours(0, 0, 0, 0)

    const endOfDay = new Date(targetDate)
    endOfDay.setHours(23, 59, 59, 999)

    console.log(`Période de recherche: ${startOfDay.toISOString()} à ${endOfDay.toISOString()}`)

    // Récupérer les revenus pour cette journée spécifique
    const { data: earnings, error: earningsError } = await supabase
      .from("earnings")
      .select("amount, day_number, created_at, status")
      .eq("user_id", userId)
      .gte("created_at", startOfDay.toISOString())
      .lte("created_at", endOfDay.toISOString())

    if (earningsError) {
      console.error("Erreur lors de la récupération des revenus:", earningsError)
      return NextResponse.json({ success: false, error: "Impossible de récupérer les revenus" }, { status: 500 })
    }

    // Ajouter des logs pour déboguer
    console.log(`Revenus trouvés pour ${userId} le ${date}:`, earnings.length)
    if (earnings.length > 0) {
      console.log("Premier revenu:", earnings[0])
    }

    // Calculer le total des revenus
    const totalEarnings = earnings.reduce((sum, item) => sum + Number(item.amount), 0)

    // Ajouter un log pour le total
    console.log(`Total des revenus pour ${userId} le ${date}:`, totalEarnings)

    // Récupérer les commissions d'affiliation pour la période spécifiée
    const { data: commissions, error: commissionsError } = await supabase
      .from("affiliate_commissions")
      .select("amount, level, created_at")
      .eq("user_id", userId)
      .gte("created_at", startOfDay.toISOString())
      .lte("created_at", endOfDay.toISOString())

    if (commissionsError) {
      console.error("Erreur lors de la récupération des commissions:", commissionsError)
      return NextResponse.json({ success: false, error: "Impossible de récupérer les commissions" }, { status: 500 })
    }

    // Ajouter des logs pour déboguer
    console.log(`Commissions trouvées pour ${userId} le ${date}:`, commissions.length)
    if (commissions.length > 0) {
      console.log("Première commission:", commissions[0])
    }

    // Calculer le total des commissions
    const totalCommissions = commissions.reduce((sum, item) => sum + Number(item.amount), 0)

    // Ajouter un log pour le total
    console.log(`Total des commissions pour ${userId} le ${date}:`, totalCommissions)

    // Calculer le total journalier
    const dailyTotal = totalEarnings + totalCommissions
    console.log(`Total journalier pour ${userId} le ${date}:`, dailyTotal)

    // Mettre à jour le cache
    dailyEarningsCache.set(cacheKey, {
      amount: dailyTotal,
      timestamp: Date.now(),
    })

    return NextResponse.json({
      success: true,
      data: dailyTotal,
    })
  } catch (error: any) {
    console.error("Erreur dans la route API de revenus quotidiens:", error)
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 })
  }
}
