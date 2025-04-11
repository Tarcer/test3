import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import type { CartItem } from "@/lib/cart"

interface OrderSummaryProps {
  items: CartItem[]
  total: number
}

export default function OrderSummary({ items, total }: OrderSummaryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Résumé de la commande</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between">
              <span>
                {item.name} {item.quantity > 1 && `(x${item.quantity})`}
              </span>
              <span>{(item.price * item.quantity).toFixed(2)} €</span>
            </div>
          ))}
          <Separator />
          <div className="flex items-center justify-between font-medium">
            <span>Total</span>
            <span>{total.toFixed(2)} €</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
