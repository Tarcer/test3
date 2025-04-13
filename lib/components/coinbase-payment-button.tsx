"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

interface CoinbasePaymentButtonProps {
  productId: string
  productName: string
  price: number
  userId?: string
}

export function CoinbasePaymentButton({ productId, productName, price, userId }: CoinbasePaymentButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handlePayment = async () => {
    try {
      setIsLoading(true)

      const response = await fetch("/api/coinbase/create-charge", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId,
          productName,
          price,
          userId,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Erreur lors de la création du paiement")
      }

      const data = await response.json()

      // Rediriger vers la page de paiement Coinbase
      if (data.chargeUrl) {
        window.location.href = data.chargeUrl
      } else {
        throw new Error("URL de paiement manquante dans la réponse")
      }
    } catch (error) {
      console.error("Erreur de paiement:", error)
      alert("Une erreur est survenue lors de la préparation du paiement. Veuillez réessayer.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button onClick={handlePayment} disabled={isLoading} className="w-full">
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Préparation du paiement...
        </>
      ) : (
        "Payer maintenant"
      )}
    </Button>
  )
}
