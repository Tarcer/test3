"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/supabase/auth"
import { Skeleton } from "@/components/ui/skeleton"
import { useRouter } from "next/navigation"
import { RefreshCw } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

export default function EarningsSummary() {
  const [balance, setBalance] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [dailyEarnings, setDailyEarnings] = useState<any[]>([])
  const [todayEarnings, setTodayEarnings] = useState<number>(0)
  const [affiliateCommissions, setAffiliateCommissions] = useState<number>(0)
  const { user } = useAuth()
  const router = useRouter()
  const [totalCumulativeRevenue, setTotalCumulativeRevenue] = useState<number>(0)

  // Fonction pour récupérer les données avec retry
  const fetchWithRetry = async (url: string, retries = 3, delay = 1000) => {
    try {
      const response = await fetch(url)

      if (response.status === 429) {
        // Si nous atteignons la limite de taux et qu'il reste des tentatives
        if (retries > 0) {
          console.log(`Rate limited, retrying in ${delay}ms... (${retries} retries left)`)
          await new Promise((resolve) => setTimeout(resolve, delay))
          return fetchWithRetry(url, retries - 1, delay * 2) // Backoff exponentiel
        }
      }

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      if (retries > 0) {
        console.log(`Error fetching data, retrying in ${delay}ms... (${retries} retries left)`)
        await new Promise((resolve) => setTimeout(resolve, delay))
        return fetchWithRetry(url, retries - 1, delay * 2)
      }
      throw error
    }
  }

  // Modifier la fonction fetchData pour s'assurer qu'elle récupère bien tous les revenus cumulés
  const fetchData = useCallback(
    async (isRefresh = false) => {
      if (!user) return

      if (isRefresh) {
        setIsRefreshing(true)
      } else {
        setIsLoading(true)
      }

      try {
        console.log(`Récupération des données pour l'utilisateur ${user.id}, rafraîchissement: ${isRefresh}`)

        // Utiliser Promise.allSettled pour gérer les échecs partiels
        const [balanceResult, earningsResult, statsResult] = await Promise.allSettled([
          fetchWithRetry(`/api/user/balance?userId=${user.id}${isRefresh ? "&skipCache=true" : ""}`),
          fetchWithRetry(`/api/user/earnings?userId=${user.id}&period=week${isRefresh ? "&skipCache=true" : ""}`),
          // Ajouter un paramètre pour forcer la récupération de tous les revenus
          fetchWithRetry(
            `/api/user/dashboard-stats?userId=${user.id}${isRefresh ? "&skipCache=true" : ""}&includeTotal=true&allTime=true`,
          ),
        ])

        console.log("Résultats des requêtes:", {
          balanceStatus: balanceResult.status,
          earningsStatus: earningsResult.status,
          statsStatus: statsResult.status,
        })

        // Traiter les données de solde si disponibles
        if (balanceResult.status === "fulfilled" && balanceResult.value.success) {
          setBalance(balanceResult.value.data)
          console.log("Solde récupéré:", balanceResult.value.data)
        } else if (balanceResult.status === "rejected") {
          console.error("Failed to fetch balance:", balanceResult.reason)
        }

        // Traiter les données de revenus si disponibles
        if (earningsResult.status === "fulfilled" && earningsResult.value.success) {
          const data = earningsResult.value.data
          console.log("Données de revenus récupérées:", data)

          // Mettre à jour les revenus quotidiens pour le graphique
          if (data.earningsByDay) {
            setDailyEarnings(data.earningsByDay)
            console.log("Revenus quotidiens par jour:", data.earningsByDay)

            // Calculer les revenus d'aujourd'hui
            const today = new Date().toISOString().split("T")[0]
            const todayData = data.earningsByDay.find((item: any) => item.date === today)
            if (todayData) {
              setTodayEarnings(todayData.amount)
              console.log(`Revenus d'aujourd'hui (${today}):`, todayData.amount)
            } else {
              console.log(`Aucun revenu trouvé pour aujourd'hui (${today})`)
            }
          }
        } else if (earningsResult.status === "rejected") {
          console.error("Failed to fetch earnings:", earningsResult.reason)
        }

        // Récupérer les commissions d'affiliation depuis les stats
        if (statsResult.status === "fulfilled" && statsResult.value.success) {
          const statsData = statsResult.value.data
          console.log("Données de stats reçues:", statsData)

          if (statsData) {
            // IMPORTANT: Utiliser directement totalCumulative pour les revenus totaux
            if (typeof statsData.totalCumulative !== "undefined") {
              console.log("Total cumulatif des revenus depuis l'API:", statsData.totalCumulative)
              setTotalCumulativeRevenue(statsData.totalCumulative)
            } else if (
              typeof statsData.totalEarnings !== "undefined" &&
              typeof statsData.totalCommissions !== "undefined"
            ) {
              const calculatedTotal = statsData.totalEarnings + statsData.totalCommissions
              console.log("Total cumulatif calculé:", calculatedTotal)
              setTotalCumulativeRevenue(calculatedTotal)
            }

            // Mettre à jour les commissions d'affiliation
            if (typeof statsData.affiliateCommissions !== "undefined") {
              setAffiliateCommissions(statsData.affiliateCommissions)
            }
          }
        }
        // Récupérer spécifiquement les revenus d'aujourd'hui sans forcer la génération
        try {
          const today = new Date().toISOString().split("T")[0]
          console.log(`Récupération spécifique des revenus pour aujourd'hui (${today})`)

          const todayEarningsResult = await fetchWithRetry(
            `/api/user/daily-earnings?userId=${user.id}&date=${today}${isRefresh ? "&skipCache=true" : ""}`,
          )

          if (todayEarningsResult.success) {
            setTodayEarnings(todayEarningsResult.data || 0)
            console.log(`Revenus d'aujourd'hui récupérés:`, todayEarningsResult.data)
          } else {
            console.warn("Erreur lors de la récupération des revenus d'aujourd'hui:", todayEarningsResult.error)
          }
        } catch (error) {
          console.error("Error fetching today's earnings:", error)
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setIsLoading(false)
        setIsRefreshing(false)
      }
    },
    [user],
  )

  useEffect(() => {
    // Effet pour charger les données au montage
    fetchData()

    // Configurer un intervalle pour rafraîchir les données toutes les 1 minute
    const intervalId = setInterval(
      () => {
        fetchData(true)
      },
      1 * 60 * 1000,
    )

    return () => clearInterval(intervalId)
  }, [fetchData])

  // Écouteur d'événement pour les mises à jour de transactions
  useEffect(() => {
    const handleTransactionUpdate = (event: CustomEvent) => {
      if (user && event.detail.userId === user.id) {
        console.log("Transaction update detected in EarningsSummary, refreshing data")
        fetchData(true)
      }
    }

    // Ajouter l'écouteur d'événement
    window.addEventListener("transaction-update", handleTransactionUpdate as EventListener)

    // Nettoyer l'écouteur d'événement
    return () => {
      window.removeEventListener("transaction-update", handleTransactionUpdate as EventListener)
    }
  }, [fetchData, user])

  const handleRefresh = () => {
    fetchData(true)
  }

  // Modifier la fonction handleWithdrawalRequest pour qu'elle redirige simplement vers la page de retrait
  const handleWithdrawalRequest = () => {
    // Rediriger vers la page de retrait
    router.push("/dashboard/withdrawals")
  }

  // Fonction pour rendre le graphique des revenus quotidiens
  const renderEarningsChart = () => {
    if (dailyEarnings.length === 0) {
      return (
        <div className="flex h-full items-center justify-center">
          <p className="text-sm text-muted-foreground">Aucune donnée de revenus disponible</p>
        </div>
      )
    }

    // Créer un tableau des 7 derniers jours
    const last7Days = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateString = date.toISOString().split("T")[0]

      // Chercher si nous avons des données pour cette date
      const dayData = dailyEarnings.find((item) => item.date === dateString)

      last7Days.push({
        date: dateString,
        amount: dayData ? dayData.amount : 0,
      })
    }

    // Calculer la hauteur maximale pour le graphique
    const maxAmount = Math.max(...last7Days.map((item) => item.amount), 0.1) // Éviter division par zéro
    const scale = 200 / maxAmount // 200px est la hauteur maximale des barres

    return (
      <div className="flex h-full flex-col">
        <div className="flex justify-between items-center mb-4 px-4">
          <h3 className="text-sm font-medium">Revenus des 7 derniers jours</h3>
          <Button variant="ghost" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            <span className="sr-only">Rafraîchir</span>
          </Button>
        </div>
        <div className="flex-1 flex items-end justify-between px-2">
          {last7Days.map((item, index) => {
            const date = new Date(item.date)
            const isToday = new Date().toISOString().split("T")[0] === item.date
            const barHeight = Math.max(item.amount * scale, 4) // Hauteur minimale de 4px

            return (
              <div key={index} className="flex flex-col items-center">
                <div className="text-xs text-muted-foreground mb-1">{formatCurrency(item.amount)}</div>
                <div
                  className={`w-8 ${isToday ? "bg-primary" : "bg-primary/60"} rounded-t`}
                  style={{ height: `${barHeight}px` }}
                ></div>
                <div className="text-xs mt-1">
                  {date.getDate()}/{date.getMonth() + 1}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card className="col-span-1 md:col-span-2">
        <CardHeader>
          <CardTitle>Résumé des Revenus</CardTitle>
          <CardDescription>Vos revenus quotidiens et cumulés</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-[300px] w-full rounded-md border flex items-center justify-center">
              <Skeleton className="h-[250px] w-[90%]" />
            </div>
          ) : (
            <div className="h-[300px] w-full rounded-md border p-4">{renderEarningsChart()}</div>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Revenus Détaillés</CardTitle>
          <CardDescription>Revenus quotidiens et commissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="rounded-lg border p-4">
              <h3 className="font-medium">Revenus quotidiens</h3>
              {isLoading ? (
                <Skeleton className="h-6 w-24 mt-2" />
              ) : (
                <p className="mt-2 text-lg font-medium">{formatCurrency(todayEarnings)}</p>
              )}
            </div>

            <div className="rounded-lg border p-4">
              <h3 className="font-medium">Commissions d'affiliation</h3>
              {isLoading ? (
                <Skeleton className="h-6 w-24 mt-2" />
              ) : (
                <p className="mt-2 text-lg font-medium">{formatCurrency(affiliateCommissions)}</p>
              )}
            </div>

            <div className="rounded-lg border p-4 bg-primary/10">
              <h3 className="font-medium">Revenus Totaux</h3>
              {isLoading ? (
                <Skeleton className="h-8 w-24 mt-2" />
              ) : (
                <p className="mt-2 text-xl font-bold text-primary">{formatCurrency(totalCumulativeRevenue)}</p>
              )}
              <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                <span>Revenus quotidiens: {formatCurrency(todayEarnings)}</span>
                <span>Commissions: {formatCurrency(affiliateCommissions)}</span>
              </div>
            </div>

            <Button onClick={handleWithdrawalRequest} disabled={isLoading}>
              Demander un retrait
            </Button>
            <p className="text-xs text-muted-foreground">
              Note: Les retraits sont soumis à des frais de 10% et sont traités manuellement par l'administration.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
