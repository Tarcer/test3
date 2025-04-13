"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

interface AffiliateStatsProps {
  data: any
  isLoading: boolean
}

export default function AffiliateStats({ data, isLoading }: AffiliateStatsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-5 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-4 w-32 mt-2" />
              <div className="mt-4 flex text-xs">
                <div className="flex-1">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-3 w-12 mt-1" />
                </div>
                <div className="flex-1">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-3 w-12 mt-1" />
                </div>
                <div className="flex-1">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-3 w-12 mt-1" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="py-6 text-center">
          <p className="text-muted-foreground">Aucune donnée d'affiliation disponible.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Filleuls Totaux</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.counts.total}</div>
          <p className="text-xs text-muted-foreground">Tous niveaux confondus</p>
          <div className="mt-4 flex text-xs">
            <div className="flex-1">
              <p className="font-medium">Niveau 1</p>
              <p className="text-muted-foreground">{data.counts.level1} filleuls</p>
            </div>
            <div className="flex-1">
              <p className="font-medium">Niveau 2</p>
              <p className="text-muted-foreground">{data.counts.level2} filleuls</p>
            </div>
            <div className="flex-1">
              <p className="font-medium">Niveau 3</p>
              <p className="text-muted-foreground">{data.counts.level3} filleuls</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Commissions Totales</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.commissions.total.toFixed(2)} €</div>
          <p className="text-xs text-muted-foreground">Toutes commissions confondues</p>
          <div className="mt-4 flex text-xs">
            <div className="flex-1">
              <p className="font-medium">Niveau 1 (1%)</p>
              <p className="text-muted-foreground">{data.commissions.level1.toFixed(2)} €</p>
            </div>
            <div className="flex-1">
              <p className="font-medium">Niveau 2 (0.5%)</p>
              <p className="text-muted-foreground">{data.commissions.level2.toFixed(2)} €</p>
            </div>
            <div className="flex-1">
              <p className="font-medium">Niveau 3 (0.25%)</p>
              <p className="text-muted-foreground">{data.commissions.level3.toFixed(2)} €</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Taux de Conversion</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {data.counts.total > 0 ? ((data.counts.level1 / data.counts.total) * 100).toFixed(1) : "0.0"}%
          </div>
          <p className="text-xs text-muted-foreground">Estimation basée sur vos filleuls actifs</p>
          <div className="mt-4">
            <div className="text-xs">
              <p className="font-medium">Code de parrainage</p>
              <p className="text-muted-foreground">{data.referralCode}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
