import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import ClientLayout from "./client-layout"
import { Inter } from "next/font/google"

export const dynamic = "force-dynamic"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "ViralAds",
  description: "Nous vous proposons une opportunité unique de développer votre propre boutique en ligne multi-plateformes (TikTok, eBay, Amazon) sans avoir à gérer les stocks ni l'expédition des produits.",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={inter.className}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  )
}
export const metadata: Metadata = {
  title: "ViralAds | Achetez des sites web et gagnez des revenus",
  description: "Nous vous proposons une opportunité unique de développer votre propre boutique en ligne multi-plateformes (TikTok, eBay, Amazon) sans avoir à gérer les stocks ni l'expédition des produits.",
  generator: "v0.dev",
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-icon.png',
  },
 }
import './globals.css'