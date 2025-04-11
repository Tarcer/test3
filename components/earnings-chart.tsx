"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function EarningsChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenus Quotidiens</CardTitle>
        <CardDescription>Évolution de vos revenus quotidiens sur les 30 derniers jours</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full rounded-md border">
          {/* Placeholder for chart */}
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-muted-foreground">Graphique des revenus quotidiens</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
