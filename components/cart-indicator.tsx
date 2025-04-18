"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ShoppingCart } from "lucide-react"
import { useCart } from "@/lib/cart"

export default function CartIndicator() {
  const { getItemCount } = useCart()
  const itemCount = getItemCount()

  return (
    <Button variant="ghost" size="icon" asChild className="relative h-8 w-8">
      <Link href="/cart">
        <ShoppingCart className="h-4 w-4" />
        {itemCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
            {itemCount}
          </span>
        )}
        <span className="sr-only">Panier</span>
      </Link>
    </Button>
  )
}

