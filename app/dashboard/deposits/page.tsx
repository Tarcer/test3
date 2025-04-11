import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { InfoIcon } from "lucide-react"
import DepositForm from "@/components/deposit-form"
import DepositHistory from "@/components/deposit-history"

export default function DepositsPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dépôts</h1>
        <p className="mt-2 text-muted-foreground">Ajoutez des fonds à votre compte</p>
      </div>

      <Alert>
        <InfoIcon className="h-4 w-4" />
        <AlertTitle>Processus de dépôt manuel</AlertTitle>
        <AlertDescription>
          Les dépôts sont traités manuellement par notre équipe. Veuillez fournir le hash de transaction de votre
          paiement en crypto-monnaie. Votre dépôt sera validé dans les 24 heures ouvrables.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="new" className="space-y-4">
        <TabsList>
          <TabsTrigger value="new">Nouveau dépôt</TabsTrigger>
          <TabsTrigger value="history">Historique</TabsTrigger>
        </TabsList>
        <TabsContent value="new" className="space-y-4">
          <DepositForm />
        </TabsContent>
        <TabsContent value="history" className="space-y-4">
          <DepositHistory />
        </TabsContent>
      </Tabs>
    </div>
  )
}
