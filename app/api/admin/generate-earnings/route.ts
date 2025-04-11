import { type NextRequest, NextResponse } from "next/server"
import { generateDailyEarnings } from "@/lib/services/earnings-service"

export async function POST(request: NextRequest) {
  try {
    const { userId, date } = await request.json()

    if (!userId) {
      return NextResponse.json({ success: false, error: "ID utilisateur manquant" }, { status: 400 })
    }

    // Vérifier si l'utilisateur est administrateur (à implémenter selon votre logique)
    // const supabase = createRouteHandlerClient<Database>({ cookies })
    // const { data: { user } } = await supabase.auth.getUser()
    // if (!user || !isAdmin(user.id)) {
    //   return NextResponse.json({ success: false, error: "Non autorisé" }, { status: 403 })
    // }

    // Générer les revenus quotidiens
    const result = await generateDailyEarnings(userId, date)

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      data: result.data,
    })
  } catch (error: any) {
    console.error("Erreur dans la route API de génération de revenus:", error)
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 })
  }
}
