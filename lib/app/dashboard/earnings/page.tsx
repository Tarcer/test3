import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { LineChart, BarChart, PieChart, Wallet } from "lucide-react"
import Link from "next/link"
import EarningsChart from "@/components/earnings-chart"
import EarningsBreakdown from "@/components/earnings-breakdown"

export default function EarningsPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mes Revenus</h1>
        <p className="mt-2 text-muted-foreground">Suivez vos revenus quotidiens et vos commissions d'affiliation</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenus Totaux</CardTitle>
            <LineChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,245.89 €</div>
            <p className="text-xs text-muted-foreground">Depuis votre inscription</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenus Quotidiens</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">42.35 €</div>
            <p className="text-xs text-muted-foreground">Aujourd'hui</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Commissions d'Affiliation</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">152.40 €</div>
            <p className="text-xs text-muted-foreground">Total des commissions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Solde Disponible</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">845.50 €</div>
            <p className="text-xs text-muted-foreground">Disponible pour retrait</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="daily" className="space-y-4">
        <TabsList>
          <TabsTrigger value="daily">Revenus Quotidiens</TabsTrigger>
          <TabsTrigger value="affiliate">Commissions d'Affiliation</TabsTrigger>
          <TabsTrigger value="breakdown">Répartition</TabsTrigger>
        </TabsList>
        <TabsContent value="daily" className="space-y-4">
          <EarningsChart />
        </TabsContent>
        <TabsContent value="affiliate" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Commissions d'Affiliation</CardTitle>
              <CardDescription>Évolution de vos commissions d'affiliation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full rounded-md border">
                {/* Placeholder for chart */}
                <div className="flex h-full items-center justify-center">
                  <p className="text-sm text-muted-foreground">Graphique des commissions d'affiliation</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="breakdown" className="space-y-4">
          <EarningsBreakdown />
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button asChild>
          <Link href="/dashboard/withdrawals">Gérer mes retraits</Link>
        </Button>
      </div>
    </div>
  )
}
