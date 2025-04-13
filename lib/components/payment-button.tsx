"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { Loader2, CreditCard } from "lucide-react"
import { useAuth } from "@/lib/supabase/auth"

interface PaymentButtonProps {
  productId: string
  productName: string
  productPrice: number
  successUrl: string
  cancelUrl: string
}

export default function PaymentButton({
  productId,
  productName,
  productPrice,
  successUrl,
  cancelUrl,
}: PaymentButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  const { user } = useAuth()

  const handlePayment = async () => {
    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Vous devez être connecté pour effectuer un achat",
        variant: "destructive",
      })
      router.push(`/account/login?redirectTo=${encodeURIComponent(window.location.pathname)}`)
      return
    }

    // Check if Coinbase API key is configured
    if (!process.env.NEXT_PUBLIC_COINBASE_COMMERCE_API_KEY) {
      toast({
        title: "Erreur de configuration",
        description: "Configuration Coinbase Commerce manquante. Vérifiez votre clé API.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/create-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId,
          productName,
          productPrice,
          successUrl,
          cancelUrl,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de la création du paiement")
      }

      // Rediriger vers la page de paiement Coinbase Commerce
      if (data.hostedUrl) {
        window.location.href = data.hostedUrl
      } else {
        throw new Error("URL de paiement manquante")
      }
    } catch (error: any) {
      console.error("Erreur de paiement:", error)
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors du traitement du paiement",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button onClick={handlePayment} disabled={isLoading} className="w-full">
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Traitement en cours...
        </>
      ) : (
        <>
          <CreditCard className="mr-2 h-4 w-4" />
          Payer par carte - {productPrice} €
        </>
      )}
    </Button>
  )
}
