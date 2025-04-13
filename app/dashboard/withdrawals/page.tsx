import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { InfoIcon } from "lucide-react"
import WithdrawalForm from "@/components/withdrawal-form"
import WithdrawalHistory from "@/components/withdrawal-history"

export default function WithdrawalsPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Retraits</h1>
        <p className="mt-2 text-muted-foreground">Retirez des fonds de votre compte</p>
      </div>

      <Alert>
        <InfoIcon className="h-4 w-4" />
        <AlertTitle>Processus de retrait manuel</AlertTitle>
        <AlertDescription>
          Les retraits sont traités manuellement par notre équipe. Votre demande sera examinée et traitée dans les 24-48
          heures ouvrables. Les frais de retrait sont de 10% du montant retiré.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="new" className="space-y-4">
        <TabsList>
          <TabsTrigger value="new">Nouveau retrait</TabsTrigger>
          <TabsTrigger value="history">Historique</TabsTrigger>
        </TabsList>
        <TabsContent value="new" className="space-y-4">
          <WithdrawalForm />
        </TabsContent>
        <TabsContent value="history" className="space-y-4">
          <WithdrawalHistory />
        </TabsContent>
      </Tabs>
    </div>
  )
}
