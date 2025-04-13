import { createServerSupabaseClient } from "@/lib/supabase/server"

export async function getSession() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()
  return session
}
