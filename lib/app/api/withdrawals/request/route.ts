import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { requestWithdrawal } from "@/lib/services/withdrawal-service"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const userId = formData.get("userId") as string
    const amount = Number.parseFloat(formData.get("amount") as string)
    const walletAddress = formData.get("walletAddress") as string

    // Vérifier que les données sont valides
    if (!userId || isNaN(amount) || amount <= 0 || !walletAddress) {
      return NextResponse.redirect(new URL("/dashboard/withdrawals?error=invalid_data", request.url))
    }

    // Vérifier que l'utilisateur est authentifié
    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user || user.id !== userId) {
      return NextResponse.redirect(new URL("/account/login", request.url))
    }

    // Demander le retrait
    const result = await requestWithdrawal(userId, amount, walletAddress)

    if (!result.success) {
      return NextResponse.redirect(
        new URL(`/dashboard/withdrawals?error=${encodeURIComponent(result.error || "unknown_error")}`, request.url),
      )
    }

    // Rediriger vers la page de retraits avec un message de succès
    return NextResponse.redirect(new URL("/dashboard/withdrawals?success=true", request.url))
  } catch (error: any) {
    console.error("Error processing withdrawal request:", error)
    return NextResponse.redirect(
      new URL(`/dashboard/withdrawals?error=${encodeURIComponent(error.message || "unknown_error")}`, request.url),
    )
  }
}
