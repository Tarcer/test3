import { notFound } from "next/navigation"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getProductById } from "@/lib/services/product-service"
import AddToCartButton from "@/components/add-to-cart-button"
import ProductEarningsCalculator from "@/components/product-earnings-calculator"

interface ProductPageProps {
  params: {
    id: string
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = params
  const productResult = await getProductById(id)

  if (!productResult.success || !productResult.data) {
    notFound()
  }

  const product = productResult.data

  return (
    <div className="container py-8 md:py-12">
      <div className="grid gap-8 md:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
          <Image
            src={product.image_url || "/placeholder.svg?height=600&width=600"}
            alt={product.name}
            fill
            className="object-cover"
            priority
          />
        </div>
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{product.name}</h1>
            <p className="mt-2 text-xl font-semibold">{product.price} €</p>
          </div>
          <p className="text-muted-foreground">{product.description}</p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <AddToCartButton
              productId={product.id}
              productName={product.name}
              productPrice={product.price}
              productImage={product.image_url}
            />
          </div>
        </div>
      </div>

      <div className="mt-12">
        <Tabs defaultValue="details">
          <TabsList>
            <TabsTrigger value="details">Détails</TabsTrigger>
            <TabsTrigger value="earnings">Revenus potentiels</TabsTrigger>
          </TabsList>
          <TabsContent value="details" className="mt-4">
            <Card>
              <CardContent className="pt-6">
                <div className="prose max-w-none">
                  <h3>Description détaillée</h3>
                  <p>{product.long_description || product.description}</p>
                  <h3>Caractéristiques</h3>
                  <ul>
                    {product.features?.map((feature: string, index: number) => <li key={index}>{feature}</li>) || (
                      <>
                        <li>Accès à vie aux mises à jour</li>
                        <li>Support technique inclus</li>
                        <li>Documentation complète</li>
                      </>
                    )}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="earnings" className="mt-4">
            <Card>
              <CardContent className="pt-6">
                <ProductEarningsCalculator productPrice={product.price} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
