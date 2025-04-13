"use client"

import { useAuth as useSupabaseAuth } from "@/lib/supabase/auth"

// Re-export the useAuth hook from our Supabase auth provider
export function useAuth() {
  return useSupabaseAuth()
}
