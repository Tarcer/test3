"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"

export interface Transaction {
  id: string
  user_id: string
  amount: number
  type: string
  description: string
  created_at: string
  transaction_id?: string
  status?: string
}

export async function getUserTransactions(userId: string) {
  const supabase = await createServerSupabaseClient()

  try {
    // Récupérer les transactions de solde
    const { data: balanceTransactions, error: balanceError } = await supabase
      .from("balance_transactions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (balanceError) {
      console.error("Error fetching balance transactions:", balanceError)
      return { success: false, error: balanceError.message }
    }

    // Récupérer les dépôts
    const { data: deposits, error: depositsError } = await supabase
      .from("deposits")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (depositsError) {
      console.error("Error fetching deposits:", depositsError)
      return { success: false, error: depositsError.message }
    }

    // Récupérer les achats
    const { data: purchases, error: purchasesError } = await supabase
      .from("purchases")
      .select(`
        id,
        user_id,
        amount,
        status,
        created_at,
        transaction_id,
        products:product_id (
          name
        )
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (purchasesError) {
      console.error("Error fetching purchases:", purchasesError)
      return { success: false, error: purchasesError.message }
    }

    // Convertir les dépôts au format de transaction
    const depositTransactions = deposits.map((deposit) => ({
      id: deposit.id,
      user_id: deposit.user_id,
      amount: deposit.amount,
      type: "deposit",
      description: "Dépôt de fonds",
      created_at: deposit.created_at,
      status: deposit.status,
    }))

    // Convertir les achats au format de transaction
    const purchaseTransactions = purchases.map((purchase) => ({
      id: purchase.id,
      user_id: purchase.user_id,
      amount: purchase.amount, // Montant positif pour l'affichage
      type: "purchase",
      description: `Achat: ${purchase.products?.name || "Produit"}`,
      created_at: purchase.created_at,
      transaction_id: purchase.transaction_id,
      status: purchase.status,
    }))

    // Fusionner toutes les transactions et trier par date
    const allTransactions = [...balanceTransactions, ...depositTransactions, ...purchaseTransactions].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )

    return { success: true, data: allTransactions }
  } catch (error: any) {
    console.error("Error in getUserTransactions:", error)
    return { success: false, error: error.message }
  }
}
