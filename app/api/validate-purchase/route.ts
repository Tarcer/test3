import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { emitTransactionEvent } from "@/lib/events/transaction-events"
import { v4 as uuidv4 } from "uuid"

export async function POST(request: Request) {
  try {
    const { purchaseId } = await request.json()

    if (!purchaseId) {
      return NextResponse.json({ success: false, error: "ID d'achat manquant" }, { status: 400 })
    }

    console.log(`Validation de l'achat ${purchaseId}...`)
    const supabase = await createServerSupabaseClient()

    // Récupérer les informations de l'achat avant la mise à jour
    const { data: purchaseData, error: purchaseError } = await supabase
      .from("purchases")
      .select("id, user_id, amount, product_id, last_validated_at, created_at")
      .eq("id", purchaseId)
      .single()

    if (purchaseError) {
      console.error("Erreur lors de la récupération des informations de l'achat:", purchaseError)
      return NextResponse.json(
        { success: false, error: "Erreur lors de la récupération des informations de l'achat" },
        { status: 500 },
      )
    }

    console.log("Informations de l'achat récupérées:", purchaseData)

    // Vérifier si l'achat a déjà été validé aujourd'hui
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()

    if (purchaseData.last_validated_at) {
      const lastValidatedDate = new Date(purchaseData.last_validated_at)
      const lastValidatedDay = new Date(
        lastValidatedDate.getFullYear(),
        lastValidatedDate.getMonth(),
        lastValidatedDate.getDate(),
      ).toISOString()

      if (lastValidatedDay === today) {
        console.log(`L'achat ${purchaseId} a déjà été validé aujourd'hui.`)
        return NextResponse.json({
          success: true,
          message: "Cet achat a déjà été validé aujourd'hui",
          alreadyValidated: true,
          data: purchaseData,
        })
      }
    }

    // Vérifier si un revenu a déjà été généré aujourd'hui pour cet achat
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    startOfDay.setHours(0, 0, 0, 0)

    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    endOfDay.setHours(23, 59, 59, 999)

    const { data: existingEarnings, error: existingEarningsError } = await supabase
      .from("earnings")
      .select("id")
      .eq("purchase_id", purchaseId)
      .gte("created_at", startOfDay.toISOString())
      .lte("created_at", endOfDay.toISOString())

    if (existingEarningsError) {
      console.error("Erreur lors de la vérification des revenus existants:", existingEarningsError)
    } else if (existingEarnings && existingEarnings.length > 0) {
      console.log(`Un revenu existe déjà pour l'achat ${purchaseId} aujourd'hui.`)

      // Mettre à jour la date de validation quand même
      const nowISOString = now.toISOString()
      await supabase
        .from("purchases")
        .update({
          last_validated_at: nowISOString,
        })
        .eq("id", purchaseId)

      // Émettre un événement de transaction pour mettre à jour l'UI
      await emitTransactionEvent({
        type: "purchase",
        userId: purchaseData.user_id,
        amount: purchaseData.amount,
        transactionId: purchaseId,
        metadata: {
          validated: true,
          timestamp: nowISOString,
          alreadyEarned: true,
        },
      })

      return NextResponse.json({
        success: true,
        message: "Validation enregistrée, mais le revenu a déjà été généré aujourd'hui",
        alreadyEarned: true,
        data: { ...purchaseData, last_validated_at: nowISOString },
      })
    }

    // Mettre à jour la date de validation de l'achat
    const nowISOString = now.toISOString()
    const { data, error } = await supabase
      .from("purchases")
      .update({
        last_validated_at: nowISOString,
      })
      .eq("id", purchaseId)
      .select("user_id, amount, last_validated_at")
      .single()

    if (error) {
      console.error("Erreur lors de la mise à jour de la date de validation:", error)
      return NextResponse.json(
        { success: false, error: "Erreur lors de la mise à jour de la date de validation" },
        { status: 500 },
      )
    }

    console.log("Date de validation mise à jour avec succès:", nowISOString)

    // Générer directement un revenu quotidien pour cet achat spécifique
    if (purchaseData) {
      try {
        console.log(`Génération directe d'un revenu quotidien pour l'achat ${purchaseId}`)

        // Calculer le montant quotidien (1/45 du prix d'achat)
        const dailyAmount = Number(purchaseData.amount) / 45

        // Calculer le jour actuel depuis l'achat
        const purchaseDate = new Date(purchaseData.created_at || nowISOString)
        const daysDiff = Math.floor((now.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24)) + 1

        // Créer directement l'enregistrement de revenu
        const { data: earningData, error: earningError } = await supabase
          .from("earnings")
          .insert({
            id: uuidv4(),
            user_id: purchaseData.user_id,
            purchase_id: purchaseId,
            amount: dailyAmount,
            day_number: daysDiff > 0 ? daysDiff : 1,
            status: "completed",
            created_at: nowISOString,
          })
          .select()
          .single()

        if (earningError) {
          console.error("Erreur lors de la création du revenu quotidien:", earningError)
        } else {
          console.log("Revenu quotidien créé avec succès:", earningData)
        }
      } catch (earningsError) {
        console.error("Erreur lors de la génération des revenus quotidiens:", earningsError)
        // Ne pas bloquer la validation en cas d'erreur de génération des revenus
      }

      // Émettre un événement de transaction pour mettre à jour l'UI
      await emitTransactionEvent({
        type: "purchase",
        userId: purchaseData.user_id,
        amount: purchaseData.amount,
        transactionId: purchaseId,
        metadata: {
          validated: true,
          timestamp: nowISOString,
        },
      })
    }

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error("Erreur dans la route API de validation d'achat:", error)
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 })
  }
}
