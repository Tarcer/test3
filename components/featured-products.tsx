"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Eye } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { products } from "@/lib/products"

export default function FeaturedProducts() {
  const { toast } = useToast()
  const [featuredProducts, setFeaturedProducts] = useState(products.slice(0, 3))

  const handleAddToCart = (productId: string) => {
    toast({
      title: "Ajouté au panier",
      description: "Le site a été ajouté à votre panier",
    })
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {featuredProducts.map((product) => (
        <Card key={product.id} className="overflow-hidden">
          <div className="relative aspect-video overflow-hidden">
            <Image
              src={product.image || "/placeholder.svg"}
              alt={product.name}
              fill
              className="object-cover transition-transform hover:scale-105"
            />
          </div>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold">{product.name}</h3>
                <p className="text-sm text-muted-foreground">{product.category}</p>
              </div>
              <Badge variant="secondary">{product.price} €</Badge>
            </div>
            <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{product.description}</p>
            <div className="mt-2">
              <p className="text-sm font-medium text-primary">Revenu quotidien: {(product.price / 45).toFixed(2)} €</p>
            </div>
          </CardContent>
          <CardFooter className="flex items-center justify-between p-4 pt-0">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/products/${product.id}`}>
                <Eye className="mr-2 h-4 w-4" />
                Aperçu
              </Link>
            </Button>
            <Button size="sm" onClick={() => handleAddToCart(product.id)}>
              <ShoppingCart className="mr-2 h-4 w-4" />
              Ajouter au Panier
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
