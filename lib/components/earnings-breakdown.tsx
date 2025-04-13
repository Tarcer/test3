"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function EarningsBreakdown() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Répartition des Revenus</CardTitle>
        <CardDescription>Analyse détaillée de vos différentes sources de revenus</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="h-[300px] w-full rounded-md border">
            {/* Placeholder for chart */}
            <div className="flex h-full items-center justify-center">
              <p className="text-sm text-muted-foreground">Graphique de répartition des revenus</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="rounded-lg border p-4">
              <h3 className="font-medium">Revenus des Sites Web</h3>
              <p className="mt-2 text-2xl font-bold">1,093.49 €</p>
              <p className="text-sm text-muted-foreground">87.8% de vos revenus totaux</p>
              <div className="mt-2 h-2 w-full rounded-full bg-muted">
                <div className="h-2 w-[87.8%] rounded-full bg-primary"></div>
              </div>
            </div>
            <div className="rounded-lg border p-4">
              <h3 className="font-medium">Commissions d'Affiliation</h3>
              <p className="mt-2 text-2xl font-bold">152.40 €</p>
              <p className="text-sm text-muted-foreground">12.2% de vos revenus totaux</p>
              <div className="mt-2 h-2 w-full rounded-full bg-muted">
                <div className="h-2 w-[12.2%] rounded-full bg-green-500"></div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
