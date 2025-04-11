"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useCart } from "@/lib/cart"
import { useAuth } from "@/lib/supabase/auth"
import CheckoutForm from "@/components/checkout-form"
import OrderSummary from "@/components/order-summary"

export default function CheckoutPage() {
  const { items, getTotal } = useCart()
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const total = getTotal()

  useEffect(() => {
    // Rediriger vers le panier si le panier est vide
    if (!isLoading && items.length === 0) {
      router.push("/cart")
    }

    // Rediriger vers la connexion si l'utilisateur n'est pas connecté
    if (!isLoading && !user) {
      router.push("/account/login?redirect=/checkout")
    }
  }, [items.length, user, isLoading, router])

  // Afficher un état de chargement pendant la vérification
  if (isLoading || items.length === 0 || !user) {
    return (
      <div className="container py-8 md:py-12">
        <div className="flex justify-center">
          <p>Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8 md:py-12">
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Paiement</h1>
          <p className="mt-2 text-muted-foreground">Complétez votre commande</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Informations de paiement</CardTitle>
                <CardDescription>Choisissez votre méthode de paiement préférée</CardDescription>
              </CardHeader>
              <CardContent>
                <CheckoutForm items={items} total={total} />
              </CardContent>
            </Card>
          </div>
          <div>
            <OrderSummary items={items} total={total} />
          </div>
        </div>
      </div>
    </div>
  )
}
