import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"
import type { Database } from "@/lib/supabase/database.types"

// Assurons-nous que les données d'affiliation sont correctement récupérées
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ success: false, error: "ID utilisateur manquant" }, { status: 400 })
    }

    console.log(`Récupération des données d'affiliation pour l'utilisateur ${userId}`)

    // Créer un client Supabase pour les Route Handlers
    const supabase = createRouteHandlerClient<Database>({ cookies })

    // Récupérer le code de parrainage de l'utilisateur
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("referral_code")
      .eq("id", userId)
      .single()

    if (userError) {
      console.error("Erreur lors de la récupération du code de parrainage:", userError)
      return NextResponse.json({ success: false, error: "Utilisateur non trouvé" }, { status: 404 })
    }

    const referralCode = userData.referral_code
    console.log(`Code de parrainage de l'utilisateur ${userId}: ${referralCode}`)

    // Récupérer les filleuls directs (niveau 1)
    const { data: level1Referrals, error: level1Error } = await supabase
      .from("users")
      .select(`
        id,
        name,
        email,
        created_at
      `)
      .eq("referred_by", referralCode)

    if (level1Error) {
      console.error("Erreur lors de la récupération des filleuls de niveau 1:", level1Error)
      return NextResponse.json({ success: false, error: "Impossible de récupérer les filleuls" }, { status: 500 })
    }

    console.log(`${level1Referrals.length} filleuls de niveau 1 trouvés`)

    // Récupérer les filleuls de niveau 2
    const level2Referrals = []
    for (const level1User of level1Referrals) {
      const { data: level1UserData, error: level1UserError } = await supabase
        .from("users")
        .select("referral_code")
        .eq("id", level1User.id)
        .single()

      if (level1UserError) {
        console.warn(
          `Impossible de récupérer le code de parrainage pour l'utilisateur ${level1User.id}:`,
          level1UserError,
        )
        continue
      }

      const level1ReferralCode = level1UserData.referral_code

      const { data: level2Data, error: level2Error } = await supabase
        .from("users")
        .select(`
          id,
          name,
          email,
          created_at
        `)
        .eq("referred_by", level1ReferralCode)

      if (!level2Error && level2Data) {
        level2Referrals.push(...level2Data)
      } else if (level2Error) {
        console.warn(`Erreur lors de la récupération des filleuls de niveau 2 pour ${level1User.id}:`, level2Error)
      }
    }

    console.log(`${level2Referrals.length} filleuls de niveau 2 trouvés`)

    // Récupérer les filleuls de niveau 3
    const level3Referrals = []
    for (const level2User of level2Referrals) {
      const { data: level2UserData, error: level2UserError } = await supabase
        .from("users")
        .select("referral_code")
        .eq("id", level2User.id)
        .single()

      if (level2UserError) {
        console.warn(
          `Impossible de récupérer le code de parrainage pour l'utilisateur ${level2User.id}:`,
          level2UserError,
        )
        continue
      }

      const level2ReferralCode = level2UserData.referral_code

      const { data: level3Data, error: level3Error } = await supabase
        .from("users")
        .select(`
          id,
          name,
          email,
          created_at
        `)
        .eq("referred_by", level2ReferralCode)

      if (!level3Error && level3Data) {
        level3Referrals.push(...level3Data)
      } else if (level3Error) {
        console.warn(`Erreur lors de la récupération des filleuls de niveau 3 pour ${level2User.id}:`, level3Error)
      }
    }

    console.log(`${level3Referrals.length} filleuls de niveau 3 trouvés`)

    // Récupérer les commissions par niveau
    const { data: commissions, error: commissionsError } = await supabase
      .from("affiliate_commissions")
      .select("amount, level")
      .eq("user_id", userId)

    if (commissionsError) {
      console.error("Erreur lors de la récupération des commissions:", commissionsError)
      return NextResponse.json({ success: false, error: "Impossible de récupérer les commissions" }, { status: 500 })
    }

    // Calculer les commissions par niveau
    const level1Commissions = commissions.filter((c) => c.level === 1).reduce((sum, c) => sum + Number(c.amount), 0)

    const level2Commissions = commissions.filter((c) => c.level === 2).reduce((sum, c) => sum + Number(c.amount), 0)

    const level3Commissions = commissions.filter((c) => c.level === 3).reduce((sum, c) => sum + Number(c.amount), 0)

    return NextResponse.json({
      success: true,
      data: {
        referralCode,
        referralUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/account/register?ref=${referralCode}`,
        referrals: {
          level1: level1Referrals,
          level2: level2Referrals,
          level3: level3Referrals,
        },
        commissions: {
          level1: level1Commissions,
          level2: level2Commissions,
          level3: level3Commissions,
          total: level1Commissions + level2Commissions + level3Commissions,
        },
        counts: {
          level1: level1Referrals.length,
          level2: level2Referrals.length,
          level3: level3Referrals.length,
          total: level1Referrals.length + level2Referrals.length + level3Referrals.length,
        },
      },
    })
  } catch (error: any) {
    console.error("Erreur dans la route API d'affiliés:", error)
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 })
  }
}
