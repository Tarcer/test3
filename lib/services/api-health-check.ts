"use server"

/**
 * Fonction pour vérifier la santé des intégrations d'API externes
 */
export async function checkApiHealth() {
  const results = {
    coinbase: false,
    supabase: false,
    errors: [] as string[],
  }

  // Vérifier Coinbase
  try {
    const apiKey = process.env.COINBASE_COMMERCE_API_KEY
    if (!apiKey || apiKey.trim() === "") {
      throw new Error("Clé API Coinbase Commerce manquante")
    }

    // Faire une requête simple vers l'API Coinbase (sans créer de vraie charge)
    const response = await fetch("https://api.commerce.coinbase.com/charges", {
      method: "GET",
      headers: {
        "X-CC-Api-Key": apiKey,
        "X-CC-Version": "2018-03-22",
      },
    })

    if (response.ok) {
      results.coinbase = true
    } else {
      results.errors.push(`Coinbase API error: ${response.status} - ${response.statusText}`)
    }
  } catch (error: any) {
    results.errors.push(`Coinbase check failed: ${error.message}`)
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
