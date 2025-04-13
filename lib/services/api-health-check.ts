"use server"

/**
 * Fonction pour vérifier la santé des intégrations d'API externes
 */
export async function checkApiHealth() {
  const results = {
    supabase: false,
    errors: [] as string[],
  }

  // Vérifier Supabase
  try {
    const { createServerSupabaseClient } = await import("@/lib/supabase/server")
    const supabase = await createServerSupabaseClient()

    // Faire une requête simple pour vérifier la connexion
    const { data, error } = await supabase.from("system_settings").select("count(*)")

    if (!error) {
      results.supabase = true
    } else {
      results.errors.push(`Supabase error: ${error.message}`)
    }
  } catch (error: any) {
    results.errors.push(`Supabase check failed: ${error.message}`)
  }

  return results
}
