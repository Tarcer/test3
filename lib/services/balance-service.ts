"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { v4 as uuidv4 } from "uuid"

// Modifier la fonction createBalanceTransaction pour supprimer les champs reference_id et reference_type

export async function createBalanceTransaction({
  userId,
  amount,
  type,
  description,
}: {
  userId: string
  amount: number
  type: "deposit" | "withdrawal" | "purchase" | "credit" | "debit"
  description?: string
}) {
  const supabase = await createServerSupabaseClient()

  try {
    const { data, error } = await supabase
      .from("balance_transactions")
      .insert({
        user_id: userId,
        amount,
        type,
        description,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating balance transaction:", error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error: any) {
    console.error("Error in createBalanceTransaction:", error)
    return { success: false, error: error.message }
  }
}

/**
 * Récupère l'historique des transactions de solde d'un utilisateur
 */
export async function getUserBalanceTransactions(userId: string, limit = 10) {
  const supabase = await createServerSupabaseClient()

  try {
    const { data, error } = await supabase
      .from("balance_transactions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error) {
      console.error("Error getting user balance transactions:", error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error: any) {
    console.error("Error in getUserBalanceTransactions:", error)
    return { success: false, error: error.message }
  }
}

/**
 * Synchronise les transactions manquantes pour les dépôts confirmés
 */
export async function syncMissingTransactions() {
  const supabase = await createServerSupabaseClient()

  try {
    // Récupérer tous les dépôts confirmés
    const { data: deposits, error: depositsError } = await supabase
      .from("deposits")
      .select("id, user_id, amount, status")
      .eq("status", "confirmed")

    if (depositsError) {
      console.error("Error fetching confirmed deposits:", depositsError)
      return { success: false, error: depositsError.message }
    }

    // Pour chaque dépôt confirmé, vérifier s'il existe une transaction de solde correspondante
    let createdCount = 0
    let skippedCount = 0
    let errorCount = 0

    for (const deposit of deposits) {
      // Vérifier si une transaction existe déjà pour ce dépôt
      const { data: existingTransaction, error: existingError } = await supabase
        .from("balance_transactions")
        .select("id")
        .eq("description", `Dépôt de fonds confirmé #${deposit.id}`)
        .maybeSingle()

      if (existingError && !existingError.message.includes("No rows found")) {
        console.error(`Error checking existing transaction for deposit ${deposit.id}:`, existingError)
        errorCount++
        continue
      }

      // Si aucune transaction n'existe, en créer une nouvelle
      if (!existingTransaction) {
        const { error: transactionError } = await supabase.from("balance_transactions").insert({
          id: uuidv4(),
          user_id: deposit.user_id,
          amount: deposit.amount,
          type: "deposit",
          description: `Dépôt de fonds confirmé #${deposit.id}`,
          reference_id: deposit.id,
          reference_type: "deposit",
        })

        if (transactionError) {
          console.error(`Error creating balance transaction for deposit ${deposit.id}:`, transactionError)
          errorCount++
        } else {
          createdCount++
        }
      } else {
        skippedCount++
      }
    }

    // Revalider les chemins pour mettre à jour l'UI
    revalidatePath("/admin/sync-transactions")
    revalidatePath("/dashboard/transactions")
    revalidatePath("/account/dashboard")

    return {
      success: true,
      data: {
        total: deposits.length,
        created: createdCount,
        skipped: skippedCount,
        errors: errorCount,
      },
    }
  } catch (error: any) {
    console.error("Error in syncMissingTransactions:", error)
    return { success: false, error: error.message }
  }
}
