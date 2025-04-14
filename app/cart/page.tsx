import type { Metadata } from "next"
import CartItems from "@/components/cart-items"
import CartSummary from "@/components/cart-summary"

export const metadata: Metadata = {
  title: "Panier |  ViralAds",
  description: "Consultez et gérez les articles dans votre panier",
}

export default function CartPage() {
  return (
    <div className="container py-8 md:py-12">
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Panier</h1>
          <p className="mt-2 text-muted-foreground">Consultez et validez vos produits sélectionnés</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <CartItems />
          </div>
          <div>
            <CartSummary />
          </div>
        </div>
      </div>
    </div>
  )
}
