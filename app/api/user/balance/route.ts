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
      const balance = transactions.reduce((total, transaction) => {
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

      // Mettre à jour le cache
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
