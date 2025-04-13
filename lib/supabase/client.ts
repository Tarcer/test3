"use client"

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/lib/supabase/database.types"

// Create a single global instance of the Supabase client
const supabaseClient = createClientComponentClient<Database>()

export { supabaseClient }
