"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Wallet, RefreshCw } from "lucide-react"
import { useAuth } from "@/lib/supabase/auth"
import { Button } from "@/components/ui/button"

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
        // S'assurer que l'API ne fait que lire les données sans générer de revenus
        const response = await fetch(
          `/api/user/balance?userId=${userId}${force ? "&skipCache=true" : ""}&readOnly=true`,
        )

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

  const handleRefresh = async () => {
    if (!user || isRefreshing) return

    setIsRefreshing(true)
    try {
      // Récupérer le solde mis à jour
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
    <div className="flex items-center">
      {isLoading ? (
        <Skeleton className="h-6 w-16" />
      ) : (
        <div className="flex items-center gap-1">
          <Badge variant="outline" className="flex items-center gap-1 px-2 py-0.5 text-xs">
            <Wallet className="h-3 w-3" />
            <span>{balance !== null ? balance.toFixed(2) : "0.00"} €</span>
          </Badge>
          <Button variant="ghost" size="icon" className="h-6 w-6 p-0" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`h-3 w-3 ${isRefreshing ? "animate-spin" : ""}`} />
            <span className="sr-only">Rafraîchir</span>
          </Button>
        </div>
      )}
    </div>
  )
}
