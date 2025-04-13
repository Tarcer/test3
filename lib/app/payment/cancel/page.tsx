"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"

export default function PaymentCancelPage() {
  return (
    <div className="container flex items-center justify-center py-12">
      <Card className="mx-auto max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center">
            <AlertCircle className="h-16 w-16 text-amber-500" />
          </div>
          <CardTitle className="mt-4 text-2xl">Paiement annulé</CardTitle>
          <CardDescription>Votre paiement a été annulé et aucun montant n'a été débité.</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p>Vous pouvez retourner à votre panier pour finaliser votre commande ultérieurement.</p>
        </CardContent>
        <CardFooter className="flex justify-center space-x-4">
          <Button variant="outline" asChild>
            <Link href="/">Retour à l'accueil</Link>
          </Button>
          <Button asChild>
            <Link href="/cart">Retour au panier</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
