"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/supabase/auth"
import { Loader2 } from "lucide-react"

export default function InitializeEarningsButton() {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const { user } = useAuth()

  const handleInitializeEarnings = async () => {
    if (!user) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour initialiser vos revenus",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/user/initialize-earnings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: user.id }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Une erreur est survenue")
      }

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Revenus initialisés",
          description: `${data.data.earningsCount} revenus ont été générés avec succès pour ${data.data.purchasesCount} achats.`,
        })

        // Déclencher un événement pour rafraîchir les données
        window.dispatchEvent(
          new CustomEvent("transaction-update", {
            detail: { userId: user.id },
          }),
        )
      } else {
        throw new Error(data.error || "Une erreur est survenue")
      }
    } catch (error: any) {
      console.error("Erreur lors de l'initialisation des revenus:", error)
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de l'initialisation des revenus",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button onClick={handleInitializeEarnings} disabled={isLoading}>
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Initialisation en cours...
        </>
      ) : (
        "Initialiser mes revenus"
      )}
    </Button>
  )
}
