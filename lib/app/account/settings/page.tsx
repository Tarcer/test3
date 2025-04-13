import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export const metadata: Metadata = {
  title: "Paramètres du compte",
  description: "Gérez vos paramètres et préférences de compte",
}

export default async function AccountSettingsPage() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/account/login")
  }

  const { data: user } = await supabase.from("users").select("*").eq("id", session.user.id).single()

  if (!user) {
    redirect("/account/login")
  }

  return (
    <div className="container max-w-5xl py-8">
      <h1 className="mb-6 text-3xl font-bold">Paramètres du compte</h1>

      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold">Informations personnelles</h2>

        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Email</p>
            <p>{user.email}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground">Nom</p>
            <p>{user.name}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground">ID Utilisateur</p>
            <p className="font-mono text-sm">{user.id}</p>
          </div>

          {user.solana_usdt_address && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Adresse USDT Solana</p>
              <p className="font-mono text-sm break-all">{user.solana_usdt_address}</p>
            </div>
          )}
        </div>

        <div className="mt-6">
          <h3 className="mb-2 text-lg font-medium">Paramètres de paiement</h3>
          <p className="text-muted-foreground">
            Nous utilisons Coinbase Commerce pour traiter tous les paiements de manière sécurisée.
          </p>
        </div>
      </div>
    </div>
  )
}
