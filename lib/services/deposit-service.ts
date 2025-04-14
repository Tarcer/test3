"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export type DepositStatus = "pending" | "confirmed" | "rejected"

export interface DepositRequest {
  userId: string
  amount: number
  transactionHash?: string
}

export async function createDeposit(deposit: DepositRequest) {
  const supabase = await createServerSupabaseClient()

  try {
    // Vérifier que l'utilisateur existe
    const { data: user, error: userError } = await supabase.from("users").select("id").eq("id", deposit.userId).single()

    if (userError || !user) {
      console.error("Error verifying user:", userError)
      return { success: false, error: "Utilisateur non trouvé" }
    }

    // Créer le dépôt
    const { data, error } = await supabase
      .from("deposits")
      .insert({
        user_id: deposit.userId,
        amount: deposit.amount,
        transaction_hash: deposit.transactionHash || null,
        status: "pending",
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating deposit:", error)
      return { success: false, error: error.message }
    }

    // Revalider les chemins pour mettre à jour l'UI
    revalidatePath("/dashboard/deposits")

    return { success: true, data }
  } catch (error: any) {
    console.error("Error in createDeposit:", error)
    return { success: false, error: error.message }
  }
}

export async function getUserDeposits(userId: string) {
  const supabase = await createServerSupabaseClient()

  try {
    const { data, error } = await supabase
      .from("deposits")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching user deposits:", error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error: any) {
    console.error("Error in getUserDeposits:", error)
    return { success: false, error: error.message }
  }
}
