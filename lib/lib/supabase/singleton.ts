"use client"

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/lib/supabase/database.types"

// Variable globale pour stocker l'instance unique
let supabaseInstance: ReturnType<typeof createClientComponentClient<Database>> | null = null

// Fonction pour obtenir l'instance unique du client Supabase
export function getSupabaseClient() {
  if (typeof window === "undefined") {
    // En SSR, toujours créer une nouvelle instance
    return createClientComponentClient<Database>()
  }

  // En CSR, réutiliser l'instance existante ou en créer une nouvelle
  if (!supabaseInstance) {
    supabaseInstance = createClientComponentClient<Database>()
  }

  return supabaseInstance
}
