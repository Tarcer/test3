"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

interface CryptoSettings {
  minimumAmount: number
  walletAddress: string
  autoConvert: boolean
}

export async function updateCryptoSettings(settings: CryptoSettings) {
  try {
    const supabase = await createServerSupabaseClient()

    // Check if the user is logged in and is an administrator
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return { success: false, error: "Not authorized" }
    }

    // Check if settings already exist
    const { data: existingSettings } = await supabase
      .from("system_settings")
      .select("id")
      .eq("key", "crypto_conversion_settings")
      .single()

    if (existingSettings) {
      // Update existing settings
      const { error } = await supabase
        .from("system_settings")
        .update({ value: settings })
        .eq("key", "crypto_conversion_settings")

      if (error) {
        throw error
      }
    } else {
      // Create new settings
      const { error } = await supabase.from("system_settings").insert({
        key: "crypto_conversion_settings",
        value: settings,
      })

      if (error) {
        throw error
      }
    }

    // Revalidate path to update UI
    revalidatePath("/admin/crypto-settings")

    return { success: true }
  } catch (error: any) {
    console.error("Error updating crypto settings:", error)
    return { success: false, error: error.message }
  }
}
