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

// Modifier la fonction generateDailyEarningsForUser pour s'assurer qu'elle fonctionne correctement
// et ajouter plus de logs pour le débogage

/**
 * Génère les revenus quotidiens pour un utilisateur spécifique
 */
export async function generateDailyEarningsForUser(userId: string, date?: string) {
  const supabase = await createServerSupabaseClient()

  try {
    console.log(`Début de generateDailyEarningsForUser pour l'utilisateur ${userId}`)

    // Vérifier si l'utilisateur existe
    const { data: user, error: userError } = await supabase.from("users").select("id").eq("id", userId).single()

    if (userError) {
      console.error("Error verifying user:", userError)
      return { success: false, error: userError.message }
    }

    // Récupérer les achats actifs de l'utilisateur
    const { data: purchases, error: purchasesError } = await supabase
      .from("purchases")
      .select("id, amount, created_at, last_validated_at")
      .eq("user_id", userId)
      .eq("status", "completed")

    if (purchasesError) {
      console.error("Error fetching purchases:", purchasesError)
      return { success: false, error: purchasesError.message }
    }

    console.log(`${purchases.length} achats trouvés pour l'utilisateur ${userId}`)

    if (purchases.length === 0) {
      return { success: true, message: "No purchases found for this user", generated: 0 }
    }

    // Date pour les revenus (aujourd'hui par défaut)
    const earningsDate = date ? new Date(date) : new Date()
    const startOfDay = new Date(earningsDate)
    startOfDay.setHours(0, 0, 0, 0)

    const endOfDay = new Date(earningsDate)
    endOfDay.setHours(23, 59, 59, 999)

    console.log(`Période de recherche: ${startOfDay.toISOString()} à ${endOfDay.toISOString()}`)

    // Générer des revenus pour chaque achat
    const earningsToInsert = []

    for (const purchase of purchases) {
      console.log(`Traitement de l'achat ${purchase.id}`)

      // Calculer le montant quotidien (1/45 du prix d'achat)
      const dailyAmount = Number(purchase.amount) / 45
      console.log(`Montant quotidien calculé: ${dailyAmount}`)

      // Vérifier si un revenu existe déjà pour cet achat à cette date
      const { data: existingEarnings, error: existingError } = await supabase
        .from("earnings")
        .select("id")
        .eq("user_id", userId)
        .eq("purchase_id", purchase.id)
        .gte("created_at", startOfDay.toISOString())
        .lt("created_at", endOfDay.toISOString())

      console.log(`Revenus existants pour l'achat ${purchase.id}:`, existingEarnings)

      // Si aucun revenu n'existe pour cette date, en créer un
      if (!existingEarnings || existingEarnings.length === 0) {
        // Calculer le jour actuel depuis l'achat
        const purchaseDate = new Date(purchase.created_at)
        const daysDiff = Math.floor((earningsDate.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
        console.log(`Jour actuel depuis l'achat: ${daysDiff}`)

        // Ne générer des revenus que pour les 45 premiers jours
        if (daysDiff <= 45) {
          const earningId = uuidv4()
          console.log(`Création d'un nouveau revenu avec ID: ${earningId}`)

          earningsToInsert.push({
            id: earningId,
            user_id: userId,
            purchase_id: purchase.id,
            amount: dailyAmount,
            day_number: daysDiff,
            status: "completed",
            created_at: new Date().toISOString(),
          })
        } else {
          console.log(`L'achat ${purchase.id} a dépassé la période de 45 jours`)
        }
      } else {
        console.log(`Un revenu existe déjà pour l'achat ${purchase.id} à cette date`)
      }
    }

    // Insérer les nouveaux revenus
    if (earningsToInsert.length > 0) {
      console.log(`Insertion de ${earningsToInsert.length} nouveaux revenus:`, earningsToInsert)

      const { data: insertedEarnings, error: insertError } = await supabase
        .from("earnings")
        .insert(earningsToInsert)
        .select()

      if (insertError) {
        console.error("Error inserting earnings:", insertError)
        return { success: false, error: insertError.message }
      }

      console.log(`${insertedEarnings.length} revenus insérés avec succès`)

      return {
        success: true,
        message: `Generated ${earningsToInsert.length} earnings for user ${userId}`,
        generated: earningsToInsert.length,
        earnings: insertedEarnings,
      }
    }

    console.log("Aucun nouveau revenu à générer")
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

// Add a function to check and generate missing earnings for a user
// This will be used to ensure earnings are generated when needed

/**
 * Vérifie et génère les revenus manquants pour un utilisateur
 * Cette fonction est appelée lorsque l'utilisateur consulte ses revenus quotidiens
 */
export async function checkAndGenerateMissingEarnings(userId: string) {
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
      .select("id, amount, created_at, last_validated_at")
      .eq("user_id", userId)
      .eq("status", "completed")

    if (purchasesError) {
      console.error("Error fetching purchases:", purchasesError)
      return { success: false, error: purchasesError.message }
    }

    if (purchases.length === 0) {
      return { success: true, message: "No purchases found for this user", generated: 0 }
    }

    // Date pour les revenus (aujourd'hui)
    const today = new Date()
    const startOfDay = new Date(today)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(today)
    endOfDay.setHours(23, 59, 59, 999)

    // Vérifier les achats validés récemment (dernières 24h)
    const recentlyValidatedPurchases = purchases.filter((purchase) => {
      return (
        purchase.last_validated_at &&
        new Date(purchase.last_validated_at).getTime() > today.getTime() - 24 * 60 * 60 * 1000
      )
    })

    // Générer des revenus pour chaque achat validé récemment
    const earningsToInsert = []
    const generatedResults = []

    for (const purchase of recentlyValidatedPurchases) {
      // Vérifier si un revenu existe déjà pour cet achat à cette date
      const { data: existingEarnings, error: existingError } = await supabase
        .from("earnings")
        .select("id")
        .eq("user_id", userId)
        .eq("purchase_id", purchase.id)
        .gte("created_at", startOfDay.toISOString())
        .lt("created_at", endOfDay.toISOString())
        .maybeSingle()

      // Si aucun revenu n'existe pour cette date, en créer un
      if (!existingEarnings) {
        // Calculer le montant quotidien (1/45 du prix d'achat)
        const dailyAmount = Number(purchase.amount) / 45

        // Calculer le jour actuel depuis l'achat
        const purchaseDate = new Date(purchase.created_at)
        const daysDiff = Math.floor((today.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24)) + 1

        // Ne générer des revenus que pour les 45 premiers jours
        if (daysDiff <= 45) {
          const earningId = uuidv4()
          earningsToInsert.push({
            id: earningId,
            user_id: userId,
            purchase_id: purchase.id,
            amount: dailyAmount,
            day_number: daysDiff,
            status: "completed",
            created_at: new Date().toISOString(),
          })

          generatedResults.push({
            purchaseId: purchase.id,
            earningId: earningId,
            amount: dailyAmount,
            dayNumber: daysDiff,
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
        message: `Generated ${earningsToInsert.length} earnings for recently validated purchases`,
        generated: earningsToInsert.length,
        earnings: generatedResults,
      }
    }

    return { success: true, message: "No new earnings to generate for validated purchases", generated: 0 }
  } catch (error: any) {
    console.error("Error in checkAndGenerateMissingEarnings:", error)
    return { success: false, error: error.message }
  }
}
