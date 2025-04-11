import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  try {
    const supabase = await createServerSupabaseClient()

    // 1. Vérifier la structure de la table users
    const { data: userColumns, error: userColumnsError } = await supabase.from("users").select("*").limit(1)

    if (userColumnsError) {
      return NextResponse.json(
        {
          success: false,
          error: "Erreur lors de la vérification de la table users",
          details: userColumnsError,
        },
        { status: 500 },
      )
    }

    // 2. Vérifier un exemple d'utilisateur avec un parrain
    const { data: referredUsers, error: referredUsersError } = await supabase
      .from("users")
      .select("id, name, email, referred_by")
      .not("referred_by", "is", null)
      .limit(5)

    if (referredUsersError) {
      return NextResponse.json(
        {
          success: false,
          error: "Erreur lors de la recherche d'utilisateurs parrainés",
          details: referredUsersError,
        },
        { status: 500 },
      )
    }

    // 3. Vérifier les codes de parrainage
    const { data: referralCodes, error: referralCodesError } = await supabase
      .from("users")
      .select("id, name, email, referral_code")
      .limit(5)

    if (referralCodesError) {
      return NextResponse.json(
        {
          success: false,
          error: "Erreur lors de la vérification des codes de parrainage",
          details: referralCodesError,
        },
        { status: 500 },
      )
    }

    // 4. Vérifier les achats d'utilisateurs parrainés
    let purchasesOfReferredUsers = []
    if (referredUsers.length > 0) {
      const { data: purchases, error: purchasesError } = await supabase
        .from("purchases")
        .select("id, user_id, amount, created_at, status")
        .in(
          "user_id",
          referredUsers.map((user) => user.id),
        )
        .limit(10)

      if (purchasesError) {
        return NextResponse.json(
          {
            success: false,
            error: "Erreur lors de la vérification des achats",
            details: purchasesError,
          },
          { status: 500 },
        )
      }

      purchasesOfReferredUsers = purchases
    }

    // 5. Vérifier les commissions existantes
    const { data: commissions, error: commissionsError } = await supabase
      .from("affiliate_commissions")
      .select("*")
      .limit(10)

    if (commissionsError) {
      return NextResponse.json(
        {
          success: false,
          error: "Erreur lors de la vérification des commissions",
          details: commissionsError,
        },
        { status: 500 },
      )
    }

    // 6. Vérifier les transactions de solde liées aux commissions
    const { data: balanceTransactions, error: balanceTransactionsError } = await supabase
      .from("balance_transactions")
      .select("*")
      .eq("type", "credit")
      .ilike("description", "%commission%")
      .limit(10)

    if (balanceTransactionsError) {
      return NextResponse.json(
        {
          success: false,
          error: "Erreur lors de la vérification des transactions de solde",
          details: balanceTransactionsError,
        },
        { status: 500 },
      )
    }

    // Retourner toutes les informations de diagnostic
    return NextResponse.json({
      success: true,
      data: {
        userStructure: userColumns ? Object.keys(userColumns[0]) : [],
        referredUsers,
        referralCodes,
        purchasesOfReferredUsers,
        commissions,
        balanceTransactions,
      },
    })
  } catch (error: any) {
    console.error("Erreur lors du diagnostic:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Erreur serveur lors du diagnostic",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
