"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"

interface AffiliateNetworkProps {
  data: any
  isLoading: boolean
}

export default function AffiliateNetwork({ data, isLoading }: AffiliateNetworkProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Mon Réseau d'Affiliation</CardTitle>
          <CardDescription>Chargement...</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[400px] w-full" />
        </CardContent>
      </Card>
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
    <Card>
      <CardHeader>
        <CardTitle>Mon Réseau d'Affiliation</CardTitle>
        <CardDescription>Visualisez vos filleuls et leurs performances</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="level1" className="space-y-4">
          <TabsList>
            <TabsTrigger value="level1">Niveau 1 (1%)</TabsTrigger>
            <TabsTrigger value="level2">Niveau 2 (0.5%)</TabsTrigger>
            <TabsTrigger value="level3">Niveau 3 (0.25%)</TabsTrigger>
          </TabsList>
          <TabsContent value="level1" className="space-y-4">
            <ReferralList referrals={data.referrals.level1} />
          </TabsContent>
          <TabsContent value="level2" className="space-y-4">
            <ReferralList referrals={data.referrals.level2} />
          </TabsContent>
          <TabsContent value="level3" className="space-y-4">
            <ReferralList referrals={data.referrals.level3} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

function ReferralList({ referrals }: { referrals: any[] }) {
  if (!referrals || referrals.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Aucun filleul trouvé à ce niveau.</p>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <div className="grid grid-cols-4 gap-4 p-4 font-medium">
        <div>Nom</div>
        <div>Email</div>
        <div>Date d'inscription</div>
        <div>Statut</div>
      </div>
      {referrals.map((referral) => (
        <div key={referral.id} className="grid grid-cols-4 gap-4 border-t p-4">
          <div>
            <div className="font-medium">{referral.name}</div>
          </div>
          <div className="flex items-center">{referral.email}</div>
          <div className="flex items-center">{new Date(referral.created_at).toLocaleDateString()}</div>
          <div className="flex items-center">
            <Badge variant="default">Actif</Badge>
          </div>
        </div>
      ))}
    </div>
  )
}
