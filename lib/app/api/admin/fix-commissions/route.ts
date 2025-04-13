import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { processAffiliateCommission } from "@/lib/services/affiliate-service"
import { revalidatePath } from "next/cache"

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ success: false, error: "ID utilisateur manquant" }, { status: 400 })
    }

    const supabase = await createServerSupabaseClient()

    // Récupérer l'utilisateur
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id, referred_by")
      .eq("id", userId)
      .single()

    if (userError) {
      console.error("Erreur lors de la récupération de l'utilisateur:", userError)
      return NextResponse.json({ success: false, error: "Utilisateur non trouvé" }, { status: 404 })
    }

    // Si l'utilisateur n'a pas de parrain, il n'y a pas de commissions à corriger
    if (!user.referred_by) {
      return NextResponse.json({
        success: true,
        data: {
          message: "L'utilisateur n'a pas de parrain, aucune commission à corriger",
          created: 0,
          updated: 0,
          transactions: 0,
        },
      })
    }

    // Récupérer les achats de l'utilisateur
    const { data: purchases, error: purchasesError } = await supabase
      .from("purchases")
      .select("id, amount, created_at")
      .eq("user_id", userId)
      .eq("status", "completed")

    if (purchasesError) {
      console.error("Erreur lors de la récupération des achats:", purchasesError)
      return NextResponse.json({ success: false, error: "Erreur lors de la récupération des achats" }, { status: 500 })
    }

    // Statistiques pour le rapport
    let created = 0
    let updated = 0
    let transactions = 0

    // Pour chaque achat, vérifier et corriger les commissions
    for (const purchase of purchases) {
      // Vérifier si des commissions existent déjà pour cet achat
      const { data: existingCommissions, error: commissionsError } = await supabase
        .from("affiliate_commissions")
        .select("id, level, user_id")
        .eq("purchase_id", purchase.id)

      if (commissionsError) {
        console.error("Erreur lors de la vérification des commissions existantes:", commissionsError)
        continue
      }

      // Traiter la commission de niveau 1
      if (!existingCommissions.some((c) => c.level === 1)) {
        const result = await processAffiliateCommission(user.referred_by, purchase.id, purchase.amount, 1)
        if (result.success) {
          created++
          transactions++
        }
      } else {
        updated++
      }

      // Récupérer le parrain de niveau 1 pour trouver le parrain de niveau 2
      const { data: level1User, error: level1Error } = await supabase
        .from("users")
        .select("referred_by")
        .eq("referral_code", user.referred_by)
        .single()

      if (level1Error) {
        console.error("Erreur lors de la récupération du parrain de niveau 1:", level1Error)
        continue
      }

      if (level1User?.referred_by) {
        // Traiter la commission de niveau 2
        if (!existingCommissions.some((c) => c.level === 2)) {
          const result = await processAffiliateCommission(level1User.referred_by, purchase.id, purchase.amount, 2)
          if (result.success) {
            created++
            transactions++
          }
        } else {
          updated++
        }

        // Récupérer le parrain de niveau 2 pour trouver le parrain de niveau 3
        const { data: level2User, error: level2Error } = await supabase
          .from("users")
          .select("referred_by")
          .eq("referral_code", level1User.referred_by)
          .single()

        if (level2Error) {
          console.error("Erreur lors de la récupération du parrain de niveau 2:", level2Error)
          continue
        }

        if (level2User?.referred_by) {
          // Traiter la commission de niveau 3
          if (!existingCommissions.some((c) => c.level === 3)) {
            const result = await processAffiliateCommission(level2User.referred_by, purchase.id, purchase.amount, 3)
            if (result.success) {
              created++
              transactions++
            }
          } else {
            updated++
          }
        }
      }
    }

    // Revalider les chemins pour mettre à jour l'UI
    revalidatePath("/dashboard/affiliate")
    revalidatePath("/dashboard")
    revalidatePath("/account/dashboard")

    return NextResponse.json({
      success: true,
      data: {
        message: "Commissions corrigées avec succès",
        created,
        updated,
        transactions,
      },
    })
  } catch (error: any) {
    console.error("Erreur dans la route API de correction des commissions:", error)
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 })
  }
}
