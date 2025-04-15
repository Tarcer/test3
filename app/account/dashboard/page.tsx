"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { LineChart, BarChart, PieChart, ShoppingBag, RefreshCw } from "lucide-react"
import Link from "next/link"
import RecentPurchases from "@/components/recent-purchases"
import EarningsSummary from "@/components/earnings-summary"
import { useAuth } from "@/lib/supabase/auth"
import { Skeleton } from "@/components/ui/skeleton"
import { formatCurrency } from "@/lib/utils"

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const { user } = useAuth()
  const [totalCumulativeRevenue, setTotalCumulativeRevenue] = useState<number>(0)

  // Modifier la fonction fetchStats pour s'assurer que totalCumulativeRevenue est correctement calculé
  const fetchStats = useCallback(
    async (isRefresh = false) => {
      if (!user) return

      if (isRefresh) {
        setIsRefreshing(true)
      } else {
        setIsLoading(true)
      }

      try {
        // Add a small delay before fetching to stagger API calls
        await new Promise((resolve) => setTimeout(resolve, 100))

        // Récupérer les statistiques du tableau de bord
        console.log(`Récupération des statistiques du tableau de bord pour l'utilisateur ${user.id}...`)
        const statsResponse = await fetch(
          `/api/user/dashboard-stats?userId=${user.id}${isRefresh ? "&skipCache=true" : ""}`,
        )

        if (!statsResponse.ok) {
          console.error(`Erreur HTTP stats: ${statsResponse.status}, ${await statsResponse.text()}`)
          throw new Error(`Erreur HTTP stats: ${statsResponse.status}`)
        }

        const statsData = await statsResponse.json()
        console.log("Données de statistiques reçues:", statsData)

        if (statsData.success) {
          // Stocker les statistiques de base
          const baseStats = statsData.data

          // Utiliser directement totalCumulative s'il est disponible, sinon calculer
          if (baseStats.totalCumulative !== undefined) {
            setTotalCumulativeRevenue(baseStats.totalCumulative)
            console.log("Total cumulative revenue from API:", baseStats.totalCumulative)
          } else if (baseStats.totalEarnings !== undefined && baseStats.totalCommissions !== undefined) {
            setTotalCumulativeRevenue(baseStats.totalEarnings + baseStats.totalCommissions)
            console.log("Total cumulative revenue calculated:", baseStats.totalEarnings + baseStats.totalCommissions)
          }

          // Récupérer spécifiquement les revenus quotidiens sans forcer la génération
          const today = new Date().toISOString().split("T")[0]
          console.log(`Récupération des revenus quotidiens pour ${today}...`)
          const earningsResponse = await fetch(
            `/api/user/daily-earnings?userId=${user.id}&date=${today}${isRefresh ? "&skipCache=true" : ""}`,
          )

          if (!earningsResponse.ok) {
            console.error(`Erreur HTTP revenus: ${earningsResponse.status}, ${await earningsResponse.text()}`)
          }

          if (earningsResponse.ok) {
            const earningsData = await earningsResponse.json()
            console.log("Données de revenus quotidiens reçues:", earningsData)

            if (earningsData.success) {
              // Mettre à jour les stats avec les revenus quotidiens
              const updatedStats = {
                ...baseStats,
                dailyEarnings: earningsData.data || 0,
              }
              console.log("Stats mises à jour avec les revenus quotidiens:", updatedStats)
              setStats(updatedStats)
            } else {
              // Si l'API des revenus échoue, utiliser quand même les stats de base
              console.warn("Erreur dans les données de revenus, utilisation des stats de base:", earningsData.error)
              setStats(baseStats)
            }
          } else {
            // Si la requête échoue, utiliser quand même les stats de base
            console.warn(`Erreur HTTP revenus: ${earningsResponse.status}, utilisation des stats de base`)
            setStats(baseStats)
          }
        } else {
          console.error("Erreur lors de la récupération des statistiques:", statsData.error)
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des données:", error)
      } finally {
        setIsLoading(false)
        setIsRefreshing(false)
      }
    },
    [user],
  )

  useEffect(() => {
    fetchStats()

    // Configurer un intervalle pour rafraîchir les données toutes les 1 minute (au lieu de 5)
    const intervalId = setInterval(
      () => {
        fetchStats(true)
      },
      1 * 60 * 1000,
    )

    return () => clearInterval(intervalId)
  }, [fetchStats])

  // Écouteur d'événement pour les mises à jour de transactions
  useEffect(() => {
    const handleTransactionUpdate = (event: CustomEvent) => {
      if (user && event.detail.userId === user.id) {
        console.log("Transaction update detected in Dashboard, refreshing stats")
        fetchStats(true)
      }
    }

    // Ajouter l'écouteur d'événement
    window.addEventListener("transaction-update", handleTransactionUpdate as EventListener)

    // Nettoyer l'écouteur d'événement
    return () => {
      window.removeEventListener("transaction-update", handleTransactionUpdate as EventListener)
    }
  }, [fetchStats, user])

  const handleRefresh = () => {
    fetchStats(true)
  }

  // Calculer le total des revenus (revenus quotidiens + commissions d'affiliation)
  const totalRevenue = stats ? (stats.dailyEarnings || 0) + (stats.affiliateCommissions || 0) : 0

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Tableau de bord</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={handleRefresh} disabled={isRefreshing} className="mr-2">
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            <span className="sr-only">Rafraîchir</span>
          </Button>
          <Button asChild>
            <Link href="/products">Acheter un site</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenus Totaux</CardTitle>
            <LineChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">{formatCurrency(totalCumulativeRevenue)}</div>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenus Quotidiens</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">{formatCurrency(stats?.dailyEarnings || 0)}</div>
                <p className="text-xs text-muted-foreground">Aujourd'hui</p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sites Achetés</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.purchasesCount || 0}</div>
                <p className="text-xs text-muted-foreground">Total des achats</p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Commissions d'Affiliation</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">{formatCurrency(stats?.affiliateCommissions || 0)}</div>
                <p className="text-xs text-muted-foreground">Total des commissions</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="earnings" className="space-y-4">
        <TabsList>
          <TabsTrigger value="earnings">Revenus</TabsTrigger>
          <TabsTrigger value="purchases">Achats Récents</TabsTrigger>
        </TabsList>
        <TabsContent value="earnings" className="space-y-4">
          <EarningsSummary />
        </TabsContent>
        <TabsContent value="purchases" className="space-y-4">
          <RecentPurchases />
        </TabsContent>
      </Tabs>
    </div>
  )
}
