"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getPendingDeposits, confirmDeposit, rejectDeposit, getDepositStats } from "@/lib/services/deposit-service"
import { formatCurrency, formatDate } from "@/lib/utils"

export default function AdminDepositsPage() {
  const [deposits, setDeposits] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  const fetchDeposits = async () => {
    setIsLoading(true)
    try {
      const result = await getPendingDeposits()
      if (result.success) {
        setDeposits(result.data)
      }

      const statsResult = await getDepositStats()
      if (statsResult.success) {
        setStats(statsResult.data)
      }
    } catch (error) {
      console.error("Error fetching deposits:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDeposits()
  }, [])

  const handleConfirm = async (id: string) => {
    try {
      const result = await confirmDeposit(id)
      if (result.success) {
        toast({
          title: "Dépôt confirmé",
          description: "Le dépôt a été confirmé avec succès.",
        })
        fetchDeposits()
      } else {
        toast({
          title: "Erreur",
          description: result.error || "Une erreur est survenue lors de la confirmation du dépôt",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error confirming deposit:", error)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la confirmation du dépôt",
        variant: "destructive",
      })
    }
  }

  const handleReject = async (id: string) => {
    try {
      const result = await rejectDeposit(id)
      if (result.success) {
        toast({
          title: "Dépôt rejeté",
          description: "Le dépôt a été rejeté avec succès.",
        })
        fetchDeposits()
      } else {
        toast({
          title: "Erreur",
          description: result.error || "Une erreur est survenue lors du rejet du dépôt",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error rejecting deposit:", error)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors du rejet du dépôt",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gestion des dépôts</h1>
        <p className="mt-2 text-muted-foreground">Validez manuellement les demandes de dépôt des utilisateurs</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Instructions de validation</CardTitle>
          <CardDescription>Comment valider les dépôts manuels</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
              <div>
                <h3 className="font-medium">Vérification des transactions</h3>
                <p className="text-sm text-muted-foreground">
                  Vérifiez que le hash de transaction fourni par l'utilisateur est valide et que le montant correspond à
                  celui déclaré.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <h3 className="font-medium">Confirmation</h3>
                <p className="text-sm text-muted-foreground">
                  Une fois la transaction vérifiée, confirmez le dépôt pour créditer le compte de l'utilisateur.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
              <div>
                <h3 className="font-medium">Rejet</h3>
                <p className="text-sm text-muted-foreground">
                  Si la transaction est invalide ou ne correspond pas au montant déclaré, rejetez le dépôt.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Dépôts en attente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingCount}</div>
              <p className="text-xs text-muted-foreground">Montant total: {formatCurrency(stats.totalPending)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Dépôts confirmés</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.confirmedCount}</div>
              <p className="text-xs text-muted-foreground">Montant total: {formatCurrency(stats.totalConfirmed)}</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Dépôts en attente</CardTitle>
          <CardDescription>Confirmez ou rejetez les demandes de dépôt</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Chargement...</p>
          ) : deposits.length === 0 ? (
            <p>Aucun dépôt en attente.</p>
          ) : (
            <div className="rounded-md border">
              <div className="grid grid-cols-6 gap-4 p-4 font-medium">
                <div>Date</div>
                <div>Utilisateur</div>
                <div>Montant</div>
                <div>Transaction</div>
                <div>Statut</div>
                <div>Actions</div>
              </div>
              {deposits.map((deposit) => (
                <div key={deposit.id} className="grid grid-cols-6 gap-4 border-t p-4">
                  <div className="flex items-center">{formatDate(deposit.created_at)}</div>
                  <div>
                    <div className="font-medium">{deposit.users?.name}</div>
                    <div className="text-sm text-muted-foreground">{deposit.users?.email}</div>
                  </div>
                  <div className="flex items-center font-medium">{formatCurrency(deposit.amount)}</div>
                  <div className="flex items-center">
                    {deposit.transaction_hash ? (
                      <span className="truncate text-xs">{deposit.transaction_hash}</span>
                    ) : (
                      <span className="text-xs text-muted-foreground">Non spécifié</span>
                    )}
                  </div>
                  <div className="flex items-center">
                    <Badge variant="outline">En attente</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-green-600"
                      onClick={() => handleConfirm(deposit.id)}
                    >
                      <CheckCircle className="mr-1 h-3 w-3" />
                      Confirmer
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive"
                      onClick={() => handleReject(deposit.id)}
                    >
                      <XCircle className="mr-1 h-3 w-3" />
                      Rejeter
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
