"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Wallet, ArrowUpRight, Clock, AlertCircle, RefreshCw } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"
import { getUserBalance } from "@/lib/services/earnings-service"
import { formatCurrency } from "@/lib/utils"

// Cache pour le solde utilisateur avec une durée plus courte
let balanceCache: { userId: string; balance: any; timestamp: number } | null = null
const CACHE_DURATION = 10000 // 10 secondes en millisecondes (réduit pour des mises à jour plus fréquentes)

export default function BalanceSection() {
  const [balance, setBalance] = useState<{
    available: number
    deposits: number
    purchases: number
  } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  const fetchBalance = useCallback(
    async (forceRefresh = false) => {
      if (!user) return

      // Vérifier si nous avons un cache valide pour cet utilisateur et si nous ne forçons pas le rafraîchissement
      if (
        !forceRefresh &&
        balanceCache &&
        balanceCache.userId === user.id &&
        Date.now() - balanceCache.timestamp < CACHE_DURATION
      ) {
        setBalance(balanceCache.balance)
        setError(null)
        setIsLoading(false)
        return
      }

      try {
        setError(null)
        if (forceRefresh) {
          setIsRefreshing(true)
        } else {
          setIsLoading(true)
        }

        console.log("Fetching balance for dashboard section:", user.id)
        const result = await getUserBalance(user.id)

        if (result.success && result.data) {
          console.log("Balance data fetched successfully:", result.data)
          setBalance(result.data)

          // Mettre à jour le cache
          balanceCache = {
            userId: user.id,
            balance: result.data,
            timestamp: Date.now(),
          }
        } else {
          console.error("Error in balance result:", result.error)
          setError(result.error || "Erreur lors de la récupération du solde")
        }
      } catch (error: any) {
        console.error("Error fetching balance:", error)
        setError(error.message || "Erreur de connexion")
      } finally {
        setIsLoading(false)
        setIsRefreshing(false)
      }
    },
    [user],
  )

  const handleRefresh = useCallback(async () => {
    await fetchBalance(true)
  }, [fetchBalance])

  useEffect(() => {
    fetchBalance()

    // Rafraîchir le solde toutes les 30 secondes
    const intervalId = setInterval(() => fetchBalance(true), 30000)

    return () => clearInterval(intervalId)
  }, [fetchBalance])

  if (isLoading && !isRefreshing) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Solde du compte
          </CardTitle>
          <CardDescription>Gérez votre solde et vos transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-12 w-40" />
            <div className="flex justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Solde du compte
          </CardTitle>
          <CardDescription>Gérez votre solde et vos transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <AlertCircle className="h-10 w-10 text-amber-500 mb-2" />
            <p className="mb-4 text-muted-foreground">{error}</p>
            <Button onClick={handleRefresh} variant="outline" size="sm" disabled={isRefreshing}>
              {isRefreshing ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Rafraîchissement...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Réessayer
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Solde du compte
          </CardTitle>
          <CardDescription>Gérez votre solde et vos transactions</CardDescription>
        </div>
        <Button variant="ghost" size="icon" onClick={handleRefresh} disabled={isRefreshing} className="h-8 w-8">
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          <span className="sr-only">Rafraîchir</span>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Solde disponible</p>
            <p className="text-3xl font-bold">{formatCurrency(balance?.available || 0)}</p>
            {isRefreshing && <p className="text-xs text-muted-foreground mt-1">Mise à jour en cours...</p>}
          </div>

          <div className="flex justify-between text-sm">
            <div>
              <p className="text-muted-foreground">Total déposé</p>
              <p className="font-medium">{formatCurrency(balance?.deposits || 0)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Total dépensé</p>
              <p className="font-medium">{formatCurrency(balance?.purchases || 0)}</p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button asChild className="flex-1">
              <Link href="/dashboard/deposits">
                <ArrowUpRight className="mr-2 h-4 w-4" />
                Déposer des fonds
              </Link>
            </Button>
            <Button variant="outline" asChild className="flex-1">
              <Link href="/dashboard/transactions">
                <Clock className="mr-2 h-4 w-4" />
                Historique
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
