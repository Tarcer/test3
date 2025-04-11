"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { v4 as uuidv4 } from "uuid"

/**
 * Génère les revenus quotidiens pour tous les utilisateurs
 * Cette fonction peut être exécutée quotidiennement via un cron job
 */
export async function generateDailyEarningsForAllUsers() {
  const supabase = await createServerSupabaseClient()

  try {
    // Récupérer tous les utilisateurs
    const { data: users, error: usersError } = await supabase.from("users").select("id")

    if (usersError) {
      console.error("Error fetching users:", usersError)
      return { success: false, error: usersError.message }
    }

    const results = []

    // Générer les revenus pour chaque utilisateur
    for (const user of users) {
      const result = await generateDailyEarningsForUser(user.id)
      results.push({
        userId: user.id,
        result,
      })
    }

    return {
      success: true,
      message: `Generated daily earnings for ${users.length} users`,
      results,
    }
  } catch (error: any) {
    console.error("Error in generateDailyEarningsForAllUsers:", error)
    return { success: false, error: error.message }
  }
}

/**
 * Génère les revenus quotidiens pour un utilisateur spécifique
 */
export async function generateDailyEarningsForUser(userId: string, date?: string) {
  const supabase = await createServerSupabaseClient()

  try {
    // Vérifier si l'utilisateur existe
    const { data: user, error: userError } = await supabase.from("users").select("id").eq("id", userId).single()

    if (userError) {
      console.error("Error verifying user:", userError)
      return { success: false, error: userError.message }
    }

    // Récupérer les achats actifs de l'utilisateur
    const { data: purchases, error: purchasesError } = await supabase
      .from("purchases")
      .select("id, amount, created_at")
      .eq("user_id", userId)
      .eq("status", "completed")

    if (purchasesError) {
      console.error("Error fetching purchases:", purchasesError)
      return { success: false, error: purchasesError.message }
    }

    if (purchases.length === 0) {
      return { success: true, message: "No purchases found for this user", generated: 0 }
    }

    // Date pour les revenus (aujourd'hui par défaut)
    const earningsDate = date ? new Date(date) : new Date()
    const startOfDay = new Date(earningsDate)
    startOfDay.setHours(0, 0, 0, 0)

    const endOfDay = new Date(earningsDate)
    endOfDay.setHours(23, 59, 59, 999)

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
        .gte("created_at", startOfDay.toISOString())
        .lt("created_at", endOfDay.toISOString())

      // Si aucun revenu n'existe pour cette date, en créer un
      if (!existingEarnings || existingEarnings.length === 0) {
        // Calculer le jour actuel depuis l'achat
        const purchaseDate = new Date(purchase.created_at)
        const daysDiff = Math.floor((earningsDate.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24)) + 1

        // Ne générer des revenus que pour les 45 premiers jours
        if (daysDiff <= 45) {
          earningsToInsert.push({
            id: uuidv4(),
            user_id: userId,
            purchase_id: purchase.id,
            amount: dailyAmount,
            day_number: daysDiff,
            status: "completed",
            created_at: new Date().toISOString(),
          })
        }
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
        message: `Generated ${earningsToInsert.length} earnings for user ${userId}`,
        generated: earningsToInsert.length,
        earnings: earningsToInsert,
      }
    }

    return { success: true, message: "No new earnings to generate", generated: 0 }
  } catch (error: any) {
    console.error("Error in generateDailyEarningsForUser:", error)
    return { success: false, error: error.message }
  }
}

/**
 * Génère les revenus manquants pour un utilisateur sur une période donnée
 */
export async function generateMissingEarnings(userId: string, startDate: string, endDate: string) {
  const supabase = await createServerSupabaseClient()

  try {
    // Vérifier si l'utilisateur existe
    const { data: user, error: userError } = await supabase.from("users").select("id").eq("id", userId).single()

    if (userError) {
      console.error("Error verifying user:", userError)
      return { success: false, error: userError.message }
    }

    const start = new Date(startDate)
    const end = new Date(endDate)

    if (start > end) {
      return { success: false, error: "Start date must be before end date" }
    }

    const results = []
    const currentDate = new Date(start)

    // Générer les revenus pour chaque jour de la période
    while (currentDate <= end) {
      const dateString = currentDate.toISOString().split("T")[0]
      const result = await generateDailyEarningsForUser(userId, dateString)
      results.push({
        date: dateString,
        result,
      })

      // Passer au jour suivant
      currentDate.setDate(currentDate.getDate() + 1)
    }

    return {
      success: true,
      message: `Generated earnings for ${results.length} days`,
      results,
    }
  } catch (error: any) {
    console.error("Error in generateMissingEarnings:", error)
    return { success: false, error: error.message }
  }
}
