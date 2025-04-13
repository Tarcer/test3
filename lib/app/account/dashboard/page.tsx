"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Package, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"
import { getRecentPurchases } from "@/lib/services/purchase-service"
import { formatCurrency, formatDate } from "@/lib/utils"
import BalanceSection from "./balance-section"

export default function AccountDashboardPage() {
  const [purchases, setPurchases] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Rediriger si l'utilisateur n'est pas connecté
    if (!user && !isLoading) {
      router.push("/account/login?redirectTo=/account/dashboard")
    }
  }, [user, isLoading, router])

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return

      setIsLoading(true)
      try {
        const purchasesResult = await getRecentPurchases(user.id, 3)
        if (purchasesResult.success && purchasesResult.data) {
          setPurchases(purchasesResult.data)
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des données:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [user])

  if (!user) {
    return (
      <div className="container py-8">
        <div className="flex justify-center">
          <p>Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Tableau de bord</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <BalanceSection />

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Achats récents
            </CardTitle>
            <CardDescription>Vos derniers produits achetés</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="flex justify-between border-b pb-4">
                    <div className="space-y-1">
                      <Skeleton className="h-5 w-40" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <Skeleton className="h-8 w-16" />
                  </div>
                ))}
              </div>
            ) : purchases.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-muted-foreground mb-4">Vous n'avez pas encore effectué d'achat.</p>
                <Button asChild>
                  <Link href="/products">Parcourir les produits</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {purchases.map((purchase) => (
                  <div key={purchase.id} className="flex justify-between border-b pb-4">
                    <div>
                      <p className="font-medium">{purchase.products?.name || "Produit"}</p>
                      <p className="text-sm text-muted-foreground">{formatDate(purchase.created_at)}</p>
                    </div>
                    <p className="font-medium">{formatCurrency(purchase.amount)}</p>
                  </div>
                ))}

                <div className="pt-2 text-center">
                  <Button variant="link" asChild>
                    <Link href="/dashboard/purchases">
                      Voir tous les achats <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
