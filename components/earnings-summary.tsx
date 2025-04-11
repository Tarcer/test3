"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/supabase/auth"
import { Skeleton } from "@/components/ui/skeleton"
import { useRouter } from "next/navigation"
import { RefreshCw } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

export default function EarningsSummary() {
  const [balance, setBalance] = useState<number | null>(null)
  const [nextWithdrawalDate, setNextWithdrawalDate] = useState<string | null>(null)
  const [daysUntilWithdrawal, setDaysUntilWithdrawal] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [dailyEarnings, setDailyEarnings] = useState<any[]>([])
  const [todayEarnings, setTodayEarnings] = useState<number>(0)
  const { toast } = useToast()
  const { user } = useAuth()
  const router = useRouter()

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

  // Améliorons la récupération et l'affichage des données dans le résumé des revenus
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
        const [balanceResult, withdrawalDaysResult, earningsResult] = await Promise.allSettled([
          fetchWithRetry(`/api/user/balance?userId=${user.id}${isRefresh ? "&skipCache=true" : ""}`),
          fetchWithRetry(`/api/withdrawal-days`),
          fetchWithRetry(`/api/user/earnings?userId=${user.id}&period=week${isRefresh ? "&skipCache=true" : ""}`),
        ])

        console.log("Résultats des requêtes:", {
          balanceStatus: balanceResult.status,
          withdrawalDaysStatus: withdrawalDaysResult.status,
          earningsStatus: earningsResult.status,
        })

        // Traiter les données de solde si disponibles
        if (balanceResult.status === "fulfilled" && balanceResult.value.success) {
          setBalance(balanceResult.value.data)
          console.log("Solde récupéré:", balanceResult.value.data)
        } else if (balanceResult.status === "rejected") {
          console.error("Failed to fetch balance:", balanceResult.reason)
        }

        // Traiter les jours de retrait si disponibles
        if (withdrawalDaysResult.status === "fulfilled" && withdrawalDaysResult.value.success) {
          const withdrawalDays = withdrawalDaysResult.value.data.sort((a: number, b: number) => a - b)
          console.log("Jours de retrait récupérés:", withdrawalDays)

          // Calculer la prochaine date de retrait
          const today = new Date()
          const currentDay = today.getDate()

          let nextDay = withdrawalDays.find((day: number) => day > currentDay)

          if (!nextDay) {
            // Si aucun jour n'est trouvé ce mois-ci, utiliser le premier jour du mois prochain
            nextDay = withdrawalDays[0]
            const nextMonth = today.getMonth() + 1
            const nextYear = nextMonth > 11 ? today.getFullYear() + 1 : today.getFullYear()
            const nextDate = new Date(nextYear, nextMonth % 12, nextDay)
            setNextWithdrawalDate(nextDate.toLocaleDateString())

            // Calculer le nombre de jours jusqu'au prochain retrait
            const diffTime = nextDate.getTime() - today.getTime()
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
            setDaysUntilWithdrawal(diffDays)

            console.log(`Prochain jour de retrait: ${nextDate.toLocaleDateString()}, dans ${diffDays} jours`)
          } else {
            // Le prochain jour est ce mois-ci
            const nextDate = new Date(today.getFullYear(), today.getMonth(), nextDay)
            setNextWithdrawalDate(nextDate.toLocaleDateString())

            // Calculer le nombre de jours jusqu'au prochain retrait
            const diffDays = nextDay - currentDay
            setDaysUntilWithdrawal(diffDays)

            console.log(`Prochain jour de retrait: ${nextDate.toLocaleDateString()}, dans ${diffDays} jours`)
          }
        } else if (withdrawalDaysResult.status === "rejected") {
          console.error("Failed to fetch withdrawal days:", withdrawalDaysResult.reason)
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

        // Récupérer spécifiquement les revenus d'aujourd'hui
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

  // Effet pour charger les données au montage
  useEffect(() => {
    fetchData()

    // Configurer un intervalle pour rafraîchir les données toutes les 5 minutes
    const intervalId = setInterval(
      () => {
        fetchData(true)
      },
      5 * 60 * 1000,
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

  const handleWithdrawalRequest = () => {
    if (daysUntilWithdrawal && daysUntilWithdrawal > 0) {
      toast({
        title: "Demande de retrait",
        description: `Les retraits ne sont pas disponibles aujourd'hui. Prochain jour de retrait: ${nextWithdrawalDate}`,
        variant: "destructive",
      })
    } else {
      // Rediriger vers la page de retrait
      router.push("/dashboard/withdrawals")
    }
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
          <CardTitle>Solde Disponible</CardTitle>
          <CardDescription>Montant disponible pour retrait</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="rounded-lg border p-4">
              <h3 className="font-medium">Solde actuel</h3>
              {isLoading ? (
                <Skeleton className="h-8 w-24 mt-2" />
              ) : (
                <p className="mt-2 text-2xl font-bold">{formatCurrency(balance || 0)}</p>
              )}
            </div>

            <div className="rounded-lg border p-4">
              <h3 className="font-medium">Revenus aujourd'hui</h3>
              {isLoading ? (
                <Skeleton className="h-6 w-24 mt-2" />
              ) : (
                <p className="mt-2 text-lg font-medium text-primary">{formatCurrency(todayEarnings)}</p>
              )}
            </div>

            <div className="rounded-lg border p-4">
              <h3 className="font-medium">Prochain jour de retrait</h3>
              {isLoading ? (
                <Skeleton className="h-6 w-32 mt-2" />
              ) : (
                <>
                  <p className="mt-2 text-lg">{nextWithdrawalDate || "Aujourd'hui"}</p>
                  {daysUntilWithdrawal !== null && (
                    <p className="text-sm text-muted-foreground">
                      {daysUntilWithdrawal > 0
                        ? `Dans ${daysUntilWithdrawal} jour${daysUntilWithdrawal > 1 ? "s" : ""}`
                        : "Disponible aujourd'hui"}
                    </p>
                  )}
                </>
              )}
            </div>

            <Button onClick={handleWithdrawalRequest} disabled={isLoading}>
              Demander un retrait
            </Button>
            <p className="text-xs text-muted-foreground">
              Note: Les retraits sont soumis à des frais de 10% et ne sont disponibles qu'aux jours spécifiés par
              l'administration.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
