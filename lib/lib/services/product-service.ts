"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import type { Database } from "@/lib/supabase/database.types"

export type Product = Database["public"]["Tables"]["products"]["Row"]

export async function getProducts() {
  try {
    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching products:", error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error: any) {
    console.error("Error in getProducts:", error)
    return { success: false, error: error.message }
  }
}

export async function getProductById(id: string) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase.from("products").select("*").eq("id", id).single()

    if (error) {
      console.error("Error fetching product:", error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error: any) {
    console.error("Error in getProductById:", error)
    return { success: false, error: error.message }
  }
}

export async function getProductsByCategory(category: string) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("category", category)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching products by category:", error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error: any) {
    console.error("Error in getProductsByCategory:", error)
    return { success: false, error: error.message }
  }
}

export async function getFeaturedProducts(limit = 3) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .limit(limit)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching featured products:", error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error: any) {
    console.error("Error in getFeaturedProducts:", error)
    return { success: false, error: error.message }
  }
}
