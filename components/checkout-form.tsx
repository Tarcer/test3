"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useCart } from "@/lib/cart"
import { useAuth } from "@/lib/supabase/auth"
import type { CartItem } from "@/lib/cart"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Wallet, RefreshCw } from "lucide-react"

// Fonction utilitaire pour le délai
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

interface CheckoutFormProps {
  items: CartItem[]
  total: number
}

export default function CheckoutForm({ items, total }: CheckoutFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [userBalance, setUserBalance] = useState(0)
  const [isLoadingBalance, setIsLoadingBalance] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const { toast } = useToast()
  const { clearCart } = useCart()
  const { user } = useAuth()
  const router = useRouter()

  // Récupérer le solde de l'utilisateur
  const fetchBalance = useCallback(async () => {
    if (!user) return 0

    try {
      const response = await fetch(`/api/user/balance?userId=${user.id}`, {
        headers: { "Cache-Control": "no-cache" },
      })

      if (!response.ok) {
        console.error(`Erreur HTTP: ${response.status}`)
        return 0
      }

      // Récupérer le texte de la réponse
      const responseText = await response.text()

      // Essayer de parser le JSON
      try {
        const data = JSON.parse(responseText)
        if (data.success) {
          return Number(data.data) || 0
        }
      } catch (e) {
        console.error("Erreur de parsing JSON:", e)
      }

      return 0
    } catch (error) {
      console.error("Erreur lors de la récupération du solde:", error)
      return 0
    }
  }, [user])

  useEffect(() => {
    const getBalance = async () => {
      setIsLoadingBalance(true)
      try {
        const balance = await fetchBalance()
        setUserBalance(balance)
      } finally {
        setIsLoadingBalance(false)
      }
    }

    getBalance()
  }, [fetchBalance])

  const handleRefreshBalance = async () => {
    setIsRefreshing(true)
    try {
      const balance = await fetchBalance()
      setUserBalance(balance)
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleCheckout = async () => {
    if (!user) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour effectuer un paiement",
        variant: "destructive",
      })
      return
    }

    if (userBalance < total) {
      toast({
        title: "Solde insuffisant",
        description: "Votre solde est insuffisant pour effectuer cet achat. Veuillez déposer des fonds.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // Préparer les données pour l'API
      const purchaseItems = items.map((item) => ({
        productId: item.id,
        quantity: item.quantity,
        price: item.price,
      }))

      // Effectuer l'achat avec le solde du compte
      const response = await fetch("/api/checkout/process", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          items: purchaseItems,
          total,
        }),
      })

      // Gérer les erreurs HTTP
      if (!response.ok) {
        // Récupérer le texte de la réponse
        const responseText = await response.text()

        // Essayer de parser comme JSON si possible
        let errorMessage = `Erreur ${response.status}`
        try {
          const errorData = JSON.parse(responseText)
          if (errorData && errorData.error) {
            errorMessage = errorData.error
          }
        } catch (e) {
          // Si ce n'est pas du JSON, utiliser le texte brut
          if (responseText) {
            errorMessage = responseText.substring(0, 100) // Limiter la longueur
          }
        }

        throw new Error(errorMessage)
      }

      // Récupérer le texte de la réponse
      const responseText = await response.text()

      // Essayer de parser le JSON
      let data
      try {
        data = JSON.parse(responseText)
      } catch (e) {
        console.error("Erreur de parsing JSON:", e, "Réponse:", responseText)
        throw new Error("Réponse invalide du serveur")
      }

      if (!data.success) {
        throw new Error(data.error || "Une erreur est survenue lors du traitement de l'achat")
      }

      // Vider le panier
      clearCart()

      // Mettre à jour le solde local immédiatement pour une meilleure UX
      setUserBalance((prev) => prev - total)

      // Rafraîchir le solde depuis le serveur pour s'assurer qu'il est à jour
      await handleRefreshBalance()

      // Afficher un message de succès
      toast({
        title: "Achat réussi",
        description: data.warning || "Votre achat a été traité avec succès.",
      })

      // Rediriger vers la page de succès
      router.push("/payment/success")
    } catch (error: any) {
      console.error("Erreur lors du paiement:", error)
      toast({
        title: "Erreur de paiement",
        description: error.message || "Une erreur est survenue lors du paiement",
        variant: "destructive",
      })

      // Rafraîchir le solde après une erreur
      handleRefreshBalance()
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoadingBalance) {
    return <div>Chargement du solde...</div>
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Wallet className="mr-2 h-5 w-5 text-primary" />
            <span className="font-medium">Votre solde</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold">{userBalance.toFixed(2)} €</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={handleRefreshBalance}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
              <span className="sr-only">Rafraîchir</span>
            </Button>
          </div>
        </div>
      </div>

      {userBalance < total && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Solde insuffisant</AlertTitle>
          <AlertDescription>
            Votre solde actuel est insuffisant pour cet achat. Veuillez{" "}
            <Button variant="link" className="h-auto p-0" asChild>
              <a href="/dashboard/deposits">déposer des fonds</a>
            </Button>{" "}
            avant de continuer.
          </AlertDescription>
        </Alert>
      )}

      <Button
        onClick={handleCheckout}
        disabled={isLoading || items.length === 0 || userBalance < total}
        className="w-full"
        size="lg"
      >
        {isLoading ? "Traitement en cours..." : `Payer ${total.toFixed(2)} €`}
      </Button>
    </div>
  )
}
