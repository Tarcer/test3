import type React from "react"
import type { Metadata } from "next"
import DashboardNav from "@/components/dashboard-nav"

export const metadata: Metadata = {
  title: "Tableau de bord | ViralAds",
  description: "Nous vous proposons une opportunité unique de développer votre propre boutique en ligne multi-plateformes (TikTok, eBay, Amazon) sans avoir à gérer les stocks ni l'expédition des produits.",
}

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  // In a real app, we would check if the user is authenticated here
  // const isAuthenticated = false
  // if (!isAuthenticated) {
  //   redirect("/login")
  // }

  return (
    <div className="container grid flex-1 gap-12 md:grid-cols-[200px_1fr] lg:grid-cols-[250px_1fr] py-8">
      <aside className="hidden w-[200px] flex-col md:flex lg:w-[250px]">
        <DashboardNav />
      </aside>
      <main className="flex w-full flex-1 flex-col overflow-hidden">{children}</main>
    </div>
  )
}
