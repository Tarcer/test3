import { NextResponse } from "next/server"
import {
  generateDailyEarningsForAllUsers,
  generateDailyEarningsForUser,
  generateMissingEarnings,
} from "@/lib/services/earnings-generator"

export async function POST(request: Request) {
  try {
    const { userId, date, startDate, endDate, generateForAll } = await request.json()

    // Générer pour tous les utilisateurs
    if (generateForAll) {
      const result = await generateDailyEarningsForAllUsers()

      if (!result.success) {
        return NextResponse.json({ success: false, error: result.error }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        message: result.message,
        data: result.results,
      })
    }

    // Générer pour une période
    if (startDate && endDate) {
      if (!userId) {
        return NextResponse.json(
          { success: false, error: "User ID is required for date range generation" },
          { status: 400 },
        )
      }

      const result = await generateMissingEarnings(userId, startDate, endDate)

      if (!result.success) {
        return NextResponse.json({ success: false, error: result.error }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        message: result.message,
        data: result.results,
      })
    }

    // Générer pour un utilisateur spécifique à une date spécifique
    if (!userId) {
      return NextResponse.json({ success: false, error: "User ID is required" }, { status: 400 })
    }

    const result = await generateDailyEarningsForUser(userId, date)

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      data: result.earnings,
      generated: result.generated,
    })
  } catch (error: any) {
    console.error("Error in generate daily earnings API:", error)
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 })
  }
}
