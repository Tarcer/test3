import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { v4 as uuidv4 } from "uuid"

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Vous devez être connecté pour effectuer un dépôt" },
        { status: 401 },
      )
    }

    // Récupérer et valider les données de la requête
    let requestData
    try {
      requestData = await request.json()
    } catch (error) {
      console.error("Erreur de parsing JSON de la requête:", error)
      return NextResponse.json({ success: false, error: "Format de requête invalide" }, { status: 400 })
    }

    const { amount, userId } = requestData

    if (!amount || amount <= 0) {
      return NextResponse.json({ success: false, error: "Montant invalide" }, { status: 400 })
    }

    // Vérifier que l'utilisateur existe
    const { data: userData, error: userError } = await supabase.from("users").select("id").eq("id", userId).single()

    if (userError || !userData) {
      console.error("Erreur lors de la vérification de l'utilisateur:", userError)
      return NextResponse.json({ success: false, error: "Utilisateur non trouvé" }, { status: 404 })
    }

    // Création d'un identifiant unique pour le dépôt
    const depositId = uuidv4()

    // URL du site
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"

    try {
      // Créer d'abord l'enregistrement de dépôt en attente
      const { error: insertError } = await supabase.from("deposits").insert({
        id: depositId,
        user_id: userId,
        amount,
        transaction_hash: null,
        status: "pending",
      })

      if (insertError) {
        console.error("Erreur lors de l'insertion du dépôt:", insertError)
        return NextResponse.json({ success: false, error: "Erreur lors de l'enregistrement du dépôt" }, { status: 500 })
      }

      // Utiliser une approche plus directe pour créer la charge Coinbase
      const apiKey = process.env.COINBASE_COMMERCE_API_KEY
      if (!apiKey) {
        throw new Error("Clé API Coinbase Commerce manquante")
      }

      const chargeData = {
        name: "Dépôt de fonds",
        description: "Dépôt de fonds sur votre compte WebCrypto Market",
        pricing_type: "fixed_price",
        local_price: {
          amount: amount.toString(),
          currency: "EUR",
        },
        metadata: {
          userId,
          depositId,
          type: "deposit",
        },
        redirect_url: `${siteUrl}/dashboard/deposits?success=true&deposit_id=${depositId}`,
        cancel_url: `${siteUrl}/dashboard/deposits?success=false`,
      }

      // Appel direct à l'API Coinbase Commerce
      const response = await fetch("https://api.commerce.coinbase.com/charges", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CC-Api-Key": apiKey,
          "X-CC-Version": "2018-03-22",
        },
        body: JSON.stringify(chargeData),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Erreur Coinbase Commerce:", errorText)

        // Supprimer le dépôt créé précédemment
        await supabase.from("deposits").delete().eq("id", depositId)

        return NextResponse.json(
          { success: false, error: `Erreur lors de la création du paiement: ${response.status}` },
          { status: 500 },
        )
      }

      const chargeResult = await response.json()

      // Mettre à jour l'enregistrement de dépôt avec l'ID de charge
      await supabase
        .from("deposits")
        .update({
          transaction_hash: `coinbase_${chargeResult.data.id}`,
          description: "Paiement par carte bancaire via Coinbase Commerce",
        })
        .eq("id", depositId)

      return NextResponse.json({
        success: true,
        chargeId: chargeResult.data.id,
        hostedUrl: chargeResult.data.hosted_url,
      })
    } catch (error: any) {
      console.error("Erreur lors de la création du paiement:", error)

      // Supprimer le dépôt en cas d'erreur
      await supabase.from("deposits").delete().eq("id", depositId)

      return NextResponse.json(
        { success: false, error: error.message || "Erreur lors de la création du paiement" },
        { status: 500 },
      )
    }
  } catch (error: any) {
    console.error("Erreur globale lors de la création du dépôt:", error)
    return NextResponse.json(
      { success: false, error: "Erreur serveur lors du traitement de la demande" },
      { status: 500 },
    )
  }
}
