import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ success: false, error: "ID utilisateur manquant" }, { status: 400 })
    }

    const supabase = await createServerSupabaseClient()

    // Vérifier si l'utilisateur existe
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id, name, email, referral_code, referred_by")
      .eq("id", userId)
      .single()

    if (userError) {
      console.error("Erreur lors de la récupération de l'utilisateur:", userError)
      return NextResponse.json({ success: false, error: "Utilisateur non trouvé" }, { status: 404 })
    }

    // Récupérer les filleuls
    const { data: level1Referrals, error: level1Error } = await supabase
      .from("users")
      .select("id")
      .eq("referred_by", user.referral_code)

    if (level1Error) {
      console.error("Erreur lors de la récupération des filleuls de niveau 1:", level1Error)
      return NextResponse.json(
        { success: false, error: "Erreur lors de la récupération des filleuls" },
        { status: 500 },
      )
    }

    // Récupérer les filleuls de niveau 2
    let level2Count = 0
    for (const level1User of level1Referrals) {
      const { data: level1UserData } = await supabase
        .from("users")
        .select("referral_code")
        .eq("id", level1User.id)
        .single()

      if (level1UserData?.referral_code) {
        const { data: level2Data } = await supabase
          .from("users")
          .select("id")
          .eq("referred_by", level1UserData.referral_code)

        if (level2Data) {
          level2Count += level2Data.length
        }
      }
    }

    // Récupérer les filleuls de niveau 3
    const level3Count = 0
    // Cette partie est simplifiée pour éviter trop de requêtes
    // Dans une implémentation complète, il faudrait parcourir tous les filleuls de niveau 2

    // Récupérer les commissions
    const { data: commissions, error: commissionsError } = await supabase
      .from("affiliate_commissions")
      .select("amount, level")
      .eq("user_id", userId)

    if (commissionsError) {
      console.error("Erreur lors de la récupération des commissions:", commissionsError)
      return NextResponse.json(
        { success: false, error: "Erreur lors de la récupération des commissions" },
        { status: 500 },
      )
    }

    // Calculer les commissions par niveau
    const level1Total = commissions.filter((c) => c.level === 1).reduce((sum, c) => sum + Number(c.amount), 0)

    const level2Total = commissions.filter((c) => c.level === 2).reduce((sum, c) => sum + Number(c.amount), 0)

    const level3Total = commissions.filter((c) => c.level === 3).reduce((sum, c) => sum + Number(c.amount), 0)

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        referralCode: user.referral_code,
        referredBy: user.referred_by,
        referrals: {
          level1Count: level1Referrals.length,
          level2Count,
          level3Count,
        },
        commissions: {
          level1: level1Total,
          level2: level2Total,
          level3: level3Total,
          total: level1Total + level2Total + level3Total,
        },
      },
    })
  } catch (error: any) {
    console.error("Erreur dans la route API de vérification d'affiliation:", error)
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 })
  }
}
