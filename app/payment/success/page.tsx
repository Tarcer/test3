"use client"

import { useEffect } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useCart } from "@/lib/cart"


export const dynamic = "force-dynamic"
// Événement personnalisé pour la mise à jour du solde
const BALANCE_UPDATE_EVENT = "balance-updated"

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams()
  const { clearCart } = useCart()

  useEffect(() => {
    // Vider le panier après un paiement réussi
    clearCart()

    // Déclencher une mise à jour du solde
    window.dispatchEvent(new Event(BALANCE_UPDATE_EVENT))
  }, [clearCart])

  return (
    <div className="container flex items-center justify-center py-12">
      <Card className="mx-auto max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center"></div>
          <CardTitle className="mt-4 text-2xl">Paiement réussi !</CardTitle>
          <CardDescription>Votre commande a été traitée avec succès.</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="mb-4">
            Merci pour votre achat. Vous pouvez accéder à vos produits achetés depuis votre tableau de bord.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center space-x-4">
          <Button asChild>
            <Link href="/dashboard/purchases">Voir mes achats</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/products">Continuer mes achats</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
