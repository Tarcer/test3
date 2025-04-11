"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Wallet, RefreshCw } from "lucide-react"
import { useAuth } from "@/lib/supabase/auth"
import { Button } from "@/components/ui/button"
// Ajouter l'import pour le bouton de synchronisation
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Cache global pour le solde avec un TTL plus court pour les mises à jour fréquentes
const balanceCache = new Map<string, { balance: number; timestamp: number }>()
const CACHE_TTL = 15000 // 15 secondes (réduit pour des mises à jour plus fréquentes)

// Événement personnalisé pour la mise à jour du solde
const BALANCE_UPDATE_EVENT = "balance-updated"

export default function UserBalanceDisplay() {
  const [balance, setBalance] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const { user } = useAuth()
  const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastFetchTimeRef = useRef<number>(0)

  // Fonction pour récupérer le solde avec throttling
  const fetchBalance = useCallback(
    async (force = false) => {
      if (!user) return null

      const now = Date.now()
      const userId = user.id

      // Vérifier le cache si ce n'est pas un rafraîchissement forcé
      if (!force) {
        const cached = balanceCache.get(userId)
        if (cached && now - cached.timestamp < CACHE_TTL) {
          return cached.balance
        }
      }

      // Limiter les requêtes à une toutes les 2 secondes
      if (!force && now - lastFetchTimeRef.current < 2000) {
        return balance
      }

      lastFetchTimeRef.current = now

      try {
        const response = await fetch(`/api/user/balance?userId=${userId}${force ? "&skipCache=true" : ""}`)

        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`)
        }

        const data = await response.json()

        if (data.success) {
          const newBalance = Number(data.data) || 0

          // Mettre à jour le cache
          balanceCache.set(userId, {
            balance: newBalance,
            timestamp: now,
          })

          return newBalance
        }

        return null
      } catch (error) {
        console.error("Error fetching balance:", error)
        return null
      }
    },
    [user, balance],
  )

  // Écouteur d'événement pour les mises à jour de solde
  useEffect(() => {
    const handleBalanceUpdate = () => {
      if (user) {
        fetchBalance(true)
          .then((newBalance) => {
            if (newBalance !== null) {
              setBalance(newBalance)
            }
          })
          .catch(console.error)
      }
    }

    // Ajouter l'écouteur d'événement
    window.addEventListener(BALANCE_UPDATE_EVENT, handleBalanceUpdate)

    // Nettoyer l'écouteur d'événement
    return () => {
      window.removeEventListener(BALANCE_UPDATE_EVENT, handleBalanceUpdate)
    }
  }, [fetchBalance, user])

  // Dans useEffect, ajouter un écouteur d'événements pour les mises à jour de transactions

  // Écouteur d'événement pour les mises à jour de transactions
  useEffect(() => {
    const handleTransactionUpdate = (event: CustomEvent) => {
      if (user && event.detail.userId === user.id) {
        console.log("Transaction update detected, refreshing balance")
        fetchBalance(true)
          .then((newBalance) => {
            if (newBalance !== null) {
              setBalance(newBalance)
            }
          })
          .catch(console.error)
      }
    }

    // Ajouter l'écouteur d'événement
    window.addEventListener("transaction-update", handleTransactionUpdate as EventListener)

    // Nettoyer l'écouteur d'événement
    return () => {
      window.removeEventListener("transaction-update", handleTransactionUpdate as EventListener)
    }
  }, [fetchBalance, user])

  useEffect(() => {
    if (!user) {
      setIsLoading(false)
      return
    }

    let isMounted = true

    const getBalance = async () => {
      try {
        // Vérifier d'abord le cache
        const cached = balanceCache.get(user.id)
        if (cached) {
          setBalance(cached.balance)
          setIsLoading(false)

          // Si le cache est récent, ne pas refaire de requête immédiatement
          if (Date.now() - cached.timestamp < CACHE_TTL) {
            return
          }
        }

        const result = await fetchBalance()
        if (isMounted && result !== null) {
          setBalance(result)
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    getBalance()

    // Configurer un intervalle pour rafraîchir le solde périodiquement
    // mais avec une fréquence réduite (toutes les 15 secondes)
    fetchTimeoutRef.current = setInterval(() => {
      fetchBalance()
        .then((newBalance) => {
          if (isMounted && newBalance !== null) {
            setBalance(newBalance)
          }
        })
        .catch((error) => console.error("Error in balance refresh:", error))
    }, 15000)

    return () => {
      isMounted = false
      if (fetchTimeoutRef.current) {
        clearInterval(fetchTimeoutRef.current)
      }
    }
  }, [user, fetchBalance])

  // Modifier la fonction handleRefresh pour inclure la synchronisation
  const handleRefresh = async () => {
    if (!user || isRefreshing) return

    setIsRefreshing(true)
    try {
      // Synchroniser le solde via l'API
      const syncResponse = await fetch("/api/user/sync-balance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: user.id }),
      })

      if (syncResponse.ok) {
        console.log("Balance synchronized successfully")
      }

      // Ensuite, récupérer le solde mis à jour
      const result = await fetchBalance(true)
      if (result !== null) {
        setBalance(result)
      }
    } catch (error) {
      console.error("Error during balance refresh:", error)
    } finally {
      setIsRefreshing(false)
    }
  }

  if (!user) return null

  return (
    <div className="flex items-center mr-2">
      {isLoading ? (
        <Skeleton className="h-8 w-24" />
      ) : (
        <div className="flex items-center gap-1">
          <Badge variant="outline" className="flex items-center gap-1 px-3 py-1.5">
            <Wallet className="h-3.5 w-3.5" />
            <span>{balance !== null ? balance.toFixed(2) : "0.00"} €</span>
          </Badge>
          {/* Modifier le rendu du bouton de rafraîchissement pour inclure une infobulle */}
          {/* Remplacer le bouton existant par: */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 p-0"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
                  <span className="sr-only">Rafraîchir et synchroniser</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Rafraîchir et synchroniser le solde</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}
    </div>
  )
}
