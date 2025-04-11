import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import type { Database } from "./database.types"

export async function createServerSupabaseClient() {
  // This function can only be used in server components or server actions
  // Make sure this is only imported in server components or server actions
  const cookieStore = cookies()
  return createServerComponentClient<Database>({ cookies: () => cookieStore })
}

// Add a client-safe version for client components
export function getClientSupabaseClient() {
  // This is a placeholder - in actual implementation,
  // client components should use the singleton pattern from lib/supabase/client.ts
  throw new Error(
    "Cannot use createServerSupabaseClient in client components. Use supabaseClient from lib/supabase/client.ts instead.",
  )
}
