export const dynamic = "force-dynamic"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import CryptoSettingsForm from "./crypto-settings-form"

export default async function CryptoSettingsPage() {
  const supabase = await createServerSupabaseClient()

  // Vérifier si l'utilisateur est connecté et est administrateur
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/account/login?redirectTo=/admin/crypto-settings")
  }

  // Vérifier si l'utilisateur est administrateur (à implémenter selon votre logique)
  // ...

  // Récupérer les paramètres actuels
  const { data: settings, error } = await supabase
    .from("system_settings")
    .select("value")
    .eq("key", "crypto_conversion_settings")
    .single()

  const defaultSettings = {
    minimumAmount: 100,
    walletAddress: "",
    autoConvert: false,
  }

  const currentSettings = settings?.value || defaultSettings

  return (
    <div className="container py-10">
      <h1 className="mb-6 text-3xl font-bold">Paramètres de conversion crypto</h1>
      <CryptoSettingsForm initialSettings={currentSettings} />
    </div>
  )
}
