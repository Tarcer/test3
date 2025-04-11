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
    revalidatePath("/admin/withdrawals")
    revalidatePath("/admin/transactions")

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

export async function approveWithdrawal(withdrawalId: string) {
  const supabase = await createServerSupabaseClient()

  try {
    // Récupérer les informations du retrait
    const { data: withdrawal, error: fetchError } = await supabase
      .from("withdrawals")
      .select("*")
      .eq("id", withdrawalId)
      .single()

    if (fetchError || !withdrawal) {
      console.error("Error fetching withdrawal:", fetchError)
      return { success: false, error: "Retrait non trouvé" }
    }

    // Vérifier si le retrait est déjà traité
    if (withdrawal.status !== "pending") {
      return {
        success: false,
        error: `Ce retrait est déjà ${withdrawal.status === "completed" ? "approuvé" : "rejeté"}`,
      }
    }

    // Créer une transaction de solde pour le retrait
    const { data: transaction, error: txError } = await supabase
      .from("balance_transactions")
      .insert({
        user_id: withdrawal.user_id,
        amount: -withdrawal.amount, // S'assurer que le montant est négatif pour débiter le solde
        type: "withdrawal",
        description: `Retrait de fonds #${withdrawalId}`,
      })
      .select()
      .single()

    if (txError) {
      console.error("Error creating balance transaction:", txError)
      return { success: false, error: "Erreur lors de la création de la transaction de solde" }
    }

    // Mettre à jour le statut du retrait
    const { data, error } = await supabase
      .from("withdrawals")
      .update({
        status: "completed",
        processed_at: new Date().toISOString(),
      })
      .eq("id", withdrawalId)
      .select()
      .single()

    if (error) {
      console.error("Error approving withdrawal:", error)
      return { success: false, error: error.message }
    }

    // Émettre un événement de retrait approuvé
    await emitTransactionEvent({
      type: "withdrawal",
      userId: withdrawal.user_id,
      amount: withdrawal.amount,
      transactionId: withdrawalId,
      metadata: {
        withdrawalId,
        status: "completed",
        fee: withdrawal.fee,
        netAmount: withdrawal.net_amount,
      },
    })

    // Revalider les chemins pour mettre à jour l'UI
    revalidatePath("/dashboard/withdrawals")
    revalidatePath("/admin/withdrawals")
    revalidatePath("/admin/transactions")

    return { success: true, data }
  } catch (error: any) {
    console.error("Error in approveWithdrawal:", error)
    return { success: false, error: error.message }
  }
}

export async function rejectWithdrawal(withdrawalId: string) {
  const supabase = await createServerSupabaseClient()

  try {
    // Récupérer les informations du retrait
    const { data: withdrawal, error: fetchError } = await supabase
      .from("withdrawals")
      .select("*")
      .eq("id", withdrawalId)
      .single()

    if (fetchError || !withdrawal) {
      console.error("Error fetching withdrawal:", fetchError)
      return { success: false, error: "Retrait non trouvé" }
    }

    // Vérifier si le retrait est déjà traité
    if (withdrawal.status !== "pending") {
      return {
        success: false,
        error: `Ce retrait est déjà ${withdrawal.status === "completed" ? "approuvé" : "rejeté"}`,
      }
    }

    // Mettre à jour le statut du retrait
    const { data, error } = await supabase
      .from("withdrawals")
      .update({
        status: "rejected",
        processed_at: new Date().toISOString(),
      })
      .eq("id", withdrawalId)
      .select()
      .single()

    if (error) {
      console.error("Error rejecting withdrawal:", error)
      return { success: false, error: error.message }
    }

    // Émettre un événement de retrait rejeté
    await emitTransactionEvent({
      type: "withdrawal",
      userId: withdrawal.user_id,
      amount: 0, // Montant 0 car le retrait est rejeté
      transactionId: withdrawalId,
      metadata: {
        withdrawalId,
        status: "rejected",
      },
    })

    // Revalider les chemins pour mettre à jour l'UI
    revalidatePath("/dashboard/withdrawals")
    revalidatePath("/admin/withdrawals")
    revalidatePath("/admin/transactions")

    return { success: true, data }
  } catch (error: any) {
    console.error("Error in rejectWithdrawal:", error)
    return { success: false, error: error.message }
  }
}

export async function getPendingWithdrawals() {
  const supabase = await createServerSupabaseClient()

  try {
    const { data, error } = await supabase
      .from("withdrawals")
      .select(`
       *,
       users:user_id (
         name,
         email,
         solana_usdt_address
       )
     `)
      .eq("status", "pending")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching pending withdrawals:", error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error: any) {
    console.error("Error in getPendingWithdrawals:", error)
    return { success: false, error: error.message }
  }
}

export async function getWithdrawalStats() {
  const supabase = await createServerSupabaseClient()

  try {
    // Récupérer tous les retraits
    const { data: totalData, error: totalError } = await supabase
      .from("withdrawals")
      .select("amount, fee, net_amount, status")
      .in("status", ["completed", "pending", "rejected"])

    if (totalError) {
      console.error("Error fetching withdrawal stats:", totalError)
      return { success: false, error: totalError.message }
    }

    const completedWithdrawals = totalData.filter((w) => w.status === "completed")
    const pendingWithdrawals = totalData.filter((w) => w.status === "pending")
    const rejectedWithdrawals = totalData.filter((w) => w.status === "rejected")

    const totalCompleted = completedWithdrawals.reduce((sum, w) => sum + Number(w.amount), 0)
    const totalPending = pendingWithdrawals.reduce((sum, w) => sum + Number(w.amount), 0)
    const totalRejected = rejectedWithdrawals.reduce((sum, w) => sum + Number(w.amount), 0)

    const totalFees = completedWithdrawals.reduce((sum, w) => sum + Number(w.fee), 0)
    const totalNetAmount = completedWithdrawals.reduce((sum, w) => sum + Number(w.net_amount), 0)

    return {
      success: true,
      data: {
        totalCompleted,
        totalPending,
        totalRejected,
        totalFees,
        totalNetAmount,
        completedCount: completedWithdrawals.length,
        pendingCount: pendingWithdrawals.length,
        rejectedCount: rejectedWithdrawals.length,
      },
    }
  } catch (error: any) {
    console.error("Error in getWithdrawalStats:", error)
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
