import { createServerSupabaseClient } from "@/lib/supabase/server"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"

export default async function ProductsPage() {
  const supabase = await createServerSupabaseClient()

  const { data: products, error } = await supabase.from("products").select("*").order("price", { ascending: true })

  if (error) {
    console.error("Erreur lors de la récupération des produits:", error)
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Nos produits</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products &&
          products.map((product) => (
            <Card key={product.id} className="flex flex-col h-full">
              <CardHeader className="p-0">
                <div className="relative aspect-video w-full">
                  <Image
                    src={product.image_url || "/placeholder.svg?height=200&width=400"}
                    alt={product.name}
                    fill
                    className="object-cover rounded-t-lg"
                  />
                </div>
              </CardHeader>
              <CardContent className="flex-grow p-6">
                <CardTitle className="mb-2">{product.name}</CardTitle>
                <p className="text-muted-foreground mb-4 line-clamp-3">{product.description}</p>
                <p className="text-xl font-bold">{formatCurrency(product.price)}</p>
              </CardContent>
              <CardFooter className="p-6 pt-0">
                <Button asChild className="w-full">
                  <Link href={`/products/${product.id}`}>Voir les détails</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
      </div>
    </div>
  )
}
