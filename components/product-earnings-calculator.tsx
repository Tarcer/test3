"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"

interface ProductEarningsCalculatorProps {
  productPrice: number
}

export default function ProductEarningsCalculator({ productPrice }: ProductEarningsCalculatorProps) {
  const [price, setPrice] = useState(productPrice)
  const [dailyEarnings, setDailyEarnings] = useState(0)
  const [totalEarnings, setTotalEarnings] = useState(0)
  const [netProfit, setNetProfit] = useState(0)
  const [roi, setRoi] = useState(0)

  useEffect(() => {
    const daily = price / 45
    setDailyEarnings(daily)
    setTotalEarnings(daily * 360)

    // Net profit after 10% withdrawal fee
    const gross = daily * 360
    const fee = gross * 0.1
    const net = gross - fee
    setNetProfit(net)

    // ROI calculation
    setRoi((net / price) * 100)
  }, [price])

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Prix d'achat fixe</Label>
              <div className="text-2xl font-bold">{price.toFixed(2)} €</div>
              <p className="text-sm text-muted-foreground">
                Ce calculateur vous montre les revenus que vous recevrez pour ce site web.
              </p>
            </div>
            <div className="space-y-2">
              <Label>Période de rémunération</Label>
              <p className="text-sm text-muted-foreground">360 jours (fixe)</p>
            </div>
            <div className="space-y-2">
              <Label>Frais de retrait</Label>
              <p className="text-sm text-muted-foreground">10% sur chaque retrait</p>
            </div>
          </div>
          <div className="space-y-6">
            <div className="rounded-lg border p-4">
              <h3 className="font-medium">Revenu quotidien</h3>
              <p className="mt-2 text-2xl font-bold text-primary">{dailyEarnings.toFixed(2)} €</p>
            </div>
            <div className="rounded-lg border p-4">
              <h3 className="font-medium">Revenu total (360 jours)</h3>
              <p className="mt-2 text-2xl font-bold">{totalEarnings.toFixed(2)} €</p>
            </div>
            <div className="rounded-lg border p-4">
              <h3 className="font-medium">Profit net (après frais)</h3>
              <p className="mt-2 text-2xl font-bold text-green-600">{netProfit.toFixed(2)} €</p>
              <p className="text-sm text-muted-foreground">ROI: {roi.toFixed(2)}%</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
