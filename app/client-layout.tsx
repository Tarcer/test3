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

    // Ajouter une classe pour détecter le navigateur
    const userAgent = window.navigator.userAgent.toLowerCase()
    const html = document.documentElement

    if (/safari/.test(userAgent) && !/chrome/.test(userAgent)) {
      html.classList.add("safari")
    } else if (/firefox/.test(userAgent)) {
      html.classList.add("firefox")
    } else if (/edge/.test(userAgent)) {
      html.classList.add("edge")
    } else if (/chrome/.test(userAgent)) {
      html.classList.add("chrome")
    } else if (/trident/.test(userAgent) || /msie/.test(userAgent)) {
      html.classList.add("ie")
    }

    // Détecter les appareils iOS
    if (/iphone|ipad|ipod/.test(userAgent)) {
      html.classList.add("ios")
      // Ajouter une classe au body pour iOS
      document.body.classList.add("ios-device")
    }

    // Détecter les appareils Android
    if (/android/.test(userAgent)) {
      html.classList.add("android")
    }

    // Fonction pour mettre à jour la hauteur de la fenêtre visible (vh)
    const setVhProperty = () => {
      const vh = window.innerHeight * 0.01
      document.documentElement.style.setProperty("--vh", `${vh}px`)
    }

    // Initialiser et mettre à jour lors du redimensionnement
    setVhProperty()
    window.addEventListener("resize", setVhProperty)

    // Ajouter un gestionnaire pour éviter le pull-to-refresh sur iOS
    const preventPullToRefresh = (e) => {
      if (window.scrollY <= 0) {
        e.preventDefault()
      }
    }

    if (/iphone|ipad|ipod/.test(userAgent)) {
      document.addEventListener("touchmove", preventPullToRefresh, { passive: false })
    }

    return () => {
      window.removeEventListener("resize", setVhProperty)
      if (/iphone|ipad|ipod/.test(userAgent)) {
        document.removeEventListener("touchmove", preventPullToRefresh)
      }
    }
  }, [])

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <AuthProvider>
        <div className="flex min-h-screen flex-col overflow-x-hidden">
          <Header />
          <main className="flex-1" style={{ paddingTop: "56px" }}>
            {children}
          </main>
          <Footer />
          <Toaster />
        </div>
      </AuthProvider>
    </ThemeProvider>
  )
}
