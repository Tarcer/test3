"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { getUserBalance, getAvailableDailyWithdrawal } from "./earnings-service"
import { revalidatePath } from "next/cache"
import { emitTransactionEvent } from "@/lib/events/transaction-events"
import { v4 as uuidv4 } from "uuid"

export async function requestWithdrawal(userId: string, amount: number, walletAddress: string) {
  const supabase = await createServerSupabaseClient()

  try {
    // Vérifier si l'utilisateur a un montant disponible pour retrait aujourd'hui
    const withdrawalResult = await getAvailableDailyWithdrawal(userId)

    if (!withdrawalResult.success || !withdrawalResult.data) {
      return {
        success: false,
        error: withdrawalResult.error || "Erreur lors de la vérification du montant disponible pour retrait",
      }
    }

    const availableToday = withdrawalResult.data.availableToday

    if (amount > availableToday) {
      return {
        success: false,
        error: `Vous ne pouvez retirer que ${availableToday.toFixed(2)}€ aujourd'hui.`,
      }
    }

    // Vérifier si l'utilisateur a un solde suffisant
    const balanceResult = await getUserBalance(userId)

    if (!balanceResult.success || !balanceResult.data) {
      return { success: false, error: balanceResult.error || "Erreur lors de la vérification du solde" }
    }

    if (balanceResult.data.available < amount) {
      return { success: false, error: "Solde insuffisant pour ce retrait." }
    }

    // Calculer les frais (10%)
    const fee = amount * 0.1
    const netAmount = amount - fee

    // Créer l'enregistrement de retrait avec statut "pending"
    const { data, error: withdrawalError } = await supabase
      .from("withdrawals")
      .insert({
        id: uuidv4(),
        user_id: userId,
        amount,
        fee,
        net_amount: netAmount,
        wallet_address: walletAddress,
        status: "pending",
      })
      .select()
      .single()

    if (withdrawalError) {
      console.error("Error creating withdrawal:", withdrawalError)
      return { success: false, error: withdrawalError.message }
    }

    // Émettre un événement de demande de retrait
    await emitTransactionEvent({
      type: "withdrawal",
      userId,
      amount,
      transactionId: data.id,
      metadata: {
        withdrawalId: data.id,
        status: "pending",
        fee,
        netAmount,
      },
    })

    // Revalider les chemins pour mettre à jour l'UI
    revalidatePath("/dashboard/withdrawals")

    return {
      success: true,
      data: {
        id: data.id,
        amount,
        fee,
        netAmount,
      },
    }
  } catch (error: any) {
    console.error("Error in requestWithdrawal:", error)
    return { success: false, error: error.message }
  }
}

export async function getUserWithdrawals(userId: string) {
  const supabase = await createServerSupabaseClient()

  try {
    const { data, error } = await supabase
      .from("withdrawals")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching withdrawals:", error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error: any) {
    console.error("Error in getUserWithdrawals:", error)
    return { success: false, error: error.message }
  }
}

export async function getWithdrawalDays() {
  const supabase = await createServerSupabaseClient()

  try {
    const { data, error } = await supabase
      .from("withdrawal_days")
      .select("day_of_month")
      .order("day_of_month", { ascending: true })

    if (error) {
      console.error("Error fetching withdrawal days:", error)
      return { success: false, error: error.message }
    }

    return { success: true, data: data.map((day) => day.day_of_month) }
  } catch (error: any) {
    console.error("Error in getWithdrawalDays:", error)
    return { success: false, error: error.message }
  }
}

export async function isWithdrawalDay() {
  // Avec la nouvelle logique, chaque jour est un jour de retrait
  return {
    success: true,
    isWithdrawalDay: true,
  }
}
