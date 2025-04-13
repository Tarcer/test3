import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Search } from "lucide-react"
import TransactionsList from "@/components/transactions-list"

export default function TransactionsPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
        <p className="mt-2 text-muted-foreground">Gérez et suivez toutes les transactions sur la plateforme</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Rechercher par ID, utilisateur ou montant..." className="pl-8" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Label htmlFor="date-from" className="text-sm">
            Du:
          </Label>
          <Input id="date-from" type="date" className="w-auto" />
        </div>
        <div className="flex items-center gap-2">
          <Label htmlFor="date-to" className="text-sm">
            Au:
          </Label>
          <Input id="date-to" type="date" className="w-auto" />
        </div>
        <Button>Filtrer</Button>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">Toutes</TabsTrigger>
          <TabsTrigger value="purchases">Achats</TabsTrigger>
          <TabsTrigger value="earnings">Revenus</TabsTrigger>
          <TabsTrigger value="withdrawals">Retraits</TabsTrigger>
          <TabsTrigger value="commissions">Commissions</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="space-y-4">
          <TransactionsList type="all" />
        </TabsContent>
        <TabsContent value="purchases" className="space-y-4">
          <TransactionsList type="purchases" />
        </TabsContent>
        <TabsContent value="earnings" className="space-y-4">
          <TransactionsList type="earnings" />
        </TabsContent>
        <TabsContent value="withdrawals" className="space-y-4">
          <TransactionsList type="withdrawals" />
        </TabsContent>
        <TabsContent value="commissions" className="space-y-4">
          <TransactionsList type="commissions" />
        </TabsContent>
      </Tabs>
    </div>
  )
}
