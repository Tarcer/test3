"use client"

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/lib/supabase/database.types"

// Créer une seule instance globale du client Supabase
const supabaseClient = createClientComponentClient<Database>()

export { supabaseClient }
