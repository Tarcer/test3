import type React from "react"
import type { Metadata } from "next"
import AdminNav from "@/components/admin-nav"

export const metadata: Metadata = {
  title: "Administration | WebMarket Pro",
  description: "Panneau d'administration pour gérer les produits, utilisateurs et transactions",
}

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  // In a real app, we would check if the user is an admin here
  // const isAdmin = false
  // if (!isAdmin) {
  //   redirect("/login")
  // }

  return (
    <div className="container grid flex-1 gap-12 md:grid-cols-[200px_1fr] lg:grid-cols-[250px_1fr] py-8">
      <aside className="hidden w-[200px] flex-col md:flex lg:w-[250px]">
        <AdminNav />
      </aside>
      <main className="flex w-full flex-1 flex-col overflow-hidden">{children}</main>
    </div>
  )
}
