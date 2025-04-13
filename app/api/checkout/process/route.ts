import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { v4 as uuidv4 } from "uuid"
import type { Database } from "@/lib/supabase/database.types"
// Ajouter l'import pour les événements
import { emitTransactionEvent } from "@/lib/events/transaction-events"

// Cache pour le solde utilisateur
const balanceCache = new Map<string, { balance: number; timestamp: number }>()
const CACHE_TTL = 60 * 1000 // 60 secondes

export async function POST(request: Request) {
  let requestData

  try {
    requestData = await request.json()
  } catch (error) {
    console.error("Erreur lors du parsing de la requête:", error)
    return NextResponse.json({ success: false, error: "Format de requête invalide" }, { status: 400 })
  }

  const { userId, items, total } = requestData

  if (!userId || !items || !total) {
    return NextResponse.json({ success: false, error: "Données manquantes" }, { status: 400 })
  }

  // Vérifier si nous avons un solde en cache pour cet utilisateur
  const cachedBalance = balanceCache.get(userId)
  let balance = 0

  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })

    // 1. Vérifier si l'utilisateur existe
    try {
      const { data: user, error: userError } = await supabase.from("users").select("id").eq("id", userId).single()

      if (userError) {
        console.error("Erreur lors de la vérification de l'utilisateur:", userError)

        // Si nous avons un cache et que c'est probablement une erreur de rate limit
        if (cachedBalance && userError.message && userError.message.includes("Too Many")) {
          console.log("Utilisation du cache pour l'utilisateur")
        } else {
          return NextResponse.json({ success: false, error: "Utilisateur non trouvé" }, { status: 404 })
        }
      }
    } catch (error) {
      console.error("Exception lors de la vérification de l'utilisateur:", error)
      // Continuer si nous avons un cache
      if (!cachedBalance) {
        return NextResponse.json(
          { success: false, error: "Erreur lors de la vérification de l'utilisateur" },
          { status: 500 },
        )
      }
    }

    // 2. Récupérer le solde de l'utilisateur
    if (!cachedBalance) {
      try {
        const { data: transactions, error: txError } = await supabase
          .from("balance_transactions")
          .select("amount, type")
          .eq("user_id", userId)

        if (txError) {
          console.error("Erreur lors de la récupération des transactions:", txError)
          return NextResponse.json(
            { success: false, error: "Erreur lors de la récupération du solde" },
            { status: 500 },
          )
        }

        // Calculer le solde
        balance = transactions.reduce((total, tx) => {
          const amount = Number(tx.amount) || 0
          if (tx.type === "deposit" || tx.type === "credit") {
            return total + amount
          } else if (tx.type === "withdrawal" || tx.type === "purchase" || tx.type === "debit") {
            return total - amount
          }
          return total
        }, 0)

        // Mettre à jour le cache
        balanceCache.set(userId, { balance, timestamp: Date.now() })
      } catch (error) {
        console.error("Exception lors de la récupération du solde:", error)
        return NextResponse.json({ success: false, error: "Erreur lors de la récupération du solde" }, { status: 500 })
      }
    } else {
      // Utiliser le solde en cache
      balance = cachedBalance.balance
      console.log("Utilisation du solde en cache:", balance)
    }

    // Vérifier si le solde est suffisant
    if (balance < total) {
      return NextResponse.json({ success: false, error: "Solde insuffisant" }, { status: 400 })
    }

    // 3. Créer les achats et la transaction
    const transactionId = uuidv4()
    const purchaseIds = []

    try {
      // Créer les achats
      for (const item of items) {
        const purchaseId = uuidv4()

        const { error: purchaseError } = await supabase.from("purchases").insert({
          id: purchaseId,
          user_id: userId,
          product_id: item.productId,
          amount: item.price * item.quantity,
          status: "completed",
          transaction_id: transactionId,
        })

        if (purchaseError) {
          console.error("Erreur lors de la création de l'achat:", purchaseError)
          throw new Error("Erreur lors de la création de l'achat")
        }

        purchaseIds.push(purchaseId)
      }

      // Créer la transaction de solde
      const { error: txError } = await supabase.from("balance_transactions").insert({
        id: transactionId,
        user_id: userId,
        amount: total,
        type: "purchase",
        description: `Achat de ${items.length} produit(s) - IDs: ${purchaseIds.join(",")}`,
      })

      if (txError) {
        console.error("Erreur lors de la création de la transaction:", txError)
        // Ne pas échouer complètement, car les achats ont été créés
        return NextResponse.json({
          success: true,
          warning: "Les achats ont été créés mais la transaction de solde a échoué",
          data: {
            purchaseIds,
            remainingBalance: balance - total,
          },
        })
      }

      // Mettre à jour le cache du solde
      balanceCache.set(userId, { balance: balance - total, timestamp: Date.now() })

      // Invalider les caches pour forcer un rafraîchissement des données
      balanceCache.delete(userId)

      // Émettre un événement d'achat pour chaque produit
      for (const item of items) {
        await emitTransactionEvent({
          type: "purchase",
          userId,
          amount: item.price * item.quantity,
          transactionId,
          metadata: {
            productId: item.productId,
            quantity: item.quantity,
          },
        })
      }

      return NextResponse.json({
        success: true,
        data: {
          purchaseIds,
          remainingBalance: balance - total,
          transactionId,
        },
      })
    } catch (error) {
      console.error("Erreur lors du traitement de l'achat:", error)
      return NextResponse.json({ success: false, error: "Erreur lors du traitement de l'achat" }, { status: 500 })
    }
  } catch (error) {
    console.error("Erreur globale lors du traitement du paiement:", error)
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 })
  }
}
