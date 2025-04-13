import { createServerSupabaseClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import PaymentSettingsForm from "./payment-settings-form"

export default async function PaymentSettingsPage() {
  const supabase = await createServerSupabaseClient()

  // Vérifier si l'utilisateur est connecté et est administrateur
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/account/login?redirectTo=/admin/payment-settings")
  }

  // Vérifier si l'utilisateur est administrateur (à implémenter selon votre logique)
  // ...

  // Récupérer les paramètres actuels
  const { data: settings, error } = await supabase
    .from("system_settings")
    .select("value")
    .eq("key", "payment_settings")
    .single()

  const defaultSettings = {
    directCrypto: {
      enabled: true,
      displayName: "Paiement direct en crypto",
      walletAddress: "",
    },
  }

  const currentSettings = settings?.value || defaultSettings

  return (
    <div className="container py-10">
      <h1 className="mb-6 text-3xl font-bold">Paramètres de paiement</h1>
      <PaymentSettingsForm initialSettings={currentSettings} />
    </div>
  )
}
