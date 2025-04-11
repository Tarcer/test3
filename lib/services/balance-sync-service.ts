"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

/**
 * Synchronise le solde d'un utilisateur en fonction de toutes ses transactions
 */
export async function syncUserBalance(userId: string) {
  const supabase = await createServerSupabaseClient()

  try {
    console.log(`Synchronizing balance for user ${userId}...`)

    // 1. Récupérer toutes les transactions
    const { data: transactions, error: txError } = await supabase
      .from("balance_transactions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: true })

    if (txError) {
      console.error("Error fetching transactions:", txError)
      return { success: false, error: txError.message }
    }

    // 2. Récupérer tous les dépôts confirmés
    const { data: deposits, error: depositsError } = await supabase
      .from("deposits")
      .select("id, amount, status")
      .eq("user_id", userId)
      .eq("status", "confirmed")

    if (depositsError) {
      console.error("Error fetching deposits:", depositsError)
      return { success: false, error: depositsError.message }
    }

    // 3. Récupérer tous les achats
    const { data: purchases, error: purchasesError } = await supabase
      .from("purchases")
      .select("id, amount, status")
      .eq("user_id", userId)
      .eq("status", "completed")

    if (purchasesError) {
      console.error("Error fetching purchases:", purchasesError)
      return { success: false, error: purchasesError.message }
    }

    // 4. Récupérer tous les retraits
    const { data: withdrawals, error: withdrawalsError } = await supabase
      .from("withdrawals")
      .select("id, amount, status")
      .eq("user_id", userId)
      .eq("status", "completed")

    if (withdrawalsError) {
      console.error("Error fetching withdrawals:", withdrawalsError)
      return { success: false, error: withdrawalsError.message }
    }

    // 5. Vérifier les transactions manquantes
    const transactionMap = new Map(transactions.map((tx) => [tx.description, tx]))
    const transactionsToCreate = []

    // Vérifier les dépôts
    for (const deposit of deposits) {
      const depositDesc = `Dépôt de fonds confirmé #${deposit.id}`
      if (!transactionMap.has(depositDesc)) {
        transactionsToCreate.push({
          user_id: userId,
          amount: deposit.amount,
          type: "deposit",
          description: depositDesc,
        })
      }
    }

    // Vérifier les achats
    for (const purchase of purchases) {
      const purchaseDesc = `Achat du produit: ${purchase.id}`
      if (!transactionMap.has(purchaseDesc)) {
        transactionsToCreate.push({
          user_id: userId,
          amount: purchase.amount,
          type: "purchase",
          description: purchaseDesc,
        })
      }
    }

    // Vérifier les retraits
    for (const withdrawal of withdrawals) {
      const withdrawalDesc = `Retrait de fonds #${withdrawal.id}`
      if (!transactionMap.has(withdrawalDesc)) {
        transactionsToCreate.push({
          user_id: userId,
          amount: withdrawal.amount,
          type: "withdrawal",
          description: withdrawalDesc,
        })
      }
    }

    // 6. Créer les transactions manquantes
    if (transactionsToCreate.length > 0) {
      const { error: insertError } = await supabase.from("balance_transactions").insert(transactionsToCreate)

      if (insertError) {
        console.error("Error creating missing transactions:", insertError)
        return { success: false, error: insertError.message }
      }

      console.log(`Created ${transactionsToCreate.length} missing transactions`)
    } else {
      console.log("No missing transactions found")
    }

    // 7. Revalider les chemins pour mettre à jour l'UI
    revalidatePath("/dashboard")
    revalidatePath("/account/dashboard")
    revalidatePath("/dashboard/transactions")

    return {
      success: true,
      message: `Balance synchronized for user ${userId}`,
      created: transactionsToCreate.length,
    }
  } catch (error: any) {
    console.error("Error in syncUserBalance:", error)
    return { success: false, error: error.message }
  }
}
