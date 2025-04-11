"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { v4 as uuidv4 } from "uuid"

// Ajouter l'import pour les événements
import { emitTransactionEvent } from "@/lib/events/transaction-events"

export type DepositStatus = "pending" | "confirmed" | "rejected"

export interface DepositRequest {
  userId: string
  amount: number
  transactionHash?: string
}

export interface ManualDepositRequest {
  userId: string
  amount: number
  description?: string
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
    revalidatePath("/admin/deposits")

    return { success: true, data }
  } catch (error: any) {
    console.error("Error in createDeposit:", error)
    return { success: false, error: error.message }
  }
}

export async function createManualDeposit(deposit: ManualDepositRequest) {
  const supabase = await createServerSupabaseClient()

  try {
    // Vérifier que l'utilisateur existe
    const { data: user, error: userError } = await supabase.from("users").select("id").eq("id", deposit.userId).single()

    if (userError || !user) {
      console.error("Error verifying user:", userError)
      return { success: false, error: "Utilisateur non trouvé" }
    }

    // Générer un ID unique pour le dépôt
    const depositId = uuidv4()

    // Créer le dépôt
    const { data, error } = await supabase
      .from("deposits")
      .insert({
        id: depositId,
        user_id: deposit.userId,
        amount: deposit.amount,
        transaction_hash: `manual_${Date.now()}`,
        status: "pending",
        description: deposit.description || "Dépôt manuel",
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating manual deposit:", error)
      return { success: false, error: error.message }
    }

    // Revalider les chemins pour mettre à jour l'UI
    revalidatePath("/dashboard/deposits")
    revalidatePath("/admin/deposits")
    revalidatePath("/admin/manual-operations")

    return { success: true, data }
  } catch (error: any) {
    console.error("Error in createManualDeposit:", error)
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

export async function confirmDeposit(depositId: string) {
  const supabase = await createServerSupabaseClient()

  try {
    // Récupérer les informations du dépôt
    const { data: deposit, error: fetchError } = await supabase
      .from("deposits")
      .select("*")
      .eq("id", depositId)
      .single()

    if (fetchError || !deposit) {
      console.error("Error fetching deposit:", fetchError)
      return { success: false, error: "Dépôt non trouvé" }
    }

    // Vérifier si le dépôt est déjà confirmé
    if (deposit.status === "confirmed") {
      console.log("Deposit already confirmed:", depositId)
      return { success: true, data: deposit, message: "Dépôt déjà confirmé" }
    }

    // Mettre à jour le statut du dépôt
    const { data, error } = await supabase
      .from("deposits")
      .update({
        status: "confirmed",
        confirmed_at: new Date().toISOString(),
      })
      .eq("id", depositId)
      .select()
      .single()

    if (error) {
      console.error("Error confirming deposit:", error)
      return { success: false, error: error.message }
    }

    console.log("Deposit confirmed successfully:", depositId)

    // Vérifier si une transaction de solde existe déjà pour ce dépôt
    const { data: existingTransaction, error: existingError } = await supabase
      .from("balance_transactions")
      .select("id")
      .eq("description", `Dépôt de fonds confirmé #${depositId}`)
      .single()

    if (existingError && !existingError.message.includes("No rows found")) {
      console.error("Error checking existing transaction:", existingError)
    }

    // Si aucune transaction n'existe, en créer une nouvelle
    if (!existingTransaction) {
      const { data: transaction, error: transactionError } = await supabase
        .from("balance_transactions")
        .insert({
          user_id: deposit.user_id,
          amount: deposit.amount,
          type: "deposit",
          description: `Dépôt de fonds confirmé #${depositId}`,
        })
        .select()
        .single()

      if (transactionError) {
        console.error("Error creating balance transaction:", transactionError)
        // Ne pas échouer l'opération complète si la transaction échoue, mais logger l'erreur
      } else {
        console.log("Balance transaction created successfully:", transaction.id)
      }
    } else {
      console.log("Balance transaction already exists for this deposit")
    }

    // Émettre un événement de dépôt confirmé
    await emitTransactionEvent({
      type: "deposit",
      userId: deposit.user_id,
      amount: deposit.amount,
      transactionId: depositId,
      metadata: {
        depositId,
        status: "confirmed",
      },
    })

    // Revalider les chemins pour mettre à jour l'UI
    revalidatePath("/dashboard/deposits")
    revalidatePath("/admin/deposits")
    revalidatePath("/dashboard/transactions")
    revalidatePath("/account/dashboard")
    revalidatePath("/admin/manual-operations")

    return { success: true, data }
  } catch (error: any) {
    console.error("Error in confirmDeposit:", error)
    return { success: false, error: error.message }
  }
}

export async function rejectDeposit(depositId: string) {
  const supabase = await createServerSupabaseClient()

  try {
    const { data, error } = await supabase
      .from("deposits")
      .update({
        status: "rejected",
      })
      .eq("id", depositId)
      .select()
      .single()

    if (error) {
      console.error("Error rejecting deposit:", error)
      return { success: false, error: error.message }
    }

    // Revalider les chemins pour mettre à jour l'UI
    revalidatePath("/dashboard/deposits")
    revalidatePath("/admin/deposits")
    revalidatePath("/admin/manual-operations")

    return { success: true, data }
  } catch (error: any) {
    console.error("Error in rejectDeposit:", error)
    return { success: false, error: error.message }
  }
}

export async function getPendingDeposits() {
  const supabase = await createServerSupabaseClient()

  try {
    const { data, error } = await supabase
      .from("deposits")
      .select(`
        *,
        users:user_id (
          name,
          email
        )
      `)
      .eq("status", "pending")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching pending deposits:", error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error: any) {
    console.error("Error in getPendingDeposits:", error)
    return { success: false, error: error.message }
  }
}

export async function getDepositStats() {
  const supabase = await createServerSupabaseClient()

  try {
    // Récupérer tous les dépôts
    const { data: totalData, error: totalError } = await supabase
      .from("deposits")
      .select("amount, status")
      .in("status", ["confirmed", "pending"])

    if (totalError) {
      console.error("Error fetching deposit stats:", totalError)
      return { success: false, error: totalError.message }
    }

    const confirmedDeposits = totalData.filter((d) => d.status === "confirmed")
    const pendingDeposits = totalData.filter((d) => d.status === "pending")

    const totalConfirmed = confirmedDeposits.reduce((sum, d) => sum + Number(d.amount), 0)
    const totalPending = pendingDeposits.reduce((sum, d) => sum + Number(d.amount), 0)

    return {
      success: true,
      data: {
        totalConfirmed,
        totalPending,
        confirmedCount: confirmedDeposits.length,
        pendingCount: pendingDeposits.length,
      },
    }
  } catch (error: any) {
    console.error("Error in getDepositStats:", error)
    return { success: false, error: error.message }
  }
}
