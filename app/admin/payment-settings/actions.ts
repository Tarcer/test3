"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

interface PaymentSettings {
  coinbaseCommerce: {
    enabled: boolean
    displayName: string
    cryptoCurrency: string
  }
  directCrypto: {
    enabled: boolean
    displayName: string
    walletAddress: string
  }
}

export async function updatePaymentSettings(settings: PaymentSettings) {
  try {
    const supabase = await createServerSupabaseClient()

    // Vérifier si l'utilisateur est connecté et est administrateur
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return { success: false, error: "Non autorisé" }
    }

    // Vérifier si les paramètres existent déjà
    const { data: existingSettings } = await supabase
      .from("system_settings")
      .select("id")
      .eq("key", "payment_settings")
      .single()

    if (existingSettings) {
      // Mettre à jour les paramètres existants
      const { error } = await supabase.from("system_settings").update({ value: settings }).eq("key", "payment_settings")

      if (error) {
        throw error
      }
    } else {
      // Créer de nouveaux paramètres
      const { error } = await supabase.from("system_settings").insert({
        key: "payment_settings",
        value: settings,
      })

      if (error) {
        throw error
      }
    }

    // Revalider le chemin pour mettre à jour l'UI
    revalidatePath("/admin/payment-settings")

    return { success: true }
  } catch (error: any) {
    console.error("Erreur lors de la mise à jour des paramètres de paiement:", error)
    return { success: false, error: error.message }
  }
}
