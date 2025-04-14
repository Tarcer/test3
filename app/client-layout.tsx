"use client"

import type React from "react"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/lib/supabase/auth"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { Toaster } from "@/components/ui/toaster"
import "./globals.css"

// Add import for event initialization
import { initializeTransactionEvents } from "@/lib/events/transaction-events"
import { useEffect } from "react"

const inter = Inter({ subsets: ["latin"] })

// Modify RootLayout component to initialize events
export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Initialize event system
  useEffect(() => {
    initializeTransactionEvents()
  }, [])

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <AuthProvider>
        <div className="flex min-h-screen flex-col overflow-x-hidden">
          <Header />
          <main className="flex-1 pt-20 md:pt-16">{children}</main>
          <Footer />
          <Toaster />
        </div>
      </AuthProvider>
    </ThemeProvider>
  )
}
