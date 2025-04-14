"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { v4 as uuidv4 } from "uuid"

/**
 * Vérifie si le jour actuel est un jour de retrait autorisé et retourne les limites
 */
export async function getWithdrawalLimits() {
  try {
    // Déterminer le jour de la semaine actuel (0 = dimanche, 1 = lundi, etc.)
    const today = new Date()
    const dayOfWeek = today.getDay()

    // Définir les limites selon le jour de la semaine
    switch (dayOfWeek) {
      case 1: // Lundi
        return {
          success: true,
          isWithdrawalDay: true,
          limits: { min: 5, max: 10 },
          dayName: "Lundi",
        }
      case 2: // Mardi
        return {
          success: true,
          isWithdrawalDay: true,
          limits: { min: 50, max: 500 },
          dayName: "Mardi",
        }
      case 3: // Mercredi
        return {
          success: true,
          isWithdrawalDay: true,
          limits: { min: 1000, max: 10000 },
          dayName: "Mercredi",
        }
      case 4: // Jeudi
        return {
          success: true,
          isWithdrawalDay: true,
          limits: { min: 50000, max: 500000 },
          dayName: "Jeudi",
        }
      case 5: // Vendredi
        return {
          success: true,
          isWithdrawalDay: true,
          limits: { min: 0, max: 100000 },
          dayName: "Vendredi",
        }
      default: // Weekend
        return {
          success: true,
          isWithdrawalDay: false,
          limits: { min: 0, max: 0 },
          dayName: "Weekend",
        }
    }
  } catch (error: any) {
    console.error("Erreur dans getWithdrawalLimits:", error)
    // En cas d'erreur, retourner des valeurs par défaut
    return {
      success: false,
      error: error.message,
      isWithdrawalDay: false,
      limits: { min: 0, max: 0 },
    }
  }
}

/**
 * Demande un retrait de fonds
 * L'administrateur vérifiera manuellement si le jour est valide et si le montant est disponible
 */
export async function requestWithdrawal(userId: string, amount: number, walletAddress: string) {
  const supabase = await createServerSupabaseClient()

  try {
    // Vérifier si aujourd'hui est un jour de retrait et obtenir les limites
    const withdrawalLimits = await getWithdrawalLimits()

    if (!withdrawalLimits.success) {
      return { success: false, error: "Impossible de vérifier les limites de retrait" }
    }

    if (!withdrawalLimits.isWithdrawalDay) {
      return {
        success: false,
        error: "Les retraits ne sont pas disponibles aujourd'hui. Veuillez réessayer un jour ouvrable.",
      }
    }

    // Vérifier si le montant est dans les limites autorisées
    const { min, max } = withdrawalLimits.limits
    if (amount < min) {
      return {
        success: false,
        error: `Le montant minimum de retrait pour ${withdrawalLimits.dayName} est de ${min} USDT`,
      }
    }

    if (amount > max) {
      return {
        success: false,
        error: `Le montant maximum de retrait pour ${withdrawalLimits.dayName} est de ${max} USDT`,
      }
    }

    // Calculer les frais (10%)
    const fee = amount * 0.1
    const netAmount = amount - fee

    // Créer l'enregistrement de retrait avec statut "pending"
    const { data, error } = await supabase
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

    if (error) {
      console.error("Error creating withdrawal request:", error)
      return { success: false, error: error.message }
    }

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

/**
 * Récupère l'historique des retraits d'un utilisateur
 */
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
