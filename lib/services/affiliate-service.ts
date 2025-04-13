"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { v4 as uuidv4 } from "uuid"
import { createBalanceTransaction } from "./balance-service"
import { revalidatePath } from "next/cache"

/**
 * Traite une commission d'affiliation pour un parrain
 * @param referralCode Code de parrainage du parrain
 * @param purchaseId ID de l'achat
 * @param purchaseAmount Montant de l'achat
 * @param level Niveau de parrainage (1, 2 ou 3)
 */
export async function processAffiliateCommission(
  referralCode: string,
  purchaseId: string,
  purchaseAmount: number,
  level: number,
) {
  const supabase = await createServerSupabaseClient()

  try {
    console.log(`Traitement de la commission de niveau ${level} pour le parrain ${referralCode}...`)

    // Récupérer l'utilisateur (parrain) par son code de parrainage
    const { data: referrer, error: referrerError } = await supabase
      .from("users")
      .select("id, name, email")
      .eq("referral_code", referralCode)
      .single()

    if (referrerError || !referrer) {
      console.error(`Parrain avec le code ${referralCode} non trouvé:`, referrerError)
      return { success: false, error: "Parrain non trouvé" }
    }

    console.log(`Parrain trouvé: ${referrer.id} (${referrer.name}, ${referrer.email})`)

    // Calculer le montant de la commission selon le niveau
    let commissionRate
    switch (level) {
      case 1:
        commissionRate = 0.01 // 1%
        break
      case 2:
        commissionRate = 0.005 // 0.5%
        break
      case 3:
        commissionRate = 0.0025 // 0.25%
        break
      default:
        commissionRate = 0
    }

    const commissionAmount = purchaseAmount * commissionRate
    console.log(`Montant de la commission: ${commissionAmount} (${commissionRate * 100}% de ${purchaseAmount})`)

    // Générer un ID unique pour la commission
    const commissionId = uuidv4()

    // Créer l'enregistrement de commission
    const { data: commission, error: commissionError } = await supabase
      .from("affiliate_commissions")
      .insert({
        id: commissionId,
        user_id: referrer.id,
        purchase_id: purchaseId,
        amount: commissionAmount,
        level,
        status: "completed",
      })
      .select()
      .single()

    if (commissionError) {
      console.error("Erreur lors de la création de la commission:", commissionError)
      return { success: false, error: commissionError.message }
    }

    console.log(`Commission créée avec succès: ${commission.id}`)

    // Créer une transaction de solde pour la commission
    const transactionResult = await createBalanceTransaction({
      userId: referrer.id,
      amount: commissionAmount,
      type: "credit",
      description: `Commission d'affiliation niveau ${level} pour l'achat ${purchaseId}`,
    })

    if (!transactionResult.success) {
      console.error(
        "Erreur lors de la création de la transaction de solde pour la commission:",
        transactionResult.error,
      )
      // Ne pas échouer l'opération complète, mais enregistrer l'erreur
    } else {
      console.log(`Transaction de solde créée avec succès pour la commission: ${transactionResult.data.id}`)
    }

    // Revalider les chemins pour mettre à jour l'UI
    revalidatePath(`/dashboard/affiliate`)
    revalidatePath(`/dashboard`)
    revalidatePath(`/account/dashboard`)

    return { success: true, data: commission }
  } catch (error: any) {
    console.error("Erreur dans processAffiliateCommission:", error)
    return { success: false, error: error.message }
  }
}

export async function getUserReferrals(userId: string) {
  const supabase = await createServerSupabaseClient()

  try {
    // First, get the user's referral code
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("referral_code")
      .eq("id", userId)
      .single()

    if (userError) {
      console.error("Error fetching user referral code:", userError)
      return { success: false, error: userError.message }
    }

    const referralCode = userData.referral_code

    // Get direct referrals (level 1)
    const { data: level1Referrals, error: level1Error } = await supabase
      .from("users")
      .select(`
      id,
      name,
      email,
      created_at,
      purchases:purchases (
        id,
        amount,
        created_at
      )
    `)
      .eq("referred_by", referralCode)

    if (level1Error) {
      console.error("Error fetching level 1 referrals:", level1Error)
      return { success: false, error: level1Error.message }
    }

    // Get level 2 referrals
    const level2Referrals = []
    for (const level1User of level1Referrals) {
      const { data: level1UserData, error: level1UserError } = await supabase
        .from("users")
        .select("referral_code")
        .eq("id", level1User.id)
        .single()

      if (level1UserError) {
        console.warn(`Unable to get referral code for user ${level1User.id}:`, level1UserError)
        continue
      }

      const level1ReferralCode = level1UserData.referral_code

      const { data: level2Data, error: level2Error } = await supabase
        .from("users")
        .select(`
        id,
        name,
        email,
        created_at,
        purchases:purchases (
          id,
          amount,
          created_at
        )
      `)
        .eq("referred_by", level1ReferralCode)

      if (level2Error) {
        console.warn(`Error fetching level 2 referrals for ${level1User.id}:`, level2Error)
        continue
      }

      level2Referrals.push(...level2Data)
    }

    // Get level 3 referrals
    const level3Referrals = []
    for (const level2User of level2Referrals) {
      const { data: level2UserData, error: level2UserError } = await supabase
        .from("users")
        .select("referral_code")
        .eq("id", level2User.id)
        .single()

      if (level2UserError) {
        console.warn(`Unable to get referral code for user ${level2User.id}:`, level2UserError)
        continue
      }

      const level2ReferralCode = level2UserData.referral_code

      const { data: level3Data, error: level3Error } = await supabase
        .from("users")
        .select(`
        id,
        name,
        email,
        created_at,
        purchases:purchases (
          id,
          amount,
          created_at
        )
      `)
        .eq("referred_by", level2ReferralCode)

      if (level3Error) {
        console.warn(`Error fetching level 3 referrals for ${level2User.id}:`, level3Error)
        continue
      }

      level3Referrals.push(...level3Data)
    }

    return {
      success: true,
      data: {
        referralCode,
        level1: level1Referrals,
        level2: level2Referrals,
        level3: level3Referrals,
      },
    }
  } catch (error: any) {
    console.error("Error in getUserReferrals:", error)
    return { success: false, error: error.message }
  }
}

export async function getAffiliateStats(userId: string) {
  const supabase = await createServerSupabaseClient()

  try {
    // Get total commissions by level
    const { data: commissions, error: commissionsError } = await supabase
      .from("affiliate_commissions")
      .select("amount, level")
      .eq("user_id", userId)

    if (commissionsError) {
      console.error("Error fetching commissions:", commissionsError)
      return { success: false, error: commissionsError.message }
    }

    // Calculate commissions by level
    const level1Total = commissions.filter((c) => c.level === 1).reduce((sum, c) => sum + Number(c.amount), 0)

    const level2Total = commissions.filter((c) => c.level === 2).reduce((sum, c) => sum + Number(c.amount), 0)

    const level3Total = commissions.filter((c) => c.level === 3).reduce((sum, c) => sum + Number(c.amount), 0)

    // Get referral counts by level
    const referralsResult = await getUserReferrals(userId)

    if (!referralsResult.success) {
      return { success: false, error: referralsResult.error }
    }

    const { level1, level2, level3 } = referralsResult.data

    return {
      success: true,
      data: {
        totalCommissions: level1Total + level2Total + level3Total,
        commissionsByLevel: {
          level1: level1Total,
          level2: level2Total,
          level3: level3Total,
        },
        referralCounts: {
          level1: level1.length,
          level2: level2.length,
          level3: level3.length,
          total: level1.length + level2.length + level3.length,
        },
      },
    }
  } catch (error: any) {
    console.error("Error in getAffiliateStats:", error)
    return { success: false, error: error.message }
  }
}
