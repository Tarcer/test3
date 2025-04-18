"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Menu, X, User, LogOut, Settings, LayoutDashboard, Wallet, CreditCard, Users } from "lucide-react"
import { useAuth } from "@/lib/supabase/auth"
import CartIndicator from "@/components/cart-indicator"
import UserBalanceDisplay from "@/components/user-balance-display"

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user, signOut } = useAuth()
  const pathname = usePathname()
  const [isMounted, setIsMounted] = useState(false)

  // Éviter les problèmes d'hydratation
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Fermer le menu mobile lors du changement de page
  useEffect(() => {
    setIsMenuOpen(false)
  }, [pathname])

  // Gérer le scroll sur iOS pour éviter les problèmes avec le header fixe
  useEffect(() => {
    const handleTouchMove = (e: TouchEvent) => {
      // Ne bloquer le défilement que dans des cas très spécifiques
      // Par exemple, uniquement sur le header lui-même, pas sur tout le document
      const target = e.target as HTMLElement
      const header = document.querySelector("header")

      // Ne bloquer que si on est en haut de la page ET que le toucher commence dans le header
      if (window.scrollY <= 0 && header && header.contains(target)) {
        // Empêcher uniquement le pull-to-refresh, pas tout le défilement
        e.preventDefault()
      }
    }

    // Ajouter l'écouteur uniquement sur le header, pas sur tout le document
    const header = document.querySelector("header")
    if (header) {
      header.addEventListener("touchmove", handleTouchMove, { passive: false })
    }

    return () => {
      if (header) {
        header.removeEventListener("touchmove", handleTouchMove)
      }
    }
  }, [])

  if (!isMounted) {
    // Rendu côté serveur ou pendant l'hydratation
    return (
      <header className="fixed left-0 right-0 z-50 w-full border-b bg-background shadow-sm top-0">
        <div className="container flex h-14 md:h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8"></div>
            <Link href="/" className="flex items-center">
              <span className="text-lg font-bold">ViralAds</span>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8"></div>
            <div className="w-8 h-8"></div>
          </div>
        </div>
      </header>
    )
  }

  // Modifier la classe du header pour améliorer l'affichage sur mobile
  // Remplacer la section du header par cette version optimisée pour mobile
  return (
    <header className="fixed left-0 right-0 z-50 w-full border-b bg-background shadow-sm" style={{ top: 0 }}>
      <div className="container flex h-14 md:h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden p-1 h-8 w-8"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
          >
            {isMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
          <Link href="/" className="flex items-center">
            <span className="text-lg font-bold">ViralAds</span>
          </Link>
        </div>

        {/* Navigation desktop */}
        <nav className="hidden md:flex md:gap-4 lg:gap-6">
          <Link href="/products" className="text-sm font-medium transition-colors hover:text-primary">
            Produits
          </Link>
          <Link href="/how-it-works" className="text-sm font-medium transition-colors hover:text-primary">
            Comment ça marche
          </Link>
          <Link href="/affiliate" className="text-sm font-medium transition-colors hover:text-primary">
            Programme d'affiliation
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          {/* Afficher UserBalanceDisplay uniquement sur desktop */}
          {user && (
            <div className="hidden md:block">
              <UserBalanceDisplay />
            </div>
          )}

          <CartIndicator />

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full">
                  <User className="h-4 w-4" />
                  <span className="sr-only">Menu utilisateur</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Mon compte</DropdownMenuLabel>
                {/* Afficher le solde dans le menu déroulant sur mobile */}
                {user && (
                  <div className="md:hidden px-2 py-1.5 text-sm">
                    <UserBalanceDisplay />
                  </div>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Tableau de bord
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/deposits">
                    <Wallet className="mr-2 h-4 w-4" />
                    Déposer des fonds
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/affiliate">
                    <Users className="mr-2 h-4 w-4" />
                    Programme d'affiliation
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/withdrawals">
                    <CreditCard className="mr-2 h-4 w-4" />
                    Retraits
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/transactions">
                    <CreditCard className="mr-2 h-4 w-4" />
                    Transactions
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/account/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    Paramètres
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut()}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Déconnexion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild variant="default" size="sm" className="h-8 px-3 py-1 text-xs">
              <Link href="/account/login">Connexion</Link>
            </Button>
          )}
        </div>
      </div>

      {/* Menu mobile */}
      {isMenuOpen && (
        <div className="container pb-4 md:hidden">
          <nav className="flex flex-col space-y-3">
            <Link
              href="/products"
              className="rounded-md px-2 py-1 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
              onClick={() => setIsMenuOpen(false)}
            >
              Produits
            </Link>
            <Link
              href="/how-it-works"
              className="rounded-md px-2 py-1 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
              onClick={() => setIsMenuOpen(false)}
            >
              Comment ça marche
            </Link>
            <Link
              href="/affiliate"
              className="rounded-md px-2 py-1 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
              onClick={() => setIsMenuOpen(false)}
            >
              Programme d'affiliation
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}
