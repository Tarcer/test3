"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Eye } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"
import { supabaseClient } from "@/lib/supabase/client"

export default function FeaturedProducts() {
  const { toast } = useToast()
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchProducts() {
      try {
        setIsLoading(true)
        // Récupérer les 3 produits les plus récents ou avec les prix les plus bas
        const { data, error } = await supabaseClient
          .from("products")
          .select("*")
          .order("price", { ascending: true })
          .limit(3)

        if (error) {
          throw error
        }

        if (data) {
          setFeaturedProducts(data)
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des produits:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducts()
  }, [])

  const handleAddToCart = (productId: string) => {
    toast({
      title: "Ajouté au panier",
      description: "Le site a été ajouté à votre panier",
    })
  }

  if (isLoading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="overflow-hidden">
            <div className="relative aspect-video overflow-hidden bg-gray-100 animate-pulse"></div>
            <CardContent className="p-4">
              <div className="h-6 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="h-4 bg-gray-100 rounded animate-pulse w-3/4"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {featuredProducts.map((product) => (
        <Card key={product.id} className="overflow-hidden">
          <div className="relative aspect-video overflow-hidden">
            <Image
              src={product.image_url || "/placeholder.svg?height=100&width=150"}
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
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}