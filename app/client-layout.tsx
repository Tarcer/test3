"use client"

import type React from "react"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/lib/supabase/auth"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { Toaster } from "@/components/ui/toaster"
import "./globals.css"

// Ajouter l'import pour l'initialisation des événements
import { initializeTransactionEvents } from "@/lib/events/transaction-events"
import { useEffect } from "react"

const inter = Inter({ subsets: ["latin"] })

// Modifier le composant RootLayout pour initialiser les événements
export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Initialiser le système d'événements
  useEffect(() => {
    initializeTransactionEvents()
  }, [])

  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <div className="flex min-h-screen flex-col">
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
              <Toaster />
            </div>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
