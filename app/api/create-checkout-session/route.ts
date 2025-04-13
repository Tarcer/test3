import { NextResponse } from "next/server"

export async function POST(request: Request) {
  return NextResponse.json(
    {
      success: false,
      error: "Cette fonctionnalité a été désactivée. Veuillez utiliser le paiement par solde du compte.",
    },
    { status: 400 },
  )
}
