import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get("code")

    if (!code) {
      return NextResponse.json({ success: false, error: "Code de parrainage manquant" }, { status: 400 })
    }

    const supabase = await createServerSupabaseClient()

    // Récupérer l'utilisateur par son code de parrainage
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id, name, email, referral_code")
      .eq("referral_code", code)
      .single()

    if (userError) {
      console.error("Erreur lors de la récupération de l'utilisateur:", userError)
      return NextResponse.json({ success: false, error: "Code de parrainage non trouvé" }, { status: 404 })
    }

    // Récupérer le nombre de filleuls
    const { data: referrals, error: referralsError } = await supabase.from("users").select("id").eq("referred_by", code)

    if (referralsError) {
      console.error("Erreur lors de la récupération des filleuls:", referralsError)
      return NextResponse.json(
        { success: false, error: "Erreur lors de la récupération des filleuls" },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        referralCode: user.referral_code,
        referralCount: referrals.length,
      },
    })
  } catch (error: any) {
    console.error("Erreur dans la route API de vérification de code de parrainage:", error)
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 })
  }
}
