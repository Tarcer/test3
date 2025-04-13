import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import AccountSettingsClient from "./account-settings-client"

export const metadata: Metadata = {
  title: "Paramètres du compte",
  description: "Gérez vos paramètres et préférences de compte",
}

export default async function AccountSettingsPage() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/account/login")
  }

  const { data: user } = await supabase.from("users").select("*").eq("id", session.user.id).single()

  if (!user) {
    redirect("/account/login")
  }

  return <AccountSettingsClient user={user} />
}
