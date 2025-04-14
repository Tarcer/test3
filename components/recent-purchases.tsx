"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, CheckCircle } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/lib/supabase/auth"
import { useToast } from "@/hooks/use-toast"

interface RecentPurchasesProps {
  productId: string
}

export default function RecentPurchases() {
  const [purchases, setPurchases] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuth()
  const { toast } = useToast()

  const fetchPurchases = useCallback(async () => {
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
        console.error("Erreur lors de la récupération des achats:", data.error)
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des achats:", error)
    } finally {
      setIsLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchPurchases()
  }, [fetchPurchases])

  // Écouteur d'événement pour les mises à jour de transactions
  useEffect(() => {
    const handleTransactionUpdate = (event: CustomEvent) => {
      if (user && event.detail.userId === user.id) {
        console.log("Transaction update detected in RecentPurchases, refreshing data")
        fetchPurchases()
      }
    }

    // Ajouter l'écouteur d'événement
    window.addEventListener("transaction-update", handleTransactionUpdate as EventListener)

    // Nettoyer l'écouteur d'événement
    return () => {
      window.removeEventListener("transaction-update", handleTransactionUpdate as EventListener)
    }
  }, [fetchPurchases, user])

  // Modifier la fonction handleValidate pour s'assurer que le bouton reste désactivé
  const handleValidate = async (purchaseId: string) => {
    try {
      setIsLoading(true)

      toast({
        title: "Validation en cours",
        description: "Veuillez patienter pendant la validation de l'achat...",
      })

      const response = await fetch("/api/validate-purchase", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ purchaseId }),
      })

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`)
      }

      const data = await response.json()

      if (data.success) {
        // Mettre à jour l'état local pour refléter la validation
        // Utiliser la date actuelle pour last_validated_at
        const now = new Date().toISOString()
        setPurchases((prevPurchases) =>
          prevPurchases.map((purchase) =>
            purchase.id === purchaseId ? { ...purchase, last_validated_at: now } : purchase,
          ),
        )

        toast({
          title: "Achat validé",
          description: "L'achat a été validé avec succès et les revenus quotidiens ont été générés.",
        })

        // Rafraîchir les données pour voir les changements
        setTimeout(() => {
          fetchPurchases()
        }, 1000)
      } else {
        throw new Error(data.error || "Erreur lors de la validation de l'achat")
      }
    } catch (error: any) {
      console.error("Erreur lors de la validation de l'achat:", error)
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la validation de l'achat",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Achats Récents</CardTitle>
        <CardDescription>Vos sites web achetés et leurs revenus</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {isLoading ? (
            <p>Chargement...</p>
          ) : purchases.length === 0 ? (
            <p className="text-center py-4 text-muted-foreground">Vous n'avez pas encore effectué d'achat.</p>
          ) : (
            purchases.map((purchase) => {
              // Calculer les revenus quotidiens (1/45 du prix d'achat)
              const dailyEarnings = purchase.amount / 45

              // Calculer les jours restants (45 jours à partir de la date d'achat)
              const purchaseDate = new Date(purchase.created_at)
              const endDate = new Date(purchaseDate)
              endDate.setDate(endDate.getDate() + 45)
              const now = new Date()
              const daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
              const isActive = daysRemaining > 0

              // Vérifier si l'achat a été validé dans les dernières 24 heures
              // Amélioration de la logique pour être plus robuste
              const lastValidatedAt = purchase.last_validated_at ? new Date(purchase.last_validated_at) : null
              const timeSinceLastValidation = lastValidatedAt
                ? now.getTime() - lastValidatedAt.getTime()
                : Number.POSITIVE_INFINITY
              const isValidated = lastValidatedAt && timeSinceLastValidation < 24 * 60 * 60 * 1000

              console.log(
                `Achat ${purchase.id} - Dernière validation: ${lastValidatedAt ? lastValidatedAt.toISOString() : "jamais"}`,
              )
              console.log(
                `Temps écoulé depuis la dernière validation: ${timeSinceLastValidation / (60 * 60 * 1000)} heures`,
              )
              console.log(`Bouton désactivé: ${isValidated}`)

              return (
                <div
                  key={purchase.id}
                  className="flex flex-col gap-2 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{purchase.products?.name || "Produit"}</h3>
                      <Badge variant={isActive ? "default" : "secondary"}>{isActive ? "Actif" : "Terminé"}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Acheté le {new Date(purchase.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 sm:text-right">
                    <p className="font-medium">{purchase.amount.toFixed(2)} €</p>
                    {isActive ? (
                      <>
                        <p className="text-sm text-primary">{dailyEarnings.toFixed(2)} € / jour</p>
                        <p className="text-xs text-muted-foreground">{daysRemaining} jours restants</p>
                      </>
                    ) : (
                      <p className="text-xs text-muted-foreground">Période de rémunération terminée</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/products/${purchase.products?.id || ""}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        Voir
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleValidate(purchase.id)}
                      disabled={isValidated}
                    >
                      {isValidated ? (
                        <>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Validé
                        </>
                      ) : (
                        "Valider"
                      )}
                    </Button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </CardContent>
    </Card>
  )
}
