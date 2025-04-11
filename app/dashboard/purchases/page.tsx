"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/lib/supabase/auth"
import { formatCurrency, formatDate } from "@/lib/utils"

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Rediriger si l'utilisateur n'est pas connecté
    if (!user && !isLoading) {
      router.push("/account/login?redirectTo=/dashboard/purchases")
    }
  }, [user, isLoading, router])

  useEffect(() => {
    const fetchPurchases = async () => {
      if (!user) return

      setIsLoading(true)
      try {
        const response = await fetch(`/api/user/purchases?userId=${user.id}`)

        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`)
        }

        const data = await response.json()

        if (data.success) {
          setPurchases(data.data || [])
        } else {
          throw new Error(data.error || "Erreur lors de la récupération des achats")
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des achats:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPurchases()
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
      <h1 className="text-3xl font-bold mb-6">Mes achats</h1>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-24 mt-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4 mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : purchases.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <AlertCircle className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="text-xl font-semibold">Aucun achat trouvé</h3>
            <p className="mt-2 text-center text-muted-foreground">
              Vous n'avez pas encore effectué d'achat. Parcourez notre catalogue pour trouver des produits qui vous
              intéressent.
            </p>
            <Button asChild className="mt-6">
              <Link href="/products">Voir les produits</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {purchases.map((purchase) => (
            <Card key={purchase.id}>
              <CardHeader>
                <CardTitle>{purchase.products?.name || "Produit"}</CardTitle>
                <CardDescription>Acheté le {formatDate(purchase.created_at)}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-2 font-medium">Prix: {formatCurrency(purchase.amount)}</p>
                <p className="mb-4 text-sm text-muted-foreground">
                  Catégorie: {purchase.products?.category || "Non spécifiée"}
                </p>
                {purchase.products?.demo_url && (
                  <Button variant="outline" size="sm" asChild className="w-full">
                    <a href={purchase.products.demo_url} target="_blank" rel="noopener noreferrer">
                      Accéder au produit
                    </a>
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
