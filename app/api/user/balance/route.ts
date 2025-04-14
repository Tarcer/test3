import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"
import type { Database } from "@/lib/supabase/database.types"

// Cache plus robuste avec TTL plus long
const balanceCache = new Map<string, { balance: number; timestamp: number }>()
const CACHE_TTL = 120 * 1000 // 2 minutes en millisecondes

// Limiter les requêtes par utilisateur
const requestLimiter = new Map<string, number>()
const RATE_LIMIT_WINDOW = 5000 // 5 secondes entre les requêtes

// Modifier la fonction GET pour inclure les revenus quotidiens et les commissions d'affiliation dans le solde
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get("userId")
    const skipCache = searchParams.get("skipCache") === "true"
    const readOnly = searchParams.get("readOnly") === "true" // Nouveau paramètre pour indiquer une lecture seule

    if (!userId) {
      return NextResponse.json({ success: false, error: "ID utilisateur manquant" }, { status: 400 })
    }

    // Improved rate limiting with more lenient limits
    const now = Date.now()
    const lastRequest = requestLimiter.get(userId) || 0
    const timeSinceLastRequest = now - lastRequest

    // If request is within rate limit window but not forced refresh
    if (timeSinceLastRequest < RATE_LIMIT_WINDOW && !skipCache) {
      // Use cache if available
      const cachedData = balanceCache.get(userId)
      if (cachedData) {
        // Add a header to indicate cache was used
        const headers = new Headers()
        headers.append("X-Cache-Status", "HIT")
        headers.append("X-Rate-Limited", "true")

        return NextResponse.json(
          {
            success: true,
            data: cachedData.balance,
            cached: true,
            rateLimited: true,
            retryAfter: RATE_LIMIT_WINDOW - timeSinceLastRequest,
          },
          {
            headers,
            status: 200,
          },
        )
      }

      // If no cache available, return 429 with retry information
      const headers = new Headers()
      headers.append("Retry-After", Math.ceil((RATE_LIMIT_WINDOW - timeSinceLastRequest) / 1000).toString())

      return NextResponse.json(
        {
          success: false,
          error: "Trop de requêtes, veuillez réessayer plus tard",
          retryAfter: RATE_LIMIT_WINDOW - timeSinceLastRequest,
        },
        {
          status: 429,
          headers,
        },
      )
    }

    // Update last request timestamp
    requestLimiter.set(userId, now)

    // Check cache if not forced refresh
    if (!skipCache) {
      const cachedData = balanceCache.get(userId)
      if (cachedData && now - cachedData.timestamp < CACHE_TTL) {
        const headers = new Headers()
        headers.append("X-Cache-Status", "HIT")

        return NextResponse.json(
          {
            success: true,
            data: cachedData.balance,
            cached: true,
          },
          {
            headers,
            status: 200,
          },
        )
      }
    }

    // Créer un client Supabase pour les Route Handlers
    const supabase = createRouteHandlerClient<Database>({ cookies })

    try {
      // Récupérer les transactions de solde
      const { data: transactions, error: transactionsError } = await supabase
        .from("balance_transactions")
        .select("amount, type")
        .eq("user_id", userId)

      if (transactionsError) {
        // Si nous avons une valeur en cache, utilisons-la en cas d'erreur
        const cachedData = balanceCache.get(userId)
        if (cachedData) {
          return NextResponse.json({
            success: true,
            data: cachedData.balance,
            cached: true,
            stale: true,
          })
        }

        return NextResponse.json({ success: false, error: "Impossible de récupérer les transactions" }, { status: 500 })
      }

      // Calculer le solde manuellement
      let balance = transactions.reduce((total, transaction) => {
        const amount = Number(transaction.amount) || 0
        if (transaction.type === "deposit" || transaction.type === "credit") {
          return total + amount
        } else if (
          transaction.type === "withdrawal" ||
          transaction.type === "purchase" ||
          transaction.type === "debit"
        ) {
          return total - amount
        }
        return total
      }, 0)

      // NOUVEAU: Récupérer les revenus quotidiens pour aujourd'hui
      const today = new Date()
      const startOfDay = new Date(today)
      startOfDay.setHours(0, 0, 0, 0)
      const endOfDay = new Date(today)
      endOfDay.setHours(23, 59, 59, 999)

      // Récupérer les revenus quotidiens
      const { data: earnings, error: earningsError } = await supabase
        .from("earnings")
        .select("amount")
        .eq("user_id", userId)
        .gte("created_at", startOfDay.toISOString())
        .lte("created_at", endOfDay.toISOString())

      if (!earningsError) {
        const dailyEarnings = earnings.reduce((sum, item) => sum + Number(item.amount), 0)
        console.log(`Revenus quotidiens pour ${userId}: ${dailyEarnings}`)

        // Ajouter les revenus quotidiens au solde
        balance += dailyEarnings
      } else {
        console.warn("Erreur lors de la récupération des revenus quotidiens:", earningsError)
      }

      // Récupérer les commissions d'affiliation pour aujourd'hui
      const { data: commissions, error: commissionsError } = await supabase
        .from("affiliate_commissions")
        .select("amount")
        .eq("user_id", userId)
        .gte("created_at", startOfDay.toISOString())
        .lte("created_at", endOfDay.toISOString())

      if (!commissionsError) {
        const affiliateCommissions = commissions.reduce((sum, item) => sum + Number(item.amount), 0)
        console.log(`Commissions d'affiliation pour ${userId}: ${affiliateCommissions}`)

        // Ajouter les commissions d'affiliation au solde
        balance += affiliateCommissions
      } else {
        console.warn("Erreur lors de la récupération des commissions d'affiliation:", commissionsError)
      }

      // Mettre à jour le cache avec le solde total (incluant revenus et commissions)
      balanceCache.set(userId, { balance, timestamp: now })

      const headers = new Headers()
      headers.append("X-Cache-Status", "MISS")

      return NextResponse.json(
        {
          success: true,
          data: balance,
        },
        {
          headers,
          status: 200,
        },
      )
    } catch (error: any) {
      // Si nous avons une valeur en cache, utilisons-la en cas d'erreur
      const cachedData = balanceCache.get(userId)
      if (cachedData) {
        return NextResponse.json({
          success: true,
          data: cachedData.balance,
          cached: true,
          stale: true,
        })
      }

      throw error // Relancer pour la gestion d'erreur générale
    }
  } catch (error: any) {
    console.error("Erreur dans la route API de solde:", error)
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 })
  }
}
