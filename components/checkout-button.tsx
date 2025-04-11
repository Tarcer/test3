"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"

interface CheckoutButtonProps {
  productId: string
  className?: string
}

export function CheckoutButton({ productId, className }: CheckoutButtonProps) {
  return (
    <Button asChild className={className}>
      <Link href={`/products/${productId}`}>Voir le produit</Link>
    </Button>
  )
}
