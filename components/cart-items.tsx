"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Trash2, Minus, Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useCart } from "@/lib/cart"

export default function CartItems() {
  const { items, removeItem, updateQuantity, getTotal } = useCart()
  const { toast } = useToast()

  const handleRemoveItem = (id: string, name: string) => {
    removeItem(id)
    toast({
      title: "Article supprimé",
      description: `${name} a été retiré de votre panier`,
    })
  }

  const handleUpdateQuantity = (id: string, quantity: number) => {
    updateQuantity(id, quantity)
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
        <h2 className="text-xl font-semibold">Votre panier est vide</h2>
        <p className="mt-2 text-muted-foreground">Vous n'avez pas encore ajouté de produits à votre panier.</p>
        <Button className="mt-4" asChild>
          <Link href="/products">Parcourir les produits</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {items.map((item) => (
        <div key={item.id} className="flex items-center gap-4 rounded-lg border p-4">
          <div className="relative h-20 w-20 overflow-hidden rounded-md">
            <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
          </div>
          <div className="flex flex-1 flex-col">
            <h3 className="font-medium">{item.name}</h3>
            <p className="text-sm text-muted-foreground">Produit</p>
            <div className="mt-2 flex items-center">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                disabled={item.quantity <= 1}
              >
                <Minus className="h-3 w-3" />
                <span className="sr-only">Diminuer</span>
              </Button>
              <span className="mx-2 w-8 text-center">{item.quantity}</span>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
              >
                <Plus className="h-3 w-3" />
                <span className="sr-only">Augmenter</span>
              </Button>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <p className="font-medium">{item.price} €</p>
            <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(item.id, item.name)}>
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Supprimer</span>
            </Button>
          </div>
        </div>
      ))}
      <div className="mt-4 flex justify-end">
        <p className="text-lg font-bold">Total: {getTotal().toFixed(2)} €</p>
      </div>
    </div>
  )
}
