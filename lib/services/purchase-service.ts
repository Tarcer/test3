"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { v4 as uuidv4 } from "uuid"
import { createBalanceTransaction } from "./balance-service"
import { processAffiliateCommissionsSimple } from "./affiliate-service-simple"

export async function createPurchase(userId: string, productId: string, amount: number, transactionId?: string) {
  const supabase = await createServerSupabaseClient()

  try {
    // Vérifier que l'utilisateur existe
    const { data: user, error: userError } = await supabase.from("users").select("id").eq("id", userId).single()

    if (userError || !user) {
      console.error("Error verifying user:", userError)
      return { success: false, error: "Utilisateur non trouvé" }
    }

    // Vérifier que le produit existe
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("id, price")
      .eq("id", productId)
      .single()

    if (productError || !product) {
      console.error("Error verifying product:", productError)
      return { success: false, error: "Produit non trouvé" }
    }

    // Générer un ID unique pour l'achat
    const purchaseId = uuidv4()

    // Créer l'achat
    const { data: purchase, error: purchaseError } = await supabase
      .from("purchases")
      .insert({
        id: purchaseId,
        user_id: userId,
        product_id: productId,
        amount: amount,
        status: "completed",
        transaction_id: transactionId || null,
      })
      .select()
      .single()

    if (purchaseError) {
      console.error("Error creating purchase:", purchaseError)
      return { success: false, error: purchaseError.message }
    }

    // Si aucun transactionId n'est fourni, créer une transaction de solde
    if (!transactionId) {
      const transactionResult = await createBalanceTransaction({
        userId,
        amount: amount,
        type: "purchase",
        description: `Achat du produit: ${product.id}`,
      })

      if (!transactionResult.success) {
        console.error("Error creating balance transaction for purchase:", transactionResult.error)
        // Ne pas échouer l'opération complète, mais enregistrer l'erreur
      }
    }

    // Générer le premier revenu quotidien immédiatement
    const dailyAmount = amount / 45
    const { error: earningError } = await supabase.from("earnings").insert({
      id: uuidv4(),
      user_id: userId,
      purchase_id: purchaseId,
      amount: dailyAmount,
      day_number: 1,
      status: "completed",
      created_at: new Date().toISOString(),
    })

    if (earningError) {
      console.error("Error creating first daily earning:", earningError)
      // Ne pas échouer l'opération complète, mais enregistrer l'erreur
    }

    // Traiter les commissions d'affiliation
    console.log(`Traitement des commissions pour l'achat ${purchaseId}`)
    const commissionResult = await processAffiliateCommissionsSimple(userId, purchaseId, amount)

    if (!commissionResult.success) {
      console.warn(`Avertissement: problème lors du traitement des commissions:`, commissionResult.error)
      // Ne pas bloquer l'achat si les commissions échouent
    } else {
      console.log(`Résultat du traitement des commissions:`, commissionResult)
    }

    // Revalider les chemins pour mettre à jour l'UI
    revalidatePath("/dashboard/purchases")
    revalidatePath("/admin/transactions")
    revalidatePath("/dashboard/affiliate")

    return { success: true, data: purchase }
  } catch (error: any) {
    console.error("Error in createPurchase:", error)
    return { success: false, error: error.message }
  }
}

/**
 * Récupère les achats récents d'un utilisateur
 * @param userId ID de l'utilisateur
 * @param limit Nombre maximum d'achats à récupérer (par défaut: 3)
 * @returns Les achats récents avec les détails des produits
 */
export async function getRecentPurchases(userId: string, limit = 3) {
  const supabase = await createServerSupabaseClient()

  try {
    // Récupérer les achats récents de l'utilisateur avec les détails des produits
    const { data, error } = await supabase
      .from("purchases")
      .select(`
       id,
       amount,
       status,
       created_at,
       products:product_id (
         id,
         name,
         description,
         price,
         category,
         image_url,
         demo_url
       )
     `)
      .eq("user_id", userId)
      .eq("status", "completed")
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error) {
      console.error("Error fetching recent purchases:", error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error: any) {
    console.error("Error in getRecentPurchases:", error)
    return { success: false, error: error.message }
  }
}
