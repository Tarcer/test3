"use client"

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/lib/supabase/database.types"

// Vérification des variables d'environnement avec logs
if (typeof window !== "undefined") {
  console.log("Supabase URL disponible:", !!process.env.NEXT_PUBLIC_SUPABASE_URL)
  console.log("Supabase ANON KEY disponible:", !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
}

// Création du client Supabase avec les variables d'environnement explicites
const supabaseClient = createClientComponentClient<Database>({
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
})

export { supabaseClient }
