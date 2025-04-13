"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"

export async function getUserByEmail(email: string) {
  const supabase = await createServerSupabaseClient()

  try {
    const { data, error } = await supabase.from("users").select("*").eq("email", email).single()

    if (error) {
      console.error("Error fetching user by email:", error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error: any) {
    console.error("Error in getUserByEmail:", error)
    return { success: false, error: error.message }
  }
}

export async function getUserById(userId: string) {
  const supabase = await createServerSupabaseClient()

  try {
    const { data, error } = await supabase.from("users").select("*").eq("id", userId).single()

    if (error) {
      console.error("Error fetching user by ID:", error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error: any) {
    console.error("Error in getUserById:", error)
    return { success: false, error: error.message }
  }
}
