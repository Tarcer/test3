"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ShoppingCart } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useCart } from "@/lib/cart"

interface AddToCartButtonProps {
  productId: string
  productName: string
  productPrice: number
  productImage?: string
}

export default function AddToCartButton({
  productId,
  productName,
  productPrice,
  productImage = "/placeholder.svg?height=100&width=150",
}: AddToCartButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const { addItem } = useCart()

  const handleAddToCart = async () => {
    setIsLoading(true)

    try {
      // Ajouter au panier
      addItem({
        id: productId,
        name: productName,
        price: productPrice,
        image: productImage,
      })

      toast({
        title: "Ajouté au panier",
        description: `${productName} a été ajouté à votre panier`,
      })
    } catch (error) {
      console.error("Erreur lors de l'ajout au panier:", error)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'ajout au panier",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button onClick={handleAddToCart} disabled={isLoading} className="w-full sm:w-auto">
      <ShoppingCart className="mr-2 h-4 w-4" />
      {isLoading ? "Ajout en cours..." : "Ajouter au panier"}
    </Button>
  )
}
