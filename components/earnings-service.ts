"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"

/**
 * Récupère le solde disponible d'un utilisateur
 * @param userId ID de l'utilisateur
 * @param readOnly Si true, ne génère pas de revenus manquants
 */
export async function getUserBalance(userId: string, readOnly = false) {
  const supabase = await createServerSupabaseClient()

  try {
    // Récupérer toutes les transactions de l'utilisateur
    const { data: transactions, error: transactionsError } = await supabase
      .from("balance_transactions")
      .select("amount, type")
      .eq("user_id", userId)

    if (transactionsError) {
      console.error("Error getting user transactions:", transactionsError)
      return { success: false, error: transactionsError.message }
    }

    // Calculer le solde disponible
    let available = 0
    let deposits = 0
    let purchases = 0

    transactions.forEach((transaction) => {
      const amount = Number(transaction.amount) || 0

      if (transaction.type === "deposit" || transaction.type === "credit") {
        available += amount
        deposits += amount
      } else if (transaction.type === "purchase" || transaction.type === "withdrawal" || transaction.type === "debit") {
        available -= amount
        if (transaction.type === "purchase") {
          purchases += amount
        }
      }
    })

    // Récupérer les achats pour calculer l'investissement total
    const { data: purchasesData, error: purchasesError } = await supabase
      .from("purchases")
      .select("amount, last_validated_at")
      .eq("user_id", userId)
      .eq("status", "completed")

    if (purchasesError) {
      console.error("Error getting user purchases:", purchasesError)
      // Ne pas échouer l'opération complète
    }

    // Filtrer les achats validés dans les dernières 24 heures
    const now = new Date()
    const validPurchases = purchasesData.filter((purchase) => {
      return (
        purchase.last_validated_at &&
        new Date(purchase.last_validated_at).getTime() > now.getTime() - 24 * 60 * 60 * 1000
      )
    })

    const totalInvested = validPurchases.reduce((sum, p) => sum + Number(p.amount), 0)

    return {
      success: true,
      data: {
        available,
        deposits,
        purchases,
        totalInvested,
      },
    }
  } catch (error: any) {
    console.error("Error in getUserBalance:", error)
    return { success: false, error: error.message }
  }
}

/**
 * Calcule le montant disponible pour retrait quotidien
 */
export async function getAvailableDailyWithdrawal(userId: string) {
  const supabase = await createServerSupabaseClient()

  try {
    // Récupérer le dernier achat validé
    const { data: lastPurchase, error: lastPurchaseError } = await supabase
      .from("purchases")
      .select("amount, last_validated_at")
      .eq("user_id", userId)
      .eq("status", "completed")
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    if (lastPurchaseError) {
      console.error("Error getting last purchase:", lastPurchaseError)
      return { success: false, error: lastPurchaseError.message }
    }

    if (!lastPurchase) {
      return {
        success: true,
        data: {
          totalInvested: 0,
          dailyAllowance: 0,
          withdrawnToday: 0,
          availableToday: 0,
        },
      }
    }

    // Vérifier si le dernier achat a été validé dans les dernières 24 heures
    const now = new Date()
    const isValidated =
      lastPurchase.last_validated_at &&
      new Date(lastPurchase.last_validated_at).getTime() > now.getTime() - 24 * 60 * 60 * 1000

    let dailyAllowance = 0
    let totalInvested = 0

    if (isValidated) {
      // Calculer l'allocation quotidienne (1/45 du prix d'achat)
      dailyAllowance = Number(lastPurchase.amount) / 45
      totalInvested = Number(lastPurchase.amount)
    }

    // Récupérer les retraits effectués aujourd'hui
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const { data: withdrawals, error: withdrawalsError } = await supabase
      .from("withdrawals")
      .select("amount")
      .eq("user_id", userId)
      .eq("status", "completed")
      .gte("created_at", today.toISOString())

    if (withdrawalsError) {
      console.error("Error getting today's withdrawals:", withdrawalsError)
      return { success: false, error: withdrawalsError.message }
    }

    // Calculer le montant déjà retiré aujourd'hui
    const withdrawnToday = withdrawals.reduce((sum, withdrawal) => sum + Number(withdrawal.amount), 0)

    // Calculer le montant disponible pour retrait aujourd'hui
    const availableToday = Math.max(0, dailyAllowance - withdrawnToday)

    return {
      success: true,
      data: {
        totalInvested,
        dailyAllowance,
        withdrawnToday,
        availableToday,
      },
    }
  } catch (error: any) {
    console.error("Error in getAvailableDailyWithdrawal:", error)
    return { success: false, error: error.message }
  }
}

/**
 * Génère des revenus quotidiens pour un utilisateur
 * Cette fonction peut être utilisée pour simuler des revenus quotidiens à des fins de test
 */
export async function generateDailyEarnings(userId: string, date?: string) {
  const supabase = await createServerSupabaseClient()

  try {
    // Vérifier si l'utilisateur existe
    const { data: user, error: userError } = await supabase.from("users").select("id").eq("id", userId).single()

    if (userError) {
      console.error("Error verifying user:", userError)
      return { success: false, error: userError.message }
    }

    // Récupérer les achats de l'utilisateur
    const { data: purchases, error: purchasesError } = await supabase
      .from("purchases")
      .select("id, amount, created_at")
      .eq("user_id", userId)
      .eq("status", "completed")

    if (purchasesError) {
      console.error("Error getting user purchases:", purchasesError)
      return { success: false, error: purchasesError.message }
    }

    if (purchases.length === 0) {
      return { success: true, message: "Aucun achat trouvé pour générer des revenus" }
    }

    // Date pour les revenus (aujourd'hui par défaut)
    const earningsDate = date ? new Date(date) : new Date()

    // Générer des revenus pour chaque achat
    const earningsToInsert = []

    for (const purchase of purchases) {
      // Calculer le montant quotidien (1/45 du prix d'achat)
      const dailyAmount = Number(purchase.amount) / 45

      // Vérifier si un revenu existe déjà pour cet achat à cette date
      const { data: existingEarnings, error: existingError } = await supabase
        .from("earnings")
        .select("id")
        .eq("user_id", userId)
        .eq("purchase_id", purchase.id)
        .gte("created_at", new Date(earningsDate.setHours(0, 0, 0, 0)).toISOString())
        .lt("created_at", new Date(earningsDate.setHours(23, 59, 59, 999)).toISOString())
        .single()

      // Si aucun revenu n'existe pour cette date, en créer un
      if (existingError && existingError.code === "PGRST116") {
        earningsToInsert.push({
          user_id: userId,
          purchase_id: purchase.id,
          amount: dailyAmount,
          day_number: 1, // Placeholder, à calculer correctement
          status: "completed",
          created_at: new Date().toISOString(),
        })
      }
    }

    // Insérer les nouveaux revenus
    if (earningsToInsert.length > 0) {
      const { error: insertError } = await supabase.from("earnings").insert(earningsToInsert)

      if (insertError) {
        console.error("Error inserting earnings:", insertError)
        return { success: false, error: insertError.message }
      }

      return {
        success: true,
        message: `${earningsToInsert.length} revenus générés avec succès`,
        data: earningsToInsert,
      }
    }

    return { success: true, message: "Aucun nouveau revenu à générer" }
  } catch (error: any) {
    console.error("Error in generateDailyEarnings:", error)
    return { success: false, error: error.message }
  }
}
