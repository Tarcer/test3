"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"

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