import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"
import type { Database } from "@/lib/supabase/database.types"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ success: false, error: "ID utilisateur manquant" }, { status: 400 })
    }

    console.log(`Récupération des achats pour l'utilisateur ${userId}`)

    // Créer un client Supabase pour les Route Handlers
    const supabase = createRouteHandlerClient<Database>({ cookies })

    // Vérifier si l'utilisateur existe
    const { data: user, error: userError } = await supabase.from("users").select("id").eq("id", userId).single()

    if (userError) {
      console.error("Erreur lors de la vérification de l'utilisateur:", userError)
      return NextResponse.json({ success: false, error: "Utilisateur non trouvé" }, { status: 404 })
    }

    // Récupérer les achats de l'utilisateur avec les détails des produits
    const { data: purchases, error: purchasesError } = await supabase
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
      .order("created_at", { ascending: false })

    if (purchasesError) {
      console.error("Erreur lors de la récupération des achats:", purchasesError)
      return NextResponse.json({ success: false, error: "Impossible de récupérer les achats" }, { status: 500 })
    }

    console.log(`${purchases.length} achats trouvés pour l'utilisateur ${userId}`)

    // Vérifier si les produits sont correctement liés
    const purchasesWithValidProducts = purchases.map((purchase) => {
      if (!purchase.products) {
        console.warn(`Achat ${purchase.id} sans produit associé`)
        return {
          ...purchase,
          products: {
            id: "unknown",
            name: "Produit inconnu",
            description: "Ce produit n'existe plus dans la base de données",
            price: purchase.amount,
            category: "Inconnu",
            image_url: null,
            demo_url: null,
          },
        }
      }
      return purchase
    })

    return NextResponse.json({
      success: true,
      data: purchasesWithValidProducts,
    })
  } catch (error: any) {
    console.error("Erreur dans la route API d'achats:", error)
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 })
  }
}
