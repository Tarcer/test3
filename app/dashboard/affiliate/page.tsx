"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Copy } from "lucide-react"
import { useAuth } from "@/lib/supabase/auth"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import AffiliateStats from "@/components/affiliate-stats"
import AffiliateNetwork from "@/components/affiliate-network"

export default function AffiliatePage() {
  const [affiliateData, setAffiliateData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    const fetchAffiliateData = async () => {
      if (!user) return

      try {
        const response = await fetch(`/api/user/affiliates?userId=${user.id}`)

        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`)
        }

        const data = await response.json()

        if (data.success) {
          setAffiliateData(data.data)
        } else {
          console.error("Erreur lors de la récupération des données d'affiliation:", data.error)
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des données d'affiliation:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAffiliateData()
  }, [user])

  const handleCopyLink = () => {
    if (affiliateData?.referralUrl) {
      navigator.clipboard.writeText(affiliateData.referralUrl)
      toast({
        title: "Lien copié",
        description: "Le lien d'affiliation a été copié dans le presse-papiers",
      })
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Programme d'Affiliation</h1>
        <p className="mt-2 text-muted-foreground">
          Parrainez des utilisateurs et gagnez des commissions sur leurs achats
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Votre Lien d'Affiliation</CardTitle>
          <CardDescription>Partagez ce lien pour parrainer de nouveaux utilisateurs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            {isLoading ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                    value={affiliateData?.referralUrl || ""}
                    readOnly
                  />
                </div>
                <Button variant="outline" size="icon" onClick={handleCopyLink}>
                  <Copy className="h-4 w-4" />
                  <span className="sr-only">Copier</span>
                </Button>
              </div>
            )}
            <p className="text-sm text-muted-foreground">
              Gagnez 1% sur les achats de vos filleuls directs, 0.5% sur les achats des filleuls de niveau 2, et 0.25%
              sur les achats des filleuls de niveau 3.
            </p>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="stats" className="space-y-4">
        <TabsList>
          <TabsTrigger value="stats">Statistiques</TabsTrigger>
          <TabsTrigger value="network">Mon Réseau</TabsTrigger>
        </TabsList>
        <TabsContent value="stats" className="space-y-4">
          <AffiliateStats data={affiliateData} isLoading={isLoading} />
        </TabsContent>
        <TabsContent value="network" className="space-y-4">
          <AffiliateNetwork data={affiliateData} isLoading={isLoading} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
