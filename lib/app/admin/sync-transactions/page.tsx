import { Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { syncMissingTransactions } from "@/lib/services/balance-service"
import { revalidatePath } from "next/cache"

async function SyncTransactionsForm() {
  async function handleSync() {
    "use server"
    const result = await syncMissingTransactions()
    revalidatePath("/admin/sync-transactions")
    return result
  }

  return (
    <form action={handleSync}>
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Cette action va synchroniser les transactions manquantes pour les dépôts confirmés qui n'ont pas de
          transaction de solde correspondante.
        </p>
        <Button type="submit" className="w-full">
          Synchroniser les transactions manquantes
        </Button>
      </div>
    </form>
  )
}

export default function SyncTransactionsPage() {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Synchronisation des transactions</h1>
      <Card>
        <CardHeader>
          <CardTitle>Synchroniser les transactions manquantes</CardTitle>
          <CardDescription>
            Utilisez cette fonction pour créer des transactions de solde pour les dépôts confirmés qui n'en ont pas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div>Chargement...</div>}>
            <SyncTransactionsForm />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}
