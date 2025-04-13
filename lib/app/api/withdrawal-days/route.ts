// Add caching to reduce API calls
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import type { Database } from "@/lib/supabase/database.types"

// Simple in-memory cache for withdrawal days
let withdrawalDaysCache: {
  data: number[]
  timestamp: number
} | null = null

const CACHE_TTL = 3600000 // 1 hour in milliseconds

export async function GET() {
  try {
    const now = Date.now()

    // Check if we have valid cached data
    if (withdrawalDaysCache && now - withdrawalDaysCache.timestamp < CACHE_TTL) {
      // Return cached data
      return NextResponse.json({
        success: true,
        data: withdrawalDaysCache.data,
        cached: true,
      })
    }

    // If no cache or expired, fetch from database
    const supabase = createRouteHandlerClient<Database>({ cookies })

    // Récupérer les jours de retrait
    const { data, error } = await supabase
      .from("withdrawal_days")
      .select("day_of_month")
      .order("day_of_month", { ascending: true })

    if (error) {
      console.error("Erreur lors de la récupération des jours de retrait:", error)

      // If we have stale cache, return it rather than failing
      if (withdrawalDaysCache) {
        return NextResponse.json({
          success: true,
          data: withdrawalDaysCache.data,
          cached: true,
          stale: true,
        })
      }

      return NextResponse.json(
        { success: false, error: "Impossible de récupérer les jours de retrait" },
        { status: 500 },
      )
    }

    // Extraire les jours de retrait
    const withdrawalDays = data.map((item) => item.day_of_month)

    // Update cache
    withdrawalDaysCache = {
      data: withdrawalDays,
      timestamp: now,
    }

    return NextResponse.json({
      success: true,
      data: withdrawalDays,
    })
  } catch (error: any) {
    console.error("Erreur dans la route API des jours de retrait:", error)

    // If we have stale cache, return it rather than failing
    if (withdrawalDaysCache) {
      return NextResponse.json({
        success: true,
        data: withdrawalDaysCache.data,
        cached: true,
        stale: true,
      })
    }

    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 })
  }
}
