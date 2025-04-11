import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Vous devez être connecté pour effectuer cette action" },
        { status: 401 },
      )
    }

    // Vérifier si l'utilisateur est administrateur (à implémenter selon votre logique)
    // const isAdmin = await checkIfUserIsAdmin(session.user.id)
    // if (!isAdmin) {
    //   return NextResponse.json({ success: false, error: "Accès non autorisé" }, { status: 403 })
    // }

    let requestData
    try {
      requestData = await request.json()
    } catch (error) {
      requestData = {}
    }

    // Utiliser la clé API fournie ou celle configurée sur le serveur
    const apiKey = requestData.apiKey || process.env.COINBASE_COMMERCE_API_KEY

    if (!apiKey) {
      return NextResponse.json({ success: false, error: "Clé API Coinbase Commerce non configurée" }, { status: 400 })
    }

    // Tester la connexion à l'API Coinbase Commerce
    try {
      const response = await fetch("https://api.commerce.coinbase.com/charges", {
        method: "GET",
        headers: {
          "X-CC-Api-Key": apiKey,
          "X-CC-Version": "2018-03-22",
        },
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Erreur Coinbase Commerce:", errorText)
        return NextResponse.json(
          { success: false, error: `Erreur de connexion à Coinbase Commerce: ${response.status}` },
          { status: 500 },
        )
      }

      // Si nous arrivons ici, la connexion est réussie
      return NextResponse.json({
        success: true,
        apiKeyConfigured: true,
        message: "Connexion à l'API Coinbase Commerce réussie",
      })
    } catch (error: any) {
      console.error("Erreur lors du test Coinbase:", error)
      return NextResponse.json(
        { success: false, error: error.message || "Erreur lors du test de connexion" },
        { status: 500 },
      )
    }
  } catch (error: any) {
    console.error("Erreur globale lors du test Coinbase:", error)
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 })
  }
}
