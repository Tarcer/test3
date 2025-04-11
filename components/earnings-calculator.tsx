"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"

export default function EarningsCalculator() {
  const [purchasePrice, setPurchasePrice] = useState(500)
  const [dailyEarnings, setDailyEarnings] = useState(0)
  const [totalEarnings, setTotalEarnings] = useState(0)
  const [netProfit, setNetProfit] = useState(0)

  useEffect(() => {
    const daily = purchasePrice / 45
    setDailyEarnings(daily)
    setTotalEarnings(daily * 360)

    // Net profit after 10% withdrawal fee
    const gross = daily * 360
    const fee = gross * 0.1
    setNetProfit(gross - fee)
  }, [purchasePrice])

  const handlePriceChange = (value: number[]) => {
    setPurchasePrice(value[0])
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(e.target.value) || 0
    setPurchasePrice(Math.min(Math.max(value, 100), 2000))
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="purchase-price">Prix d'achat (€)</Label>
              <div className="flex items-center gap-2">
                <Slider
                  id="purchase-price-slider"
                  min={100}
                  max={2000}
                  step={50}
                  value={[purchasePrice]}
                  onValueChange={handlePriceChange}
                />
                <Input
                  id="purchase-price"
                  type="number"
                  min={100}
                  max={2000}
                  value={purchasePrice}
                  onChange={handleInputChange}
                  className="w-24"
                />
              </div>
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
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
