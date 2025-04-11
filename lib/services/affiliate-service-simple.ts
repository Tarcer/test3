"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { v4 as uuidv4 } from "uuid"
import { revalidatePath } from "next/cache"

/**
 * Fonction simplifiée pour traiter les commissions d'affiliation
 * @param userId ID de l'utilisateur qui a fait l'achat
 * @param purchaseId ID de l'achat
 * @param purchaseAmount Montant de l'achat
 */
export async function processAffiliateCommissionsSimple(userId: string, purchaseId: string, purchaseAmount: number) {
  const supabase = await createServerSupabaseClient()
  const results = {
    level1: { success: false, error: null, data: null },
    level2: { success: false, error: null, data: null },
    level3: { success: false, error: null, data: null },
  }

  try {
    console.log(
      `Traitement des commissions pour l'achat ${purchaseId} de l'utilisateur ${userId} d'un montant de ${purchaseAmount}`,
    )

    // 1. Récupérer l'utilisateur et son code de parrainage
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id, referred_by")
      .eq("id", userId)
      .single()

    if (userError) {
      console.error("Erreur lors de la récupération de l'utilisateur:", userError)
      return { success: false, error: "Utilisateur non trouvé", results }
    }

    if (!user.referred_by) {
      console.log(`L'utilisateur ${userId} n'a pas de parrain, aucune commission à traiter`)
      return { success: true, message: "Aucun parrain trouvé", results }
    }

    console.log(`L'utilisateur ${userId} a été parrainé par le code ${user.referred_by}`)

    // 2. Traiter la commission de niveau 1
    await processLevelCommission(1, user.referred_by, purchaseId, purchaseAmount, results)

    // Si le niveau 1 a réussi, essayer le niveau 2
    if (results.level1.success && results.level1.data) {
      const level1UserId = results.level1.data.referrerId

      // Récupérer le parrain du parrain (niveau 2)
      const { data: level1User, error: level1UserError } = await supabase
        .from("users")
        .select("referred_by")
        .eq("id", level1UserId)
        .single()

      if (!level1UserError && level1User.referred_by) {
        console.log(`Le parrain de niveau 1 (${level1UserId}) a été parrainé par ${level1User.referred_by}`)
        await processLevelCommission(2, level1User.referred_by, purchaseId, purchaseAmount, results)

        // Si le niveau 2 a réussi, essayer le niveau 3
        if (results.level2.success && results.level2.data) {
          const level2UserId = results.level2.data.referrerId

          // Récupérer le parrain du parrain du parrain (niveau 3)
          const { data: level2User, error: level2UserError } = await supabase
            .from("users")
            .select("referred_by")
            .eq("id", level2UserId)
            .single()

          if (!level2UserError && level2User.referred_by) {
            console.log(`Le parrain de niveau 2 (${level2UserId}) a été parrainé par ${level2User.referred_by}`)
            await processLevelCommission(3, level2User.referred_by, purchaseId, purchaseAmount, results)
          }
        }
      }
    }

    // Revalider les chemins pour mettre à jour l'UI
    revalidatePath("/dashboard/affiliate")
    revalidatePath("/dashboard")

    return {
      success: true,
      message: "Traitement des commissions terminé",
      results,
    }
  } catch (error: any) {
    console.error("Erreur dans processAffiliateCommissionsSimple:", error)
    return { success: false, error: error.message, results }
  }

  // Fonction interne pour traiter une commission d'un niveau spécifique
  async function processLevelCommission(
    level: number,
    referralCode: string,
    purchaseId: string,
    purchaseAmount: number,
    results: any,
  ) {
    try {
      console.log(`Traitement de la commission de niveau ${level} pour le code ${referralCode}`)

      // 1. Trouver l'utilisateur (parrain) par son code de parrainage
      const { data: referrer, error: referrerError } = await supabase
        .from("users")
        .select("id, name, email, referral_code")
        .eq("referral_code", referralCode)
        .single()

      if (referrerError) {
        console.error(`Parrain avec le code ${referralCode} non trouvé:`, referrerError)
        results[`level${level}`].error = "Parrain non trouvé"
        return
      }

      console.log(`Parrain trouvé: ${referrer.id} (${referrer.name}, ${referrer.email})`)

      // 2. Calculer le montant de la commission selon le niveau
      let commissionRate
      switch (level) {
        case 1:
          commissionRate = 0.01
          break // 1%
        case 2:
          commissionRate = 0.005
          break // 0.5%
        case 3:
          commissionRate = 0.0025
          break // 0.25%
        default:
          commissionRate = 0
      }

      const commissionAmount = purchaseAmount * commissionRate
      console.log(`Montant de la commission: ${commissionAmount} (${commissionRate * 100}% de ${purchaseAmount})`)

      // 3. Vérifier si une commission existe déjà pour cet achat et ce niveau
      const { data: existingCommission, error: existingCommissionError } = await supabase
        .from("affiliate_commissions")
        .select("id")
        .eq("purchase_id", purchaseId)
        .eq("level", level)
        .eq("user_id", referrer.id)
        .maybeSingle()

      if (existingCommission) {
        console.log(`Une commission existe déjà pour cet achat et ce niveau: ${existingCommission.id}`)
        results[`level${level}`].success = true
        results[`level${level}`].data = {
          commissionId: existingCommission.id,
          referrerId: referrer.id,
          amount: commissionAmount,
        }
        return
      }

      // 4. Créer la commission
      const commissionId = uuidv4()
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
        results[`level${level}`].error = commissionError.message
        return
      }

      console.log(`Commission créée avec succès: ${commission.id}`)

      // 5. Créer une transaction de solde pour la commission
      const transactionId = uuidv4()
      const { data: transaction, error: transactionError } = await supabase
        .from("balance_transactions")
        .insert({
          id: transactionId,
          user_id: referrer.id,
          amount: commissionAmount,
          type: "credit",
          description: `Commission d'affiliation niveau ${level} pour l'achat ${purchaseId}`,
        })
        .select()
        .single()

      if (transactionError) {
        console.error("Erreur lors de la création de la transaction:", transactionError)
        results[`level${level}`].error = transactionError.message
        return
      }

      console.log(`Transaction créée avec succès: ${transaction.id}`)

      results[`level${level}`].success = true
      results[`level${level}`].data = {
        commissionId: commission.id,
        transactionId: transaction.id,
        referrerId: referrer.id,
        amount: commissionAmount,
      }
    } catch (error: any) {
      console.error(`Erreur lors du traitement de la commission de niveau ${level}:`, error)
      results[`level${level}`].error = error.message
    }
  }
}
