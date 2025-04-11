"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function AdminStats() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Ventes Mensuelles</CardTitle>
        <CardDescription>Évolution des ventes au cours des 12 derniers mois</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full rounded-md border">
          {/* Placeholder for chart */}
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-muted-foreground">Graphique des ventes mensuelles</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
